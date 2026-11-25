import { site } from "./site";

/**
 * Coordonnées et liens affichés sur tout le site : ceux saisis dans l'admin (Paramètres › Coordonnées),
 * sinon les valeurs par défaut de site.ts. Même forme que `site` pour les composants.
 */
type Link = { label: string; href: string };
export type Contacts = {
  phone: Link;
  phone2: Link;
  email: Link;
  securityEmail: Link;
  whatsapp: Link;
  messenger: Link;
  address: { lines: string[]; href: string };
  facebook: Link & { videos: string };
  instagram: Link;
  linkedin: Link;
  approval: string;
  documents: { rules: string; otdav: string; exclusivityPost: string };
  securityPortal: string;
  tunisianSecurityAcademy: { facebook: string; videos: string; phone: Link; trainingPhone: Link; email: Link; address: string[]; instagram: string };
};

/** Champs modifiables dans l'admin (clé du réglage → libellé). */
export const CONTACT_FIELDS: { key: string; label: string; group: "general" | "tsa" | "documents" }[] = [
  { key: "phone", label: "Téléphone principal", group: "general" },
  { key: "phone2", label: "Deuxième téléphone", group: "general" },
  { key: "whatsapp", label: "WhatsApp (numéro ; vide : deuxième téléphone)", group: "general" },
  { key: "email", label: "E-mail principal", group: "general" },
  { key: "securityEmail", label: "E-mail sécurité", group: "general" },
  { key: "address", label: "Adresse", group: "general" },
  { key: "mapUrl", label: "Lien Google Maps", group: "general" },
  { key: "facebook", label: "Page Facebook", group: "general" },
  { key: "instagram", label: "Page Instagram", group: "general" },
  { key: "linkedin", label: "Page LinkedIn", group: "general" },
  { key: "messenger", label: "Lien Messenger", group: "general" },
  { key: "tsaPhone", label: "Téléphone TSA", group: "tsa" },
  { key: "tsaPhone2", label: "Téléphone formations TSA", group: "tsa" },
  { key: "tsaEmail", label: "E-mail TSA", group: "tsa" },
  { key: "tsaAddress", label: "Adresse TSA", group: "tsa" },
  { key: "tsaFacebook", label: "Page Facebook TSA", group: "tsa" },
  { key: "tsaInstagram", label: "Page Instagram TSA", group: "tsa" },
  { key: "securityPortal", label: "Portail Defenders Security Protection", group: "tsa" },
  { key: "rulesUrl", label: "Règlement intérieur (PDF)", group: "documents" },
  { key: "otdavUrl", label: "Certificat OTDAV (image)", group: "documents" },
  { key: "exclusivityPost", label: "Publication « exclusivité nationale »", group: "documents" },
];

const tel = (label: string): Link => ({ label, href: `tel:${label.replace(/[^\d+]/g, "")}` });
const mail = (label: string): Link => ({ label, href: `mailto:${label}` });

export function contactsFrom(settings: Record<string, unknown>): Contacts {
  const text = (key: string, fallback: string) => {
    const value = settings[key];
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  };
  const link = (key: string, fallback: string) => {
    const value = text(key, fallback);
    return /^(https?:\/\/|\/(?!\/))/i.test(value) ? value : fallback;
  };
  const lines = (value: string) => value.split(",").map((line) => line.trim()).filter(Boolean);
  const tsa = site.tunisianSecurityAcademy;
  const phone2 = text("phone2", site.phone2.label);
  const facebook = link("facebook", site.facebook.href);
  const instagram = link("instagram", site.instagram.href);
  const tsaFacebook = link("tsaFacebook", tsa.facebook);
  const address = text("address", site.address.lines.join(", "));

  return {
    phone: tel(text("phone", site.phone.label)),
    phone2: tel(phone2),
    email: mail(text("email", site.email.label)),
    securityEmail: mail(text("securityEmail", site.securityEmail.label)),
    whatsapp: { label: site.whatsapp.label, href: `https://wa.me/${text("whatsapp", phone2).replace(/\D/g, "")}` },
    messenger: { label: site.messenger.label, href: link("messenger", site.messenger.href) },
    address: {
      lines: lines(address),
      href: link("mapUrl", address === site.address.lines.join(", ") ? site.address.href : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`),
    },
    facebook: { label: site.facebook.label, href: facebook, videos: facebook === site.facebook.href ? site.facebook.videos : facebook },
    instagram: { label: instagram === site.instagram.href ? site.instagram.label : `@${instagram.replace(/\/+$/, "").split("/").pop()}`, href: instagram },
    linkedin: { label: site.linkedin.label, href: link("linkedin", site.linkedin.href) },
    approval: text("approval", site.approval),
    documents: {
      rules: link("rulesUrl", site.documents.rules),
      otdav: link("otdavUrl", site.documents.otdav),
      exclusivityPost: link("exclusivityPost", site.documents.exclusivityPost),
    },
    securityPortal: link("securityPortal", site.securityPortal),
    tunisianSecurityAcademy: {
      facebook: tsaFacebook,
      videos: tsaFacebook === tsa.facebook ? tsa.videos : tsaFacebook,
      phone: tel(text("tsaPhone", tsa.phone.label)),
      trainingPhone: tel(text("tsaPhone2", tsa.trainingPhone.label)),
      email: mail(text("tsaEmail", tsa.email.label)),
      address: lines(text("tsaAddress", tsa.address.join(", "))),
      instagram: link("tsaInstagram", ""),
    },
  };
}

/** Remplace, dans un texte, les coordonnées par défaut par celles de l'admin (réponses de l'assistant). */
export function replaceDefaultContacts(text: string, contacts: Contacts): string {
  const defaults = contactsFrom({});
  const pairs: [string, string][] = [
    [defaults.whatsapp.href, contacts.whatsapp.href],
    [defaults.phone.label, contacts.phone.label],
    [defaults.phone2.label, contacts.phone2.label],
    [defaults.email.href, contacts.email.href],
    [defaults.email.label, contacts.email.label],
    [defaults.securityEmail.label, contacts.securityEmail.label],
    [defaults.address.lines.join(", "), contacts.address.lines.join(", ")],
    [defaults.address.href, contacts.address.href],
    [defaults.messenger.href, contacts.messenger.href],
    [defaults.facebook.videos, contacts.facebook.videos],
    [defaults.facebook.href, contacts.facebook.href],
    [defaults.instagram.href, contacts.instagram.href],
    [defaults.tunisianSecurityAcademy.facebook, contacts.tunisianSecurityAcademy.facebook],
    [defaults.approval, contacts.approval],
  ];
  return pairs.reduce((out, [from, to]) => (from && from !== to ? out.split(from).join(to) : out), text);
}
