"use server";

import { cookies } from "next/headers";
import { isTheme, THEME_COOKIE } from "./theme";

/** Mémorise le thème choisi (1 an). */
export async function setThemeAction(theme: string) {
  if (!isTheme(theme)) return;
  (await cookies()).set(THEME_COOKIE, theme, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
