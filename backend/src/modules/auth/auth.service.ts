import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { errors as joseErrors, jwtVerify, SignJWT } from "jose";
import { config } from "../../config.js";
import { Prisma, type Role } from "../../generated/prisma/client.js";
import { ConflictError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

export type PublicUser = { id: number; email: string; name: string; phone: string; role: Role };
export type Session = { token: string; user: PublicUser; expiresAt: Date };

const BCRYPT_ROUNDS = 12;
// Hash factice : on compare quand même un mot de passe si l'e-mail est inconnu,
// pour que le temps de réponse ne révèle pas quels comptes existent.
const DUMMY_HASH = bcrypt.hashSync("defenders-dummy-password", BCRYPT_ROUNDS);

const publicFields = { id: true, email: true, name: true, phone: true, role: true } as const;
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS);

/** Crée un compte client. L'inscription publique ne peut jamais créer d'admin (issue #28). */
export async function registerClient(input: { email: string; password: string; name: string; phone: string }): Promise<PublicUser> {
  try {
    return await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        phone: input.phone,
        role: "client",
        passwordHash: await hashPassword(input.password),
      },
      select: publicFields,
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new ConflictError("Un compte existe déjà avec cet e-mail", { email: ["Un compte existe déjà avec cet e-mail"] });
    }
    throw err;
  }
}

/** Crée ou met à jour un administrateur (démarrage et script admin:create). */
export async function upsertAdmin(email: string, password: string, name: string): Promise<PublicUser> {
  const passwordHash = await hashPassword(password);
  return prisma.user.upsert({
    where: { email: email.toLowerCase() },
    create: { email: email.toLowerCase(), name, passwordHash, role: "admin" },
    update: { name, passwordHash, role: "admin" },
    select: publicFields,
  });
}

/** Crée le premier admin depuis ADMIN_EMAIL / ADMIN_PASSWORD s'il n'existe aucun admin. */
export async function seedAdmin(): Promise<void> {
  const { email, password, name } = config.adminSeed;
  if ((await prisma.user.count({ where: { role: "admin" } })) > 0) return;
  if (!email || !password) {
    console.warn("[auth] aucun admin en base : définissez ADMIN_EMAIL et ADMIN_PASSWORD, ou lancez `npm run admin:create`.");
    return;
  }
  await upsertAdmin(email, password, name);
  console.info(`[auth] admin initial créé : ${email}`);
}

// ---------------------------------------------------------------- Jetons JWT (issue #30)
//
// Le jeton est un JWT signé (HS256) dont l'identifiant « jti » désigne une session en base.
// - La signature et l'expiration sont vérifiées à chaque requête (jeton falsifié ou expiré → 401).
// - La session en base permet la révocation immédiate (déconnexion), impossible avec un JWT seul.
// - Seule l'empreinte SHA-256 du jti est stockée : une fuite de la base ne donne aucun jeton utilisable.
//
// Claims : sub = id utilisateur, role, jti, iat, exp, iss, aud.

const jwtKey = new TextEncoder().encode(config.jwt.secret);
const JWT_ALG = "HS256";

async function signToken(user: PublicUser, jti: string, expiresAt: Date): Promise<string> {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: JWT_ALG, typ: "JWT" })
    .setSubject(String(user.id))
    .setJti(jti)
    .setIssuedAt()
    .setIssuer(config.jwt.issuer)
    .setAudience(config.jwt.audience)
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(jwtKey);
}

type TokenClaims = { userId: number; jti: string };

/** Vérifie signature, algorithme, émetteur, audience et expiration. null si le jeton est invalide. */
async function verifyToken(token: string, { allowExpired = false } = {}): Promise<TokenClaims | null> {
  try {
    const { payload } = await jwtVerify(token, jwtKey, {
      algorithms: [JWT_ALG],
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      requiredClaims: ["sub", "jti", "exp", "iat"],
      // Pour la déconnexion uniquement : un jeton expiré peut encore fermer sa session.
      ...(allowExpired ? { currentDate: new Date(0) } : {}),
    });
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || typeof payload.jti !== "string") return null;
    return { userId, jti: payload.jti };
  } catch (err) {
    if (err instanceof joseErrors.JOSEError) return null;
    throw err;
  }
}

/** Ouvre une session : JWT signé, seule l'empreinte de son identifiant (jti) est stockée en base. */
export async function openSession(user: PublicUser): Promise<Session> {
  const jti = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + config.sessionTtlHours * 3600_000);
  await prisma.$transaction([
    prisma.authSession.create({ data: { tokenHash: sha256(jti), userId: user.id, expiresAt } }),
    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
    prisma.authSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
  ]);
  return { token: await signToken(user, jti, expiresAt), user, expiresAt };
}

/** Vérifie les identifiants et ouvre une session. null si refusé. */
export async function login(email: string, password: string): Promise<Session | null> {
  const row = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { ...publicFields, passwordHash: true } });
  const valid = await bcrypt.compare(password, row?.passwordHash ?? DUMMY_HASH);
  if (!row || !valid) return null;
  const { passwordHash: _ignored, ...user } = row;
  return openSession(user);
}

/** Utilisateur d'un JWT valide dont la session n'est ni expirée ni révoquée. Le rôle vient de la base. */
export async function findUserByToken(token: string): Promise<PublicUser | null> {
  const claims = await verifyToken(token);
  if (!claims) return null;
  const session = await prisma.authSession.findFirst({
    where: { tokenHash: sha256(claims.jti), userId: claims.userId, expiresAt: { gt: new Date() } },
    select: { user: { select: publicFields } },
  });
  return session?.user ?? null;
}

/** Révoque la session du jeton (même expiré). Un jeton falsifié est ignoré. */
export async function logout(token: string): Promise<void> {
  const claims = await verifyToken(token, { allowExpired: true });
  if (claims) await prisma.authSession.deleteMany({ where: { tokenHash: sha256(claims.jti) } });
}
