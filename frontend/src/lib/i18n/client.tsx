"use client";

import { createContext, useContext } from "react";
import type { Theme } from "../theme";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { dictionaries } from "./dictionaries";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);
const ThemeContext = createContext<Theme>("dark");

/** Transmet la langue et le thème (lus côté serveur dans les cookies) aux composants client. */
export function I18nProvider({ locale, theme = "dark", children }: { locale: Locale; theme?: Theme; children: React.ReactNode }) {
  return (
    <LocaleContext.Provider value={locale}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </LocaleContext.Provider>
  );
}

export function useI18n() {
  const locale = useContext(LocaleContext);
  return { locale, t: dictionaries[locale] };
}

/** Thème rendu par le serveur (valeur de départ du bouton soleil / lune). */
export const useInitialTheme = () => useContext(ThemeContext);
