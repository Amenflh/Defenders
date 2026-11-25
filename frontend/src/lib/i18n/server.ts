import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { markDictionary } from "../preview/markers";
import { getPreview } from "../session";
import { getTextOverrides } from "../settings";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { dictionaries } from "./dictionaries";
import { applyOverrides } from "./overrides";

/** Langue du visiteur (cookie posé par le sélecteur de langue), français par défaut. */
export const getLocale = cache(async (): Promise<Locale> => {
  const preview = await getPreview();
  if (preview) return preview.locale;
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

/** Textes du site dans la langue active, avec les modifications faites dans l'admin. */
export const getDictionary = cache(async () => {
  const [locale, preview, overrides] = await Promise.all([getLocale(), getPreview(), getTextOverrides()]);
  const t = applyOverrides(dictionaries[locale], overrides[locale]);
  return { locale, t: preview ? markDictionary(t) : t };
});
