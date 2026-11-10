/** Langues du site public : français (par défaut), anglais et arabe (écriture de droite à gauche). */
export const LOCALES = ["fr", "en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";
/** Cookie qui mémorise la langue choisie (1 an). */
export const LOCALE_COOKIE = "dfa_lang";

export const LOCALE_LABELS: Record<Locale, { short: string; name: string }> = {
  fr: { short: "FR", name: "Français" },
  en: { short: "EN", name: "English" },
  ar: { short: "ع", name: "العربية" },
};

export const isLocale = (value: unknown): value is Locale => typeof value === "string" && (LOCALES as readonly string[]).includes(value);
export const dirFor = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr");
/** Locale Intl pour les dates (chiffres latins en arabe tunisien). */
export const intlLocale: Record<Locale, string> = { fr: "fr-FR", en: "en-GB", ar: "ar-TN" };
