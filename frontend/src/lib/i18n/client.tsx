"use client";

import { createContext, useContext, useMemo } from "react";
import { contactsFrom, type Contacts } from "../contacts";
import type { Theme } from "../theme";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";
import { applyOverrides, type TextOverrides } from "./overrides";

/** Données du site gérées dans l'admin, utiles aux composants client (recherche, menus, boutons de contact). */
export type SiteData = {
  contacts: Contacts;
  formations: { slug: string; name: string; headline: string; summary: string; academy: "fitness" | "tsa"; href: string }[];
  faqs: { question: string; answer: string }[];
};

const I18nContext = createContext<{ locale: Locale; t: Dictionary }>({ locale: DEFAULT_LOCALE, t: dictionaries[DEFAULT_LOCALE] });
const ThemeContext = createContext<Theme>("dark");
const SiteContext = createContext<SiteData>({ contacts: contactsFrom({}), formations: [], faqs: [] });

/** Transmet la langue, les textes personnalisés, le thème et les données du site aux composants client. */
export function I18nProvider({ locale, overrides, theme = "dark", data, children }: {
  locale: Locale;
  overrides?: TextOverrides;
  theme?: Theme;
  data?: SiteData;
  children: React.ReactNode;
}) {
  const i18n = useMemo(() => ({ locale, t: applyOverrides(dictionaries[locale], overrides) }), [locale, overrides]);
  const content = (
    <I18nContext.Provider value={i18n}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </I18nContext.Provider>
  );
  return data ? <SiteContext.Provider value={data}>{content}</SiteContext.Provider> : content;
}

export const useI18n = () => useContext(I18nContext);

/** Coordonnées, formations publiées et questions fréquentes. */
export const useSiteData = () => useContext(SiteContext);

/** Thème rendu par le serveur (valeur de départ du bouton soleil / lune). */
export const useInitialTheme = () => useContext(ThemeContext);
