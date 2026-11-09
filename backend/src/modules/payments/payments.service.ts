import { config } from "../../config.js";
import { ConflictError, HttpError, NotFoundError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { notifyDepositPaid } from "./payments.emails.js";
import { activeProvider, type ProviderStatus } from "./payments.provider.js";
import { getProgramSettings } from "./payments.settings.js";

/** Configuration publique : le site n'affiche le bouton « Payer l'acompte » que si `enabled`. */
export async function paymentConfig() {
  const provider = activeProvider();
  const { depositTnd } = await getProgramSettings();
  return { enabled: !!provider && depositTnd > 0, depositTnd, mode: provider?.name ?? null };
}

/**
 * Lance le paiement de l'acompte d'une demande du client connecté et renvoie l'adresse de paiement.
 * Refusé si la demande n'est pas à lui (404), déjà inscrite / archivée ou déjà payée (409).
 */
export async function startDeposit(userId: number, registrationId: string) {
  const provider = activeProvider();
  const { depositTnd } = await getProgramSettings();
  if (!provider || depositTnd <= 0) throw new HttpError(503, "Le paiement en ligne n'est pas disponible pour le moment.");

  const registration = await prisma.registration.findFirst({
    where: { id: registrationId, userId },
    select: {
      id: true, firstName: true, lastName: true, email: true, phone: true, status: true,
      formations: { select: { formation: { select: { name: true } } } },
      payments: { where: { status: "paid" }, select: { id: true } },
    },
  });
  if (!registration) throw new NotFoundError("Demande introuvable");
  if (registration.payments.length) throw new ConflictError("L'acompte de cette demande est déjà payé.");
  if (registration.status === "inscrit") throw new ConflictError("Votre inscription est déjà confirmée.");
  if (registration.status === "archive") throw new ConflictError("Cette demande est archivée : contactez l'équipe.");

  const amountMillimes = Math.round(depositTnd * 1000);
  const payment = await prisma.payment.create({
    data: { registrationId, userId, amountMillimes, provider: provider.name },
  });
  try {
    const names = registration.formations.map((f) => f.formation.name).join(", ");
    const { ref, payUrl } = await provider.init({
      amountMillimes,
      orderId: payment.id,
      description: `Acompte formation ${names || "Defenders"} — ${registration.firstName} ${registration.lastName}`.slice(0, 250),
      payer: registration,
      returnUrl: `${config.siteUrl}/paiement/retour`,
    });
    await prisma.payment.update({ where: { id: payment.id }, data: { providerRef: ref } });
    return { payUrl, paymentId: payment.id, amountTnd: depositTnd };
  } catch (err) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "failed" } });
    throw err;
  }
}

/**
 * Enregistre le résultat d'un paiement. Idempotent : un paiement déjà payé ne change plus
 * (le prestataire peut appeler plusieurs fois, le payeur peut recharger la page de retour).
 * Payé → la demande passe au statut « inscrit » (place réservée), ce qui valide aussi un éventuel parrainage.
 */
export async function settle(providerRef: string, status: ProviderStatus) {
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { providerRef }, select: { id: true, status: true, registrationId: true } });
    if (!payment) throw new NotFoundError("Paiement introuvable");
    if (payment.status === "paid" || status === "pending" || payment.status === status) {
      return { status: payment.status, registrationId: payment.registrationId, justPaid: false };
    }
    await tx.payment.update({ where: { id: payment.id }, data: { status, paidAt: status === "paid" ? new Date() : null } });
    if (status === "paid") await tx.registration.update({ where: { id: payment.registrationId }, data: { status: "inscrit" } });
    return { status, registrationId: payment.registrationId, justPaid: status === "paid" };
  });
  if (result.justPaid) {
    void notifyDepositPaid(result.registrationId).catch((err) => console.error("[paiement] e-mails non envoyés", err));
  }
  return { status: result.status, registrationId: result.registrationId };
}

/** Vérifie auprès du prestataire puis enregistre (retour du payeur et webhook Konnect). */
export async function verify(providerRef: string) {
  const payment = await prisma.payment.findUnique({ where: { providerRef }, select: { provider: true, status: true, registrationId: true } });
  if (!payment) throw new NotFoundError("Paiement introuvable");
  if (payment.status === "paid") return { status: payment.status, registrationId: payment.registrationId };
  const provider = activeProvider();
  if (!provider || provider.name !== payment.provider) return { status: payment.status, registrationId: payment.registrationId };
  return settle(providerRef, await provider.status(providerRef));
}

/** Paiements du client (pour afficher « Acompte payé » sur ses demandes). */
export function listMine(userId: number) {
  return prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, registrationId: true, status: true, amountMillimes: true, createdAt: true, paidAt: true },
  });
}

/** Suivi des paiements pour l'équipe, avec les totaux encaissés. */
export async function listForAdmin() {
  const [payments, paid] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
      select: {
        id: true, status: true, provider: true, providerRef: true, amountMillimes: true, createdAt: true, paidAt: true,
        registration: {
          select: {
            id: true, firstName: true, lastName: true, email: true, phone: true,
            formations: { select: { formation: { select: { name: true } } } },
          },
        },
      },
    }),
    prisma.payment.aggregate({ where: { status: "paid" }, _sum: { amountMillimes: true }, _count: true }),
  ]);
  return {
    payments: payments.map(({ registration: { formations, ...r }, ...p }) => ({ ...p, registration: { ...r, formations: formations.map((f) => f.formation.name) } })),
    totals: { paidCount: paid._count, paidMillimes: paid._sum.amountMillimes ?? 0 },
  };
}
