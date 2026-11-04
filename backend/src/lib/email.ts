import nodemailer from "nodemailer";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "../config.js";
import type { RegistrationDto } from "../modules/registrations/registrations.service.js";

type AttachmentPayload = {
  filename: string;
  contentType: string;
  base64: string;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);

const logoPath = [
  join(process.cwd(), "src", "assets", "logo.jpg"),
  join(process.cwd(), "assets", "logo.jpg"),
].find((path) => existsSync(path));

const emailLayout = (content: string, title: string) => `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#10110f;font-family:Arial,Helvetica,sans-serif;color:#ece9df;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#10110f;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#181917;border:1px solid #34342f;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid #34342f;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width:72px;vertical-align:middle;">
                      <img src="cid:defenders-logo" width="64" height="64" alt="Defenders Fitness Academy" style="display:block;width:64px;height:64px;border-radius:50%;object-fit:cover;">
                    </td>
                    <td style="vertical-align:middle;">
                      <div style="font-size:12px;line-height:1;text-transform:uppercase;letter-spacing:4px;color:#d7b56d;font-weight:700;">Defenders</div>
                      <div style="margin-top:7px;font-size:18px;font-weight:700;color:#ffffff;">Fitness Academy</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">${content}</td>
            </tr>
            <tr>
              <td style="padding:22px 32px;background:#121310;border-top:1px solid #34342f;color:#a7a7a0;font-size:12px;line-height:1.8;">
                <strong style="color:#ece9df;">Defenders Fitness Academy</strong><br>
                Avenue Abou Dhabi, 8050 Hammamet, Tunisie<br>
                +216 92 204 005 · +216 29 039 493
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

export async function sendContactEmail(contact: Contact, attachment?: AttachmentPayload): Promise<boolean> {
  if (!config.smtp.user || !config.smtp.pass || !config.smtp.contactTo) {
    console.warn("[contact] SMTP non configuré : demande enregistrée, aucun e-mail envoyé");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });

  const text = [
    "Nouvelle demande d'inscription Defenders Fitness Academy",
    "",
    `Nom : ${contact.firstName} ${contact.lastName}`,
    `E-mail : ${contact.email}`,
    `Téléphone : ${contact.phone}`,
    `Ville : ${contact.city || "-"}`,
    `Profil : ${contact.profile}`,
    `Formations : ${contact.trainings.join(", ")}`,
    `Disponibilité : ${contact.availability}`,
    "",
    `Message : ${contact.message || "-"}`,
    "",
    `Demande n° : ${contact.id}`,
  ].join("\n");

  const safeFirstName = escapeHtml(contact.firstName);
  const safeLastName = escapeHtml(contact.lastName);
  const safeEmail = escapeHtml(contact.email);
  const safePhone = escapeHtml(contact.phone);
  const safeCity = escapeHtml(contact.city || "-");
  const safeProfile = escapeHtml(contact.profile);
  const safeTrainings = escapeHtml(contact.trainings.join(", ") || "-");
  const safeAvailability = escapeHtml(contact.availability);
  const safeMessage = escapeHtml(contact.message || "-").replace(/\n/g, "<br>");
  const safeId = escapeHtml(contact.id);

  const adminDetails = [
    ["Nom complet", `${safeFirstName} ${safeLastName}`],
    ["E-mail", `<a href="mailto:${safeEmail}" style="color:#d7b56d;">${safeEmail}</a>`],
    ["Téléphone", `<a href="tel:${escapeHtml(contact.phone.replace(/[^+\d]/g, ""))}" style="color:#d7b56d;">${safePhone}</a>`],
    ["Ville", safeCity],
    ["Profil", safeProfile],
    ["Formation(s)", safeTrainings],
    ["Disponibilité", safeAvailability],
    ["Message", safeMessage],
    ["Demande", safeId],
  ].map(([label, value]) => `
    <tr>
      <td style="padding:13px 14px;border-bottom:1px solid #34342f;color:#a7a7a0;font-size:13px;vertical-align:top;width:145px;">${label}</td>
      <td style="padding:13px 14px;border-bottom:1px solid #34342f;color:#ece9df;font-size:14px;line-height:1.55;vertical-align:top;">${value}</td>
    </tr>`).join("");

  const adminHtml = emailLayout(`
    <div style="margin-bottom:24px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#d7b56d;font-weight:700;">Nouvelle demande reçue</div>
      <h1 style="margin:9px 0 0;font-size:26px;line-height:1.2;color:#ffffff;">${safeFirstName} ${safeLastName}</h1>
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #34342f;border-collapse:collapse;">
      ${adminDetails}
    </table>
    <div style="margin-top:24px;">
      <a href="mailto:${safeEmail}?subject=${encodeURIComponent(`Re: votre demande ${contact.id}`)}" style="display:inline-block;padding:13px 18px;background:#d7b56d;color:#151611;text-decoration:none;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Répondre au candidat</a>
    </div>`, "Nouvelle demande - Defenders Fitness Academy");

  const confirmationHtml = emailLayout(`
    <div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#d7b56d;font-weight:700;">Demande confirmée</div>
    <h1 style="margin:9px 0 18px;font-size:28px;line-height:1.25;color:#ffffff;">Bonjour ${safeFirstName},</h1>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#d9d7cd;">
      Nous avons bien reçu votre demande auprès de <strong style="color:#ffffff;">Defenders Fitness Academy</strong>.
      Notre équipe examine votre profil et vous recontactera prochainement.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;border:1px solid #34342f;background:#20211e;">
      <tr>
        <td style="padding:18px;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#a7a7a0;">Récapitulatif</div>
          <div style="margin-top:8px;font-size:15px;line-height:1.6;color:#ece9df;">
            <strong>Formation :</strong> ${safeTrainings}<br>
            <strong>Disponibilité :</strong> ${safeAvailability}<br>
            <strong>Référence :</strong> ${safeId}
          </div>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.75;color:#d9d7cd;">
      Une question en attendant notre réponse ? Notre équipe est disponible par téléphone ou WhatsApp.
    </p>
    <div style="margin-bottom:4px;">
      <a href="tel:+21692204005" style="display:inline-block;padding:13px 18px;background:#d7b56d;color:#151611;text-decoration:none;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Nous appeler</a>
      <a href="https://wa.me/21629039493" style="display:inline-block;margin-left:8px;padding:12px 17px;border:1px solid #d7b56d;color:#d7b56d;text-decoration:none;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">WhatsApp</a>
    </div>`, "Confirmation de votre demande - Defenders Fitness Academy");

  const logoAttachment = logoPath ? [{
    filename: "defenders-logo.jpg",
    content: readFileSync(logoPath),
    contentType: "image/jpeg",
    cid: "defenders-logo",
  }] : [];

  await transporter.sendMail({
    from: `"Defenders Fitness Academy" <${config.smtp.user}>`,
    to: config.smtp.contactTo,
    replyTo: contact.email,
    subject: `Nouvelle demande - ${contact.firstName} ${contact.lastName}`,
    text,
    html: adminHtml,
    attachments: [...logoAttachment, ...(attachment ? [{
      filename: attachment.filename,
      content: Buffer.from(attachment.base64, "base64"),
      contentType: attachment.contentType,
    }] : [])],
  });

  await transporter.sendMail({
    from: `"Defenders Fitness Academy" <${config.smtp.user}>`,
    to: contact.email,
    replyTo: config.smtp.contactTo,
    subject: "Confirmation de votre demande - Defenders Fitness Academy",
    text: [
      `Bonjour ${contact.firstName},`,
      "",
      "Nous avons bien reçu votre demande auprès de Defenders Fitness Academy.",
      "",
      `Formation(s) souhaitée(s) : ${contact.trainings.join(", ") || "-"}`,
      "Notre équipe étudiera votre demande et vous recontactera prochainement.",
      "",
      "Merci pour votre confiance.",
      "Defenders Fitness Academy",
    ].join("\n"),
    html: confirmationHtml,
    attachments: logoAttachment,
  });
  return true;
}
