import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { RequestHandler } from "express";
import { config } from "../config.js";
import { pool } from "../db/pool.js";

export type Role = "admin" | "client";
export type User = { id: number; email: string; name: string; phone: string; role: Role };

const USER_COLUMNS = "id, email, name, phone, role";
const BCRYPT_ROUNDS = 12;
// Hash factice : on compare quand même un mot de passe si l'e-mail est inconnu,
// pour que le temps de réponse ne révèle pas quels comptes existent.
const DUMMY_HASH = bcrypt.hashSync("defenders-dummy-password", BCRYPT_ROUNDS);

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export class EmailTakenError extends Error {}

type NewUser = { email: string; password: string; name: string; role: Role; phone?: string };

/** Crée un compte. Lève EmailTakenError si l'e-mail existe déjà. */
export async function createUser({ email, password, name, role, phone = "" }: NewUser): Promise<User> {
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  try {
    const { rows } = await pool.query<User>(
      `INSERT INTO users (email, name, phone, role, password_hash) VALUES (lower($1), $2, $3, $4, $5) RETURNING ${USER_COLUMNS}`,
      [email, name, phone, role, hash],
    );
    return rows[0];
  } catch (err) {
    if ((err as { code?: string }).code === "23505") throw new EmailTakenError(email);
    throw err;
  }
}

/** Crée ou met à jour un admin (script admin:create). */
export async function upsertAdmin(email: string, password: string, name: string): Promise<User> {
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const { rows } = await pool.query<User>(
    `INSERT INTO users (email, name, role, password_hash) VALUES (lower($1), $2, 'admin', $3)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = 'admin'
     RETURNING ${USER_COLUMNS}`,
    [email, name, hash],
  );
  return rows[0];
}

/** Crée le premier admin depuis ADMIN_EMAIL / ADMIN_PASSWORD s'il n'existe aucun admin. */
export async function seedAdmin(): Promise<void> {
  const { email, password, name } = config.adminSeed;
  const { rows } = await pool.query<{ count: string }>("SELECT count(*) FROM users WHERE role = 'admin'");
  if (Number(rows[0].count) > 0) return;
  if (!email || !password) {
    console.warn("[auth] aucun admin en base : définissez ADMIN_EMAIL et ADMIN_PASSWORD, ou lancez `npm run admin:create`.");
    return;
  }
  await upsertAdmin(email, password, name);
  console.info(`[auth] admin initial créé : ${email}`);
}

export type Session = { token: string; user: User; expiresAt: Date };

/** Ouvre une session pour un utilisateur déjà authentifié. */
export async function openSession(user: User): Promise<Session> {
  // Le jeton n'est jamais stocké en clair : seule son empreinte SHA-256 est en base.
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + config.sessionTtlHours * 3600_000);
  await pool.query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [sha256(token), user.id, expiresAt]);
  await pool.query("UPDATE users SET last_login_at = now() WHERE id = $1", [user.id]);
  await pool.query("DELETE FROM sessions WHERE expires_at < now()");
  return { token, user, expiresAt };
}

/** Vérifie les identifiants et ouvre une session. Retourne null si refusé. */
export async function login(email: string, password: string): Promise<Session | null> {
  const { rows } = await pool.query<User & { password_hash: string }>(
    `SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = lower($1)`,
    [email],
  );
  const row = rows[0];
  const valid = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !valid) return null;
  const { password_hash: _ignored, ...user } = row;
  return openSession(user);
}

export async function findUserByToken(token: string): Promise<User | null> {
  const { rows } = await pool.query<User>(
    `SELECT u.id, u.email, u.name, u.phone, u.role FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha256(token)],
  );
  return rows[0] ?? null;
}

export async function logout(token: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE token_hash = $1", [sha256(token)]);
}

export function bearerToken(header: string | undefined): string | null {
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}

/** Renseigne req.user si un jeton valide est fourni, sans rien exiger. */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = bearerToken(req.headers.authorization);
    if (token) req.user = (await findUserByToken(token)) ?? undefined;
    next();
  } catch (err) {
    next(err);
  }
};

/** Exige une session valide (admin ou client). */
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = bearerToken(req.headers.authorization);
    const user = token ? await findUserByToken(token) : null;
    if (!user) {
      res.status(401).json({ error: "Authentification requise" });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/** Exige une session admin. */
export const requireAdmin: RequestHandler = (req, res, next) => {
  void requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err);
    if (req.user?.role !== "admin") {
      res.status(403).json({ error: "Accès réservé aux administrateurs" });
      return;
    }
    next();
  });
};
