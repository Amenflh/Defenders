import nodemailer from "nodemailer";
import { config } from "../config.js";
import type { Contact } from "./contacts.js";

type AttachmentPayload = {
  filename: string;
  contentType: string;
  base64: string;
};

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

  await transporter.sendMail({
    from: `"Defenders Fitness Academy" <${config.smtp.user}>`,
    to: config.smtp.contactTo,
    replyTo: contact.email,
    subject: `Nouvelle demande - ${contact.firstName} ${contact.lastName}`,
    text,
    attachments: attachment ? [{
      filename: attachment.filename,
      content: Buffer.from(attachment.base64, "base64"),
      contentType: attachment.contentType,
    }] : [],
  });
  return true;
}
