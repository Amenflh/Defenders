import { config } from "../../config.js";
import { isEmailConfigured, sendMail } from "../../lib/email.js";
import type { SecurityQuoteDto } from "./security-quotes.service.js";

const serviceLabels: Record<string, string> = {
  gardiennage: "Gardiennage",
  evenementiel: "Sécurité événementielle",
  protection: "Protection rapprochée",
  formation: "Formation professionnelle",
  autre: "Autre demande",
};

export async function sendSecurityQuoteEmails(quote: SecurityQuoteDto): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn(`[security-quotes] SMTP non configuré : demande ${quote.id} enregistrée, aucun e-mail envoyé`);
    return;
  }
  if (!config.smtp.securityContactTo) {
    console.warn(`[security-quotes] destinataire non configuré : demande ${quote.id} enregistrée, aucun e-mail envoyé`);
    return;
  }

  const subject = `Demande de devis sécurité · ${quote.id}`;
  const details = [
    `Demande : ${serviceLabels[quote.service] ?? quote.service}`,
    `Contact : ${quote.firstName} ${quote.lastName}`,
    `Entreprise : ${quote.companyName || "Non précisée"}`,
    `E-mail : ${quote.email}`,
    `Téléphone : ${quote.phone}`,
    `Ville : ${quote.city || "Non précisée"}`,
    "",
    quote.message,
    "",
    `Reçue le : ${quote.createdAt.toISOString()}`,
    `Référence : ${quote.id}`,
  ].join("\n");
  const results = await Promise.allSettled([
    sendMail({
      from: `"Defenders Security Protection" <${config.smtp.user}>`,
      to: config.smtp.securityContactTo,
      replyTo: quote.email,
      subject,
      text: details,
    }),
    sendMail({
      from: `"Defenders Security Protection" <${config.smtp.user}>`,
      to: quote.email,
      replyTo: config.smtp.securityContactTo,
      subject: "Votre demande a bien été enregistrée",
      text: [
        `Bonjour ${quote.firstName},`,
        "",
        "Votre demande de devis a bien été enregistrée. L'équipe Defenders Security Protection pourra la consulter et vous recontactera via les coordonnées fournies.",
        "",
        `Référence : ${quote.id}`,
      ].join("\n"),
    }),
  ]);
  if (results[0].status === "rejected") {
    console.error(`[security-quotes] notification équipe non envoyée (${quote.id})`, results[0].reason);
  }
  if (results[1].status === "rejected") {
    console.error(`[security-quotes] confirmation non envoyée (${quote.id})`, results[1].reason);
  }
}
