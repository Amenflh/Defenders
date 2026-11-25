import "server-only";
import { cache } from "react";
import type { HeroClip } from "@/components/HomeHeroVideo";
import type { Academy } from "./academies";
import { getFormations, type Trainer, type VideoLink } from "./formations";
import { localize, type Translations } from "./formation-i18n";
import type { HistoryEntry } from "./history";
import { getLocale } from "./i18n/server";
import { apiFetch } from "./session";
import { isFacebookVideo } from "./video";

/** Équipe, galerie, vidéos, témoignages et historique : tout est géré dans l'admin. */

async function load<T>(path: string, key: string): Promise<T[]> {
  const res = await apiFetch(path).catch(() => null);
  if (!res?.ok) return [];
  return ((await res.json()) as Record<string, T[]>)[key] ?? [];
}

export type TeamMember = Trainer & { academy: Academy | null; formations: { id: number; name: string; slug: string; academy: Academy }[] };

export const getTeam = cache(async (academy: Academy): Promise<TeamMember[]> => {
  const locale = await getLocale();
  return (await load<TeamMember>(`/api/trainers?academy=${academy}`, "trainers")).map((trainer) => localize(trainer, locale));
});

export type SiteMedia = { id: number; type: "image" | "video"; url: string; title: string; category: string; academy: Academy | null };

/** Médias d'un emplacement (galerie, temoignage, accueil, videos, bandeau), communs aux deux académies compris. */
export const getSiteMedia = cache(async (category: string, academy?: Academy): Promise<SiteMedia[]> =>
  load<SiteMedia>(`/api/media?category=${category}${academy ? `&academy=${academy}` : ""}`, "media"),
);

/** Photos et vidéos de la galerie d'une académie. */
export async function getGallery(academy: Academy) {
  const media = await getSiteMedia("galerie", academy);
  return {
    photos: media.filter((m) => m.type === "image").map((m) => ({ src: m.url, alt: m.title })),
    videos: media.filter((m) => m.type === "video").map((m): VideoLink => ({ url: m.url, title: m.title, layout: "portrait" })),
  };
}

/** Vidéos de fond du haut de page d'une académie. */
export async function getAcademyClips(academy: Academy): Promise<HeroClip[]> {
  return (await getSiteMedia("accueil", academy))
    .filter((m) => m.type === "video")
    .map((m): HeroClip => isFacebookVideo(m.url)
      ? { type: "facebook", url: m.url, layout: "landscape", label: m.title }
      : { type: "video", src: m.url, label: m.title });
}

type ApiHistoryEntry = Omit<HistoryEntry, "activityLabel" | "accent"> & { translations?: Translations };

/** Historique publié, dans la langue du visiteur, avec le nom de la formation concernée. */
export const getHistory = cache(async (academy?: Academy): Promise<HistoryEntry[]> => {
  const [locale, entries, formations] = await Promise.all([
    getLocale(),
    load<ApiHistoryEntry>(`/api/history${academy ? `?academy=${academy}` : ""}`, "entries"),
    getFormations(),
  ]);
  const bySlug = new Map((formations ?? []).map((f) => [f.slug, f]));
  return entries.map((entry) => {
    const shown = { ...localize(entry, locale) } as ApiHistoryEntry;
    delete shown.translations; // déjà appliquées : inutile de les envoyer au navigateur
    const formation = bySlug.get(entry.activity);
    return {
      ...shown,
      activityLabel: formation ? localize(formation, locale).name : entry.activity,
      accent: formation?.accent ?? "gold",
    };
  });
});
