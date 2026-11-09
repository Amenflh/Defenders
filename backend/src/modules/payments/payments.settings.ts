import { prisma } from "../../lib/prisma.js";

/** Clé du réglage (table site_settings), modifiable depuis l'admin via PUT /api/admin/settings/paiements. */
export const PROGRAM_SETTINGS_KEY = "paiements";

export type ProgramSettings = {
  /** Montant de l'acompte en dinars (0 = paiement en ligne désactivé). */
  depositTnd: number;
  /** Bonus versé au parrain pour chaque ami inscrit, en dinars. */
  referralRewardTnd: number;
};

export const DEFAULT_PROGRAM_SETTINGS: ProgramSettings = { depositTnd: 100, referralRewardTnd: 50 };

const amount = (value: unknown, fallback: number) => {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(n) && n >= 0 && n <= 100_000 ? Math.round(n * 1000) / 1000 : fallback;
};

/** Réglages de l'acompte et du parrainage, avec valeurs par défaut si rien n'est enregistré ou si c'est invalide. */
export async function getProgramSettings(): Promise<ProgramSettings> {
  const row = await prisma.siteSetting.findUnique({ where: { key: PROGRAM_SETTINGS_KEY } });
  let saved: Record<string, unknown> = {};
  try {
    saved = row ? (JSON.parse(row.value) as Record<string, unknown>) : {};
  } catch {
    /* réglage corrompu : valeurs par défaut */
  }
  return {
    depositTnd: amount(saved.depositTnd, DEFAULT_PROGRAM_SETTINGS.depositTnd),
    referralRewardTnd: amount(saved.referralRewardTnd, DEFAULT_PROGRAM_SETTINGS.referralRewardTnd),
  };
}
