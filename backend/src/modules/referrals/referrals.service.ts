import { randomInt } from "node:crypto";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { getProgramSettings } from "../payments/payments.settings.js";

/** Lettres et chiffres sans ambiguïté à la lecture (pas de 0/O, 1/I/L). */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const REFERRAL_CODE = /^[A-Z0-9]{4,16}$/;

/** « Sami Ben Ali » → prénom (6 lettres max) + 4 caractères aléatoires, ex. SAMI7K2Q. */
function generateCode(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] ?? "";
  const base = firstName.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) || "DFA";
  let suffix = "";
  for (let i = 0; i < 4; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return base + suffix;
}

/** Code de parrainage du client, créé à la première demande (réessaie en cas de collision). */
export async function ensureCode(userId: number): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true, referralCode: true } });
  if (user.referralCode) return user.referralCode;
  for (let attempt = 0; ; attempt++) {
    try {
      // « Seulement s'il n'a pas encore de code » : deux appels simultanés ne s'écrasent pas.
      await prisma.user.updateMany({ where: { id: userId, referralCode: null }, data: { referralCode: generateCode(user.name) } });
    } catch (err) {
      // Code déjà pris par un autre compte (contrainte unique) : on réessaie avec un autre.
      if (attempt >= 4) throw err;
      continue;
    }
    const saved = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
    if (saved?.referralCode) return saved.referralCode;
  }
}

type RewardState = "en_attente" | "a_verser" | "verse";
const rewardState = (status: string, grantedAt: Date | null): RewardState => (grantedAt ? "verse" : status === "inscrit" ? "a_verser" : "en_attente");

/** Tableau de bord parrainage du client : son lien, ses filleuls (prénom + initiale seulement) et ses bonus. */
export async function getMine(userId: number) {
  const [code, settings, referred] = await Promise.all([
    ensureCode(userId),
    getProgramSettings(),
    prisma.registration.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, firstName: true, lastName: true, createdAt: true, status: true, referralRewardGrantedAt: true },
    }),
  ]);
  const referrals = referred.map((r) => ({
    id: r.id,
    name: `${r.firstName} ${r.lastName.charAt(0).toUpperCase()}.`,
    createdAt: r.createdAt,
    reward: rewardState(r.status, r.referralRewardGrantedAt),
  }));
  const enrolled = referrals.filter((r) => r.reward !== "en_attente").length;
  const granted = referrals.filter((r) => r.reward === "verse").length;
  return {
    code,
    rewardTnd: settings.referralRewardTnd,
    referrals,
    stats: {
      invited: referrals.length,
      enrolled,
      earnedTnd: enrolled * settings.referralRewardTnd,
      pendingTnd: (enrolled - granted) * settings.referralRewardTnd,
    },
  };
}

/** Prénom du parrain pour la page d'accueil d'un lien /r/CODE (rien d'autre n'est révélé). */
export async function resolve(code: string) {
  const user = await prisma.user.findUnique({ where: { referralCode: code.toUpperCase() }, select: { name: true, role: true } });
  if (!user || user.role !== "client") throw new NotFoundError("Lien de parrainage invalide");
  return { firstName: user.name.trim().split(/\s+/)[0] };
}

/**
 * Parrain d'une nouvelle demande, ou undefined : code inconnu, ou auto-parrainage
 * (même compte ou même e-mail que le parrain) ignorés sans bloquer la demande.
 */
export async function referrerFor(code: string | undefined, registrant: { userId?: number; email: string }): Promise<number | undefined> {
  if (!code || !REFERRAL_CODE.test(code.toUpperCase())) return undefined;
  const referrer = await prisma.user.findUnique({ where: { referralCode: code.toUpperCase() }, select: { id: true, email: true, role: true } });
  if (!referrer || referrer.role !== "client") return undefined;
  if (referrer.id === registrant.userId || referrer.email.toLowerCase() === registrant.email.trim().toLowerCase()) return undefined;
  return referrer.id;
}

/** Suivi pour l'équipe : chaque demande parrainée, son parrain et l'état du bonus. */
export async function listForAdmin() {
  const [settings, rows] = await Promise.all([
    getProgramSettings(),
    prisma.registration.findMany({
      where: { referrerId: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true, createdAt: true, firstName: true, lastName: true, email: true, status: true, referralRewardGrantedAt: true,
        referrer: { select: { id: true, name: true, email: true, phone: true, referralCode: true } },
        formations: { select: { formation: { select: { name: true } } } },
      },
    }),
  ]);
  const referrals = rows.map(({ formations, referralRewardGrantedAt, ...r }) => ({
    ...r,
    formations: formations.map((f) => f.formation.name),
    rewardGrantedAt: referralRewardGrantedAt,
    reward: rewardState(r.status, referralRewardGrantedAt),
  }));
  const due = referrals.filter((r) => r.reward === "a_verser").length;
  return {
    rewardTnd: settings.referralRewardTnd,
    referrals,
    totals: {
      referred: referrals.length,
      enrolled: referrals.filter((r) => r.reward !== "en_attente").length,
      due,
      dueTnd: due * settings.referralRewardTnd,
      referrers: new Set(referrals.map((r) => r.referrer?.id)).size,
    },
  };
}

/** L'équipe marque le bonus comme versé (ou annule) ; seulement pour un filleul inscrit. */
export async function setRewardGranted(registrationId: string, granted: boolean) {
  const row = await prisma.registration.findUnique({ where: { id: registrationId }, select: { referrerId: true, status: true } });
  if (!row?.referrerId) throw new NotFoundError("Parrainage introuvable");
  if (granted && row.status !== "inscrit") throw new BadRequestError("Le bonus se verse quand le filleul est inscrit.");
  const updated = await prisma.registration.update({
    where: { id: registrationId },
    data: { referralRewardGrantedAt: granted ? new Date() : null },
    select: { referralRewardGrantedAt: true, status: true },
  });
  return { rewardGrantedAt: updated.referralRewardGrantedAt, reward: rewardState(updated.status, updated.referralRewardGrantedAt) };
}
