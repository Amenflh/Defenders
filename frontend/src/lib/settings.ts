import "server-only";
import { cache } from "react";
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
