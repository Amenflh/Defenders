import { config } from "../../config.js";
import { brand, button, chips, detailsTable, esc, heading, layout, logoAttachment, paragraph, sendMail } from "../../lib/email.js";
import { prisma } from "../../lib/prisma.js";

const formatTnd = (millimes: number) => `${(millimes / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 3 })} DT`;

/** Acompte reçu : confirmation au stagiaire et information de l'équipe. */
export async function notifyDepositPaid(registrationId: string): Promise<void> {
  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: {
      firstName: true, lastName: true, email: true, phone: true,
      formations: { select: { formation: { select: { name: true } } } },
      payments: { where: { status: "paid" }, orderBy: { paidAt: "desc" }, take: 1, select: { amountMillimes: true } },
    },
  });
  if (!registration) return;
  const names = registration.formations.map((f) => f.formation.name);
  const amount = formatTnd(registration.payments[0]?.amountMillimes ?? 0);

  const client = layout({
    title: "Votre place est réservée",
    preheader: `Acompte de ${amount} bien reçu.`,
    content: `
      ${heading("Place réservée", `Merci ${esc(registration.firstName)} !`)}
      ${paragraph(`Nous avons bien reçu votre acompte de <strong>${esc(amount)}</strong>. Votre inscription est confirmée.`)}
      <div style="margin:0 0 22px;">${chips(names)}</div>
      ${paragraph("Vos supports de formation sont disponibles dès maintenant dans votre espace. L'équipe vous contactera pour les prochaines étapes.")}
      ${button("Ouvrir mon espace", `${config.siteUrl}/mon-espace`)}
    `,
  });
  const team = layout({
    title: "Acompte reçu",
    preheader: `${registration.firstName} ${registration.lastName} a payé ${amount}.`,
    content: `
      ${heading("Acompte reçu", `${esc(registration.firstName)} ${esc(registration.lastName)}`)}
      ${detailsTable([
        ["Montant", esc(amount)],
        ["Formations", esc(names.join(", ") || "—")],
        ["E-mail", esc(registration.email)],
        ["Téléphone", esc(registration.phone)],
      ])}
      ${paragraph("La demande est passée automatiquement au statut « Inscrit ».")}
      ${button("Voir les paiements", `${config.siteUrl}/admin?tab=paiements`)}
    `,
  });

  await Promise.allSettled([
    sendMail({ to: registration.email, subject: `Votre place est réservée — ${brand.name}`, html: client, attachments: logoAttachment() }),
    config.smtp.contactTo
      ? sendMail({ to: config.smtp.contactTo, replyTo: registration.email, subject: `💳 Acompte reçu : ${registration.firstName} ${registration.lastName} (${amount})`, html: team, attachments: logoAttachment() })
      : Promise.resolve(false),
  ]);
}
