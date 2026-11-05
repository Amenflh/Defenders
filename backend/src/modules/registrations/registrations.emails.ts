import { config } from "../../config.js";
import {
  brand,
  button,
  callout,
  chips,
  detailsTable,
  esc,
  escMultiline,
  heading,
  layout,
  logoAttachment,
  paragraph,
  sendMail,
  steps,
  subheading,
} from "../../lib/email.js";
import { prisma } from "../../lib/prisma.js";
import type { RegistrationDto } from "./registrations.service.js";

export type Attachment = { filename: string; contentType: string; base64: string };

const PROFILE_LABELS: Record<string, string> = {
  "coach-pro": "Coach professionnel",
  "jeune-diplome": "Jeune diplômé",
  etudiant: "Étudiant",
  reconversion: "Reconversion",
};

const AVAILABILITY_LABELS: Record<string, string> = {
  intensif: "Session intensive (4 jours)",
  semaine: "En semaine",
  "week-end": "Week-end",
  soir: "Soirée",
};

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short", timeZone: "Africa/Tunis" });

/** Référence courte et lisible (8 premiers caractères de l'identifiant). */
const shortRef = (id: string) => id.slice(0, 8).toUpperCase();
const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;
const formatSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} Ko` : `${(bytes / 1024 / 1024).toFixed(1)} Mo`);

export type RegistrationEmailData = {
  registration: RegistrationDto;
  /** Noms des formations demandées (dans l'ordre d'affichage). */
  formationNames: string[];
  attachment?: { filename: string; size: number };
};

// ---------------------------------------------------------------- Équipe

/** E-mail reçu par l'équipe : tout ce qu'il faut pour rappeler le candidat, sans ouvrir le site. */
export function renderAdminEmail({ registration: r, formationNames, attachment }: RegistrationEmailData) {
  const fullName = `${r.firstName} ${r.lastName}`;
  const adminUrl = `${config.siteUrl}/admin`;

  const content = `
    ${heading("Nouvelle demande d'inscription", esc(fullName))}
    <div style="margin:0 0 22px;">${chips(formationNames)}</div>

    ${detailsTable([
      ["Téléphone", `<a href="${esc(telHref(r.phone))}" style="color:${brand.colors.text};font-weight:bold;">${esc(r.phone)}</a>`],
      ["E-mail", `<a href="mailto:${esc(r.email)}" style="color:${brand.colors.text};">${esc(r.email)}</a>`],
      ["Profil", esc(PROFILE_LABELS[r.profile] ?? r.profile)],
      ["Disponibilité", esc(AVAILABILITY_LABELS[r.availability] ?? r.availability)],
      ["Ville", esc(r.city || "Non précisée")],
      ["Pièce jointe", attachment ? `${esc(attachment.filename)} <span style="color:${brand.colors.muted};">(${formatSize(attachment.size)}, jointe à cet e-mail)</span>` : "Aucune"],
      ["Reçue le", esc(dateFmt.format(r.createdAt))],
      ["Référence", `<span style="font-family:Consolas,monospace;">${shortRef(r.id)}</span>`],
    ])}

    ${r.message ? `${subheading("Message du candidat")}${callout(escMultiline(r.message))}` : ""}

    <div style="margin-top:28px;">
      ${button("Appeler le candidat", telHref(r.phone))}
      ${button("Répondre par e-mail", `mailto:${r.email}?subject=${encodeURIComponent(`Votre demande d'inscription — ${brand.name}`)}`, "secondary")}
    </div>
    ${paragraph(
      `<span style="font-size:13px;color:${brand.colors.muted};">Suivez et mettez à jour le statut de cette demande depuis le <a href="${esc(adminUrl)}" style="color:${brand.colors.text};">tableau de bord admin</a>.</span>`,
    )}`;

  return {
    subject: `Nouvelle demande — ${fullName} · ${formationNames.join(", ")}`,
    html: layout({ title: "Nouvelle demande d'inscription", preheader: `${fullName} · ${formationNames.join(", ")} · ${r.phone}`, content }),
    text: [
      `Nouvelle demande d'inscription — ${fullName}`,
      "",
      `Formation(s) : ${formationNames.join(", ")}`,
      `Téléphone : ${r.phone}`,
      `E-mail : ${r.email}`,
      `Profil : ${PROFILE_LABELS[r.profile] ?? r.profile}`,
      `Disponibilité : ${AVAILABILITY_LABELS[r.availability] ?? r.availability}`,
      `Ville : ${r.city || "Non précisée"}`,
      `Pièce jointe : ${attachment ? attachment.filename : "aucune"}`,
      `Reçue le : ${dateFmt.format(r.createdAt)}`,
      `Référence : ${shortRef(r.id)}`,
      ...(r.message ? ["", "Message :", r.message] : []),
      "",
      `Tableau de bord : ${adminUrl}`,
    ].join("\n"),
  };
}

