/** Types partagés : acompte en ligne, parrainage et ressources (réponses de l'API). */

export type PaymentConfig = { enabled: boolean; depositTnd: number; mode: "konnect" | "simulation" | null };
export type PaymentStatus = "pending" | "paid" | "failed";
export type MyPayment = { id: string; registrationId: string; status: PaymentStatus; amountMillimes: number; createdAt: string; paidAt: string | null };

export type RewardState = "en_attente" | "a_verser" | "verse";
export type MyReferral = {
  code: string;
  rewardTnd: number;
  referrals: { id: string; name: string; createdAt: string; reward: RewardState }[];
  stats: { invited: number; enrolled: number; earnedTnd: number; pendingTnd: number };
};

export type ClientResource = {
  id: number;
  title: string;
  description: string;
  kind: "file" | "link";
  formationId: number | null;
  formation: { id: number; name: string; slug: string } | null;
  mime: string | null;
  size: number | null;
  url: string | null;
  originalName: string | null;
  locked: boolean;
  createdAt: string;
};

/** Cookie posé par un lien /r/CODE : le code est joint à la prochaine demande d'inscription. */
export const REFERRAL_COOKIE = "dfa_ref";
export const REFERRAL_CODE = /^[A-Za-z0-9]{4,16}$/;

export const formatTnd = (amount: number) => `${amount.toLocaleString("fr-FR", { maximumFractionDigits: 3 })} DT`;
export const millimesToTnd = (millimes: number) => formatTnd(millimes / 1000);

export function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} Ko` : `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}
