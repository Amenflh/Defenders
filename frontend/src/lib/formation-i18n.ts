import type { Locale } from "./i18n/config";

/** Traductions saisies dans l'admin : { en: { name: "…" }, ar: { … } }. */
export type Translations = Partial<Record<"en" | "ar", Record<string, unknown>>>;

const filled = (value: unknown) => (typeof value === "string" ? value.trim() !== "" : Array.isArray(value) && value.length > 0);

/**
 * Contenu (formation, formateur, historique, question…) dans la langue du visiteur : chaque champ traduit dans
 * l'admin remplace le texte français ; un champ non traduit reste en français.
 */
export function localize<T extends object>(item: T & { translations?: Translations }, locale: Locale): T {
  const translation = locale === "fr" ? undefined : item.translations?.[locale];
  if (!translation) return item;
  const merged: Record<string, unknown> = { ...item };
  for (const [key, value] of Object.entries(translation)) if (key in item && filled(value)) merged[key] = value;
  return merged as T;
}

export const localizeFormation = localize;
