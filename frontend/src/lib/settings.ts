import "server-only";
import { cache } from "react";
import { contactsFrom, type Contacts } from "./contacts";
import { localize, type Translations } from "./formation-i18n";
import type { Locale } from "./i18n/config";
import type { TextOverrides } from "./i18n/overrides";
import { apiFetch } from "./session";

export type SiteSettings = Record<string, unknown>;

/**
 * Réglages du site (modifiables dans /admin › Paramètres), lus une seule fois par requête :
 * layout, pied de page et page partagent le même résultat au lieu d'appeler l'API 3 à 4 fois.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const res = await apiFetch("/api/content/settings/site").catch(() => null);
  if (!res?.ok) return {};
  return ((await res.json()) as { value: SiteSettings }).value ?? {};
});

/** Coordonnées et liens du site (admin › Paramètres), identiques sur toutes les pages. */
export const getContacts = cache(async (): Promise<Contacts> => contactsFrom(await getSiteSettings()));

/** Textes du site modifiés dans l'admin, par langue. */
export const getTextOverrides = cache(async (): Promise<Partial<Record<Locale, TextOverrides>>> => {
  const res = await apiFetch("/api/content/settings/texts").catch(() => null);
  if (!res?.ok) return {};
  return ((await res.json()) as { value: Partial<Record<Locale, TextOverrides>> }).value ?? {};
});

export type CmsItem = { id: number; title: string; subtitle: string; body: string; imageUrl: string; linkUrl: string; academy: "fitness" | "tsa" | null; translations?: Translations };

/** Contenus publiés d'une rubrique de l'admin (FAQ, témoignages, promotions, partenaires), dans la langue du visiteur. */
export const getCmsItems = cache(async (section: "faq" | "testimonials" | "promotions" | "partners", locale: Locale): Promise<CmsItem[]> => {
  const res = await apiFetch(`/api/content/items/${section}`).catch(() => null);
  if (!res?.ok) return [];
  return ((await res.json()) as { items: CmsItem[] }).items.map((item) => localize(item, locale));
});

/** Questions fréquentes : celles de l'admin ; en anglais et en arabe, seulement celles qui sont traduites. */
export async function getFaqs(locale: Locale, fallback: readonly { question: string; answer: string }[]): Promise<{ question: string; answer: string }[]> {
  const items = await getCmsItems("faq", locale);
  const shown = locale === "fr" ? items : items.filter((item) => String(item.translations?.[locale]?.title ?? "").trim());
  return shown.length ? shown.map((item) => ({ question: item.title, answer: item.body })) : fallback.map(({ question, answer }) => ({ question, answer }));
}

/** Formations publiées (liste légère), partagées entre la page et le pied de page. */
export const getPublishedFormations = cache(async <T = { id: number; slug: string; name: string }>(): Promise<T[]> => {
  const res = await apiFetch("/api/formations").catch(() => null);
  if (!res?.ok) return [];
  return ((await res.json()) as { formations: T[] }).formations ?? [];
});

/** Valeur texte d'un réglage, ou la valeur par défaut si absente / vide. */
export function settingText(settings: SiteSettings, key: string, fallback = ""): string {
  const value = settings[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

/** Logo global recadré (carré, centré) et anciens fichiers qu'il remplace. */
export const ROUND_LOGO = "/pics/logo-defenders-academy-round.png";
const LEGACY_LOGOS = new Set(["/pics/logo.jpg", "/pics/logo-defenders-academy.jpeg"]);

/**
 * Nom affiché du site : « Defenders Academy » par défaut.
 * L'ancien complément « Fitness Academy » (valeur par défaut de l'admin avant le passage à Defenders Academy)
 * est considéré comme non personnalisé, pour que le nouveau titre global s'affiche partout.
 */
export function brandIdentity(settings: SiteSettings) {
  const brandName = settingText(settings, "brandName", "Defenders");
  const savedDescriptor = settingText(settings, "brandDescriptor", "Academy");
  const brandDescriptor = savedDescriptor === "Fitness Academy" ? "Academy" : savedDescriptor;
  const savedLogo = settingText(settings, "logoUrl");
  // Anciens fichiers du logo (non carrés, rognés dans le cadre rond) : remplacés par la version recadrée.
  const logoUrl = LEGACY_LOGOS.has(savedLogo) ? ROUND_LOGO : savedLogo || undefined;
  return { brandName, brandDescriptor, logoUrl, siteName: `${brandName} ${brandDescriptor}`.trim() };
}
