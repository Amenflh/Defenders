import type { Discipline } from "./disciplines";

export type FormationContent = {
  slug: string;
  name: string;
  headline: string;
  summary: string;
  durationLabel?: string | null;
  intro: string[];
  facts: { label: string; value: string }[];
  objectives: string[];
  modules: { title: string; text: string }[];
  audience: string[];
  careers: string[];
  coverUrl: string;
  galleryUrls: string[];
  accent: string;
};

export function mergeFormationContent(fallback: Discipline | undefined, formation: FormationContent): Discipline {
  const fallbackPhotos = fallback?.photos ?? [];
  const cover = formation.coverUrl
    ? { src: formation.coverUrl, alt: `Affiche ${formation.name}` }
    : fallbackPhotos[0] ?? { src: "/pics/info.jpg", alt: `Affiche ${formation.name}` };
  const gallery = formation.galleryUrls.length
    ? formation.galleryUrls.map((url, index) => ({ src: url, alt: `Image ${index + 1} de ${formation.name}` }))
    : fallbackPhotos.slice(1);

  const accentName = formation.accent || fallback?.accent.text.replace("text-", "") || "gold";
  return {
    slug: formation.slug as Discipline["slug"],
    name: formation.name,
    headline: formation.headline || fallback?.headline || formation.name,
    summary: formation.summary || fallback?.summary || "",
    intro: formation.intro.length ? formation.intro : fallback?.intro ?? [],
    facts: formation.facts.length
      ? formation.facts
      : formation.durationLabel
        ? [{ label: "Durée", value: formation.durationLabel }]
        : fallback?.facts ?? [],
    objectives: formation.objectives.length ? formation.objectives : fallback?.objectives ?? [],
    modules: formation.modules.length ? formation.modules : fallback?.modules ?? [],
    audience: formation.audience.length ? formation.audience : fallback?.audience ?? [],
    careers: formation.careers.length ? formation.careers : fallback?.careers ?? [],
    photos: [cover, ...gallery],
    cover,
    accent: fallback?.accent ?? { text: `text-${accentName}`, bg: `bg-${accentName}`, border: `border-${accentName}` },
  };
}
