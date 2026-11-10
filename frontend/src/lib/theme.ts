/** Thème d'affichage : sombre (charte d'origine, par défaut) ou clair. */
export const THEMES = ["dark", "light"] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_COOKIE = "dfa_theme";
export const isTheme = (value: unknown): value is Theme => value === "dark" || value === "light";
