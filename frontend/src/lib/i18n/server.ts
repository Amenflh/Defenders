import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { getTextOverrides } from "../settings";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import { dictionaries } from "./dictionaries";
import { applyOverrides } from "./overrides";

/** Langue du visiteur (cookie posé par le sélecteur de langue), français par défaut. */
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
});

/** Textes du site dans la langue active, avec les modifications faites dans l'admin. */
export const getDictionary = cache(async () => {
  const locale = await getLocale();
  return { locale, t: applyOverrides(dictionaries[locale], (await getTextOverrides())[locale]) };
});