// ---------------------------------------------------------------- Candidat

/**
 * Accusé de réception envoyé au candidat.
 * Ne reprend volontairement pas son message : l'adresse saisie n'est pas vérifiée,
 * on évite ainsi que le formulaire serve à envoyer un texte arbitraire à un tiers.
 */
export function renderConfirmationEmail({ registration: r, formationNames }: RegistrationEmailData) {
  const content = `
    ${heading("Demande bien reçue", `Merci ${esc(r.firstName)} !`)}
    ${paragraph(`Nous avons bien reçu votre demande d'inscription à <strong>${esc(brand.name)}</strong>. Voici un récapitulatif :`)}

    ${detailsTable([
      ["Formation(s)", esc(formationNames.join(", "))],
      ["Disponibilité", esc(AVAILABILITY_LABELS[r.availability] ?? r.availability)],
      ["Référence", `<span style="font-family:Consolas,monospace;">${shortRef(r.id)}</span>`],
    ])}

    ${subheading("Et maintenant ?")}
    ${steps([
      "Notre équipe étudie votre profil et vos disponibilités.",
      "Un conseiller vous appelle pour répondre à vos questions et vous communiquer les prochaines dates.",
      "Vous confirmez votre place dans la prochaine session.",
    ])}

    ${paragraph("Une question en attendant notre appel ? Contactez-nous directement :")}
    <div>
      ${button("Nous appeler", brand.phones[0].href)}
      ${button("WhatsApp", brand.whatsapp, "secondary")}
    </div>
    ${paragraph(`<span style="font-size:13px;color:${brand.colors.muted};">Vous pouvez aussi suivre votre demande dans « Mon espace » sur <a href="${esc(config.siteUrl)}/mon-espace" style="color:${brand.colors.text};">notre site</a>. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.</span>`)}`;

  return {
    subject: `Votre demande d'inscription — ${brand.name}`,
    html: layout({ title: "Demande d'inscription reçue", preheader: `Récapitulatif de votre demande · ${formationNames.join(", ")}`, content }),
    text: [
      `Bonjour ${r.firstName},`,
      "",
      `Nous avons bien reçu votre demande d'inscription à ${brand.name}.`,
      "",
      `Formation(s) : ${formationNames.join(", ")}`,
      `Disponibilité : ${AVAILABILITY_LABELS[r.availability] ?? r.availability}`,
      `Référence : ${shortRef(r.id)}`,
      "",
      "Notre équipe étudie votre profil et vous appelle pour vous communiquer les prochaines dates.",
      `Une question ? ${brand.phones.map((p) => p.label).join(" / ")} — WhatsApp : ${brand.whatsapp}`,
      "",
      brand.name,
      brand.address,
    ].join("\n"),
  };
}

// ---------------------------------------------------------------- Envoi

/**
 * Envoie la notification à l'équipe (CONTACT_TO) et l'accusé de réception au candidat.
 * Les deux envois sont indépendants : l'échec de l'un n'empêche pas l'autre.
 */
export async function sendRegistrationEmails(registration: RegistrationDto, attachment?: Attachment): Promise<void> {
  if (!config.smtp.user || !config.smtp.pass) {
    console.warn("[e-mail] SMTP non configuré : demande enregistrée, aucun e-mail envoyé");
    return;
  }

  const formations = await prisma.formation.findMany({
    where: { slug: { in: registration.trainings } },
    orderBy: { position: "asc" },
    select: { name: true },
  });
  const file = attachment ? Buffer.from(attachment.base64, "base64") : undefined;
  const data: RegistrationEmailData = {
    registration,
    formationNames: formations.map((f) => f.name),
    attachment: attachment && file ? { filename: attachment.filename, size: file.length } : undefined,
  };

  const admin = renderAdminEmail(data);
  const confirmation = renderConfirmationEmail(data);

  const results = await Promise.allSettled([
    config.smtp.contactTo
      ? sendMail({
          to: config.smtp.contactTo,
          replyTo: registration.email,
          ...admin,
          attachments: [
            ...logoAttachment(),
            ...(attachment && file ? [{ filename: attachment.filename, content: file, contentType: attachment.contentType }] : []),
          ],
        })
      : Promise.reject(new Error("CONTACT_TO non défini")),
    sendMail({ to: registration.email, replyTo: config.smtp.contactTo || brand.email, ...confirmation, attachments: logoAttachment() }),
  ]);

  const [toTeam, toCandidate] = results;
  if (toTeam.status === "rejected") console.error(`[e-mail] notification équipe non envoyée (${registration.id})`, toTeam.reason);
  if (toCandidate.status === "rejected") console.error(`[e-mail] confirmation candidat non envoyée (${registration.id})`, toCandidate.reason);
}
