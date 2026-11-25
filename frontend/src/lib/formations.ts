import "server-only";
import { backendUrl } from "./api";
import { isCacheablePublicGet } from "./public-cache";
import { publicGet } from "./session";
import type { Academy } from "./academies";
import type { Translations } from "./formation-i18n";
import { type Accent, visualFor } from "./formation-visuals";

/** Formation telle que renvoyée par l'API (contenu modifiable dans /admin/formations). */
export type Formation = {
  id: number;
  slug: string;
  name: string;
  headline: string;
  summary: string;
  durationLabel: string | null;
  priceTnd: number | null;
  status: "draft" | "published" | "archived";
  position: number;
  level: "tous_niveaux" | "debutant" | "intermediaire" | "avance" | null;
  levelLabel: string | null;
  intro: string[];
  objectives: string[];
  prerequisites: string[];
  audience: string[];
  careers: string[];
  modules: { title: string; text: string }[];
  facts: { label: string; value: string }[];
  coverUrl: string | null;
  galleryUrls: string[];
  accent: string;
  academy: Academy;
  location: string;
  /** Informations pratiques (certificats, hébergement, modalités…). */
  practical: string;
  contactPhone: string;
  /** Publication ou programme officiel. */
  sourceUrl: string;
  /** Le visuel est une affiche, montrée en entier. */
  coverIsPoster: boolean;
  videos: VideoLink[];
  translations: Translations;
  /** Date unique de la prochaine session (AAAA-MM-JJ), saisie dans l'admin. */
  nextSessionDate: string | null;
  updatedAt: string;
};

export type VideoLink = { url: string; title: string; layout: "portrait" | "square" | "landscape" };
export type MediaItem = { id: number; type: "image" | "video"; url: string; title: string; mimeType: string };
export type Trainer = { id: number; name: string; title: string; bio: string; photoUrl: string | null; translations?: Translations };
export type FormationSession = { id: string; title: string; day: number; start: string; end: string; format: string; level: string };

export type FormationDetail = Formation & { trainers: Trainer[]; media: MediaItem[]; sessions: FormationSession[] };

async function get<T>(path: string): Promise<{ status: number; data?: T }> {
  const load = () => fetch(backendUrl(path), { cache: "no-store", signal: AbortSignal.timeout(5000) });
  // Catalogue public : partagé entre visiteurs via le cache mémoire court (voir public-cache.ts).
  const res = isCacheablePublicGet(path) ? await publicGet(path, load) : await load();
  return { status: res.status, data: res.ok ? ((await res.json()) as T) : undefined };
}

/** Formations publiées (d'une académie ou toutes), dans l'ordre d'affichage. null si l'API est indisponible. */
export async function getFormations(academy?: Academy): Promise<Formation[] | null> {
  try {
    const { data } = await get<{ formations: Formation[] }>("/api/formations");
    return data?.formations.filter((f) => !academy || f.academy === academy) ?? null;
  } catch {
    return null;
  }
}

/** Détail d'une formation publiée : null si elle n'existe pas (ou n'est pas publiée), "unavailable" si l'API ne répond pas. */
export async function getFormation(slug: string): Promise<FormationDetail | null | "unavailable"> {
  try {
    const { status, data } = await get<{ formation: FormationDetail }>(`/api/formations/${encodeURIComponent(slug)}`);
    if (status === 404) return null;
    return data?.formation ?? "unavailable";
  } catch {
    return "unavailable";
  }
}

/** Prix lisible : « 850 DT », ou null. */
export const formatPrice = (price: number | null) =>
  price === null ? null : `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(price)} DT`;

/** Chiffres clés affichés en tête de page : ceux saisis par l'admin, sinon durée / niveau / prix. */
export function keyFacts(f: Formation, labels = { duration: "Durée", level: "Niveau", price: "Tarif", location: "Lieu" }): { label: string; value: string }[] {
  if (f.facts.length) return f.facts.slice(0, 3);
  const facts = [
    f.durationLabel && { label: labels.duration, value: f.durationLabel },
    f.location && { label: labels.location, value: f.location },
    f.levelLabel && { label: labels.level, value: f.levelLabel },
    formatPrice(f.priceTnd) && { label: labels.price, value: formatPrice(f.priceTnd)! },
  ].filter(Boolean) as { label: string; value: string }[];
  return facts.slice(0, 3);
}

/** Version légère pour les composants client (formulaire, planning, pied de page). */
export type FormationOption = { slug: string; name: string; accent: Accent };
export const toOptions = (list: Formation[]): FormationOption[] => list.map((f) => ({ slug: f.slug, name: f.name, accent: visualFor(f.accent).accent }));

/** Cases « formation » des formulaires d'inscription (page Contact, inscription express après une vidéo). */
export function trainingOptions(formations: { slug: string; name: string; accent?: string | null }[]) {
  const dots: Record<string, string> = { pilates: "bg-pilates", football: "bg-football", personal: "bg-personal" };
  return formations.map((f) => ({ value: f.slug, label: f.name, dot: dots[f.accent ?? ""] ?? "bg-gold" }));
}
