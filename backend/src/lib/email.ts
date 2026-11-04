import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import nodemailer, { type Transporter } from "nodemailer";
import type Mail from "nodemailer/lib/mailer/index.js";
import { config } from "../config.js";

/**
 * Envoi d'e-mails (SMTP) et mise en page commune.
 *
 * Les e-mails sont construits en tableaux avec styles en ligne : c'est la seule mise en page
 * fiable dans Gmail, Outlook (moteur Word) et les applications mobiles. Pas de CSS externe,
 * pas de flexbox, pas d'images de fond.
 */

// ---------------------------------------------------------------- Marque

export const brand = {
  name: "Defenders Fitness Academy",
  tagline: "Centre de formation continue · coaching privé et sciences du sport",
  agreement: "Centre de formation certifié · Agrément n° 21-340-24",
  address: "Avenue Abou Dhabi, 8050 Hammamet, Tunisie",
  phones: [
    { label: "+216 92 204 005", href: "tel:+21692204005" },
    { label: "+216 29 039 493", href: "tel:+21629039493" },
  ],
  whatsapp: "https://wa.me/21629039493",
  email: "direction-dsp@outlook.com",
  facebook: "https://www.facebook.com/DefendersFitnessAcademy",
  instagram: "https://www.instagram.com/defenders_fitness_academy",
  colors: {
    ink: "#0b0b0c",
    ink2: "#151513",
    gold: "#c9a227",
    goldSoft: "#f6efd9",
    text: "#1d1d1b",
    muted: "#6b6b66",
    line: "#e6e3da",
    page: "#f3f1ec",
  },
} as const;

const c = brand.colors;
const FONT = "Arial,Helvetica,sans-serif";

// ---------------------------------------------------------------- Utilitaires

/** Échappe une valeur saisie par un visiteur avant de l'insérer dans le HTML. */
export const esc = (value: unknown) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

/** Texte multiligne saisi par un visiteur → HTML sûr. */
export const escMultiline = (value: string) => esc(value).replace(/\r?\n/g, "<br>");

const LOGO_CID = "defenders-logo";
const logoPath = [join(process.cwd(), "src", "assets", "logo.jpg"), join(process.cwd(), "assets", "logo.jpg")].find(existsSync);
const logo = logoPath ? readFileSync(logoPath) : null;

/** Logo intégré à l'e-mail (pièce jointe « inline ») : s'affiche même si les images distantes sont bloquées. */
export const logoAttachment = (): Mail.Attachment[] =>
  logo ? [{ filename: "defenders-logo.jpg", content: logo, contentType: "image/jpeg", cid: LOGO_CID }] : [];

// ---------------------------------------------------------------- Composants

/** Bouton compatible Outlook (lien en bloc dans une cellule colorée). */
export function button(label: string, href: string, variant: "primary" | "secondary" = "primary"): string {
  const primary = variant === "primary";
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display:inline-table;margin:0 8px 8px 0;">
  <tr><td style="background:${primary ? c.gold : "#ffffff"};border:1px solid ${primary ? c.gold : c.text};">
    <a href="${esc(href)}" style="display:inline-block;padding:13px 22px;font-family:${FONT};font-size:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;text-decoration:none;color:${primary ? c.ink : c.text};">${esc(label)}</a>
  </td></tr>
</table>`;
}

/** Tableau « libellé : valeur ». Les valeurs doivent déjà être échappées. */
export function detailsTable(rows: [label: string, valueHtml: string][]): string {
  const body = rows
    .map(
      ([label, value], i) => `<tr>
      <td style="padding:12px 16px;${i ? `border-top:1px solid ${c.line};` : ""}font-family:${FONT};font-size:12px;letter-spacing:.5px;text-transform:uppercase;color:${c.muted};vertical-align:top;width:34%;">${esc(label)}</td>
      <td style="padding:12px 16px;${i ? `border-top:1px solid ${c.line};` : ""}font-family:${FONT};font-size:15px;line-height:1.5;color:${c.text};vertical-align:top;">${value}</td>
    </tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid ${c.line};border-collapse:collapse;">${body}</table>`;
}

/** Étiquettes (formations demandées…). Les libellés sont échappés ici. */
export const chips = (labels: string[]) =>
  labels
    .map(
      (l) =>
        `<span style="display:inline-block;margin:0 6px 6px 0;padding:6px 12px;background:${c.goldSoft};border:1px solid ${c.gold};font-family:${FONT};font-size:13px;font-weight:bold;color:${c.text};">${esc(l)}</span>`,
    )
    .join("");

