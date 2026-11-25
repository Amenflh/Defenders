import { isLocale, type Locale } from "../i18n/config";

/** Paramètre d'adresse de l'aperçu : ?apercu=fr.k3f9 (langue, identifiant du brouillon). */
export const PREVIEW_PARAM = "apercu";
/** En-tête posé par proxy.ts (toujours retiré des requêtes reçues). */
export const PREVIEW_HEADER = "x-dfa-preview";

export const previewValue = (locale: Locale, draftId: string) => `${locale}.${draftId}`;

export function parsePreview(value: string | null | undefined): { locale: Locale; draftId: string } | null {
  const [locale, draftId] = (value ?? "").split(".");
  return isLocale(locale) && /^[\w-]{1,40}$/.test(draftId ?? "") ? { locale, draftId } : null;
}

/** Adresse d'une page du site en mode aperçu. */
export function previewHref(path: string, locale: Locale, draftId: string): string {
  const [rest, hash] = path.split("#");
  const [pathname, search = ""] = rest.split("?");
  const params = new URLSearchParams(search);
  params.set(PREVIEW_PARAM, previewValue(locale, draftId));
  return `${pathname}?${params}${hash ? `#${hash}` : ""}`;
}

/** Messages échangés entre l'admin et l'aperçu (même origine uniquement). */
export type ToPreview =
  | { type: "dfa:refresh" }
  | { type: "dfa:mode"; edit: boolean }
  | { type: "dfa:focus"; ref: string };
export type FromPreview =
  | { type: "dfa:ready"; path: string }
  | { type: "dfa:select"; ref: string; kind: "text" | "image"; path: string }
  | { type: "dfa:refreshed" };
