import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
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

/** Ouvre une session : jeton aléatoire de 256 bits, seule son empreinte SHA-256 est stockée. */
export async function openSession(user: PublicUser): Promise<Session> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + config.sessionTtlHours * 3600_000);
  await prisma.$transaction([
    prisma.authSession.create({ data: { tokenHash: sha256(token), userId: user.id, expiresAt } }),
    prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
    prisma.authSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
  ]);
  return { token, user, expiresAt };
}

/** Vérifie les identifiants et ouvre une session. null si refusé. */
export async function login(email: string, password: string): Promise<Session | null> {
  const row = await prisma.user.findUnique({ where: { email: email.toLowerCase() }, select: { ...publicFields, passwordHash: true } });
  const valid = await bcrypt.compare(password, row?.passwordHash ?? DUMMY_HASH);
  if (!row || !valid) return null;
  const { passwordHash: _ignored, ...user } = row;
  return openSession(user);
}

export async function findUserByToken(token: string): Promise<PublicUser | null> {
  const session = await prisma.authSession.findFirst({
    where: { tokenHash: sha256(token), expiresAt: { gt: new Date() } },
    select: { user: { select: publicFields } },
  });
  return session?.user ?? null;
}

export async function logout(token: string): Promise<void> {
  await prisma.authSession.deleteMany({ where: { tokenHash: sha256(token) } });
}