export const heading = (eyebrow: string, title: string) => `
  <p style="margin:0 0 8px;font-family:${FONT};font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:${c.gold};">${esc(eyebrow)}</p>
  <h1 style="margin:0 0 20px;font-family:${FONT};font-size:26px;line-height:1.25;color:${c.text};">${title}</h1>`;

export const paragraph = (html: string) =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.65;color:${c.text};">${html}</p>`;

export const subheading = (text: string) =>
  `<h2 style="margin:28px 0 12px;font-family:${FONT};font-size:13px;letter-spacing:1.5px;text-transform:uppercase;color:${c.muted};">${esc(text)}</h2>`;

/** Encadré (citation du message, information importante). */
export const callout = (html: string) =>
  `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="padding:16px 18px;background:${c.page};border-left:3px solid ${c.gold};font-family:${FONT};font-size:15px;line-height:1.6;color:${c.text};">${html}</td></tr></table>`;

/** Liste numérotée d'étapes. */
export function steps(items: string[]): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${items
    .map(
      (item, i) => `<tr>
      <td style="width:34px;padding:0 0 12px;vertical-align:top;">
        <div style="width:24px;height:24px;line-height:24px;text-align:center;background:${c.ink};color:${c.gold};font-family:${FONT};font-size:12px;font-weight:bold;">${i + 1}</div>
      </td>
      <td style="padding:2px 0 12px;font-family:${FONT};font-size:15px;line-height:1.55;color:${c.text};">${item}</td>
    </tr>`,
    )
    .join("")}</table>`;
}

// ---------------------------------------------------------------- Mise en page

/**
 * Gabarit commun : en-tête noir avec logo, contenu sur fond blanc, pied de page avec coordonnées.
 * @param preheader Texte d'aperçu affiché par les messageries à côté de l'objet (invisible dans l'e-mail).
 */
export function layout({ title, preheader, content }: { title: string; preheader: string; content: string }): string {
  const logoCell = logo
    ? `<img src="cid:${LOGO_CID}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;border:0;border-radius:50%;">`
    : "";
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${c.page};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${c.page};">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
        <!-- En-tête -->
        <tr><td style="background:${c.ink};padding:22px 28px;border-bottom:3px solid ${c.gold};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
            <td style="padding-right:14px;vertical-align:middle;">${logoCell}</td>
            <td style="vertical-align:middle;">
              <div style="font-family:${FONT};font-size:18px;font-weight:bold;letter-spacing:4px;text-transform:uppercase;color:#ffffff;">Defenders</div>
              <div style="margin-top:4px;font-family:${FONT};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${c.gold};">Fitness Academy</div>
            </td>
          </tr></table>
        </td></tr>
        <!-- Contenu -->
        <tr><td style="background:#ffffff;padding:32px 28px 28px;">${content}</td></tr>
        <!-- Pied de page -->
        <tr><td style="background:${c.ink2};padding:22px 28px;font-family:${FONT};font-size:12px;line-height:1.7;color:#a9a9a2;">
          <strong style="color:#ffffff;">${brand.name}</strong><br>
          ${esc(brand.agreement)}<br>
          ${esc(brand.address)}<br>
          ${brand.phones.map((p) => `<a href="${p.href}" style="color:#a9a9a2;text-decoration:none;">${p.label}</a>`).join(" · ")}
          · <a href="mailto:${brand.email}" style="color:#a9a9a2;text-decoration:none;">${brand.email}</a><br>
          <a href="${brand.facebook}" style="color:${c.gold};text-decoration:none;">Facebook</a> ·
          <a href="${brand.instagram}" style="color:${c.gold};text-decoration:none;">Instagram</a> ·
          <a href="${brand.whatsapp}" style="color:${c.gold};text-decoration:none;">WhatsApp</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------- Envoi

let transporter: Transporter | null = null;

export const isEmailConfigured = () => Boolean(config.smtp.user && config.smtp.pass);

/** Envoie un e-mail. Retourne false (sans erreur) si le SMTP n'est pas configuré. */
export async function sendMail(message: Mail.Options): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  transporter ??= nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
  await transporter.sendMail({ from: `"${brand.name}" <${config.smtp.user}>`, ...message });
  return true;
}
