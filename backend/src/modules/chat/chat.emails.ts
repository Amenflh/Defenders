import { config } from "../../config.js";
import { brand, button, callout, esc, escMultiline, heading, layout, logoAttachment, paragraph, sendMail } from "../../lib/email.js";

/**
 * Prévient l'équipe qu'un client a écrit dans la discussion.
 * Envoyé une seule fois par série de messages non lus (voir postClientMessage).
 */
export async function notifyTeamOfMessage(client: { name: string; email: string }, body: string): Promise<void> {
  if (!config.smtp.contactTo) return;
  const preview = body.length > 600 ? `${body.slice(0, 600)}…` : body;
  const html = layout({
    title: `Nouveau message de ${client.name}`,
    preheader: preview.slice(0, 120),
    content: `
      ${heading("Nouveau message", esc(client.name))}
      ${paragraph(`${esc(client.name)} (${esc(client.email)}) vous a écrit depuis son espace client :`)}
      ${callout(escMultiline(preview))}
      ${button("Répondre dans l'administration", `${config.siteUrl}/admin?tab=messages`)}
    `,
  });
  await sendMail({
    to: config.smtp.contactTo,
    replyTo: client.email,
    subject: `💬 Nouveau message de ${client.name} — ${brand.name}`,
    html,
    attachments: logoAttachment(),
  });
}
