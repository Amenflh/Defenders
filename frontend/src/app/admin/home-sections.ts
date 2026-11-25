/** Zones de la page d'accueil : activées, masquées et ordonnées dans l'admin. */
export const HOMEPAGE_SECTIONS = [
  { id: "hero", label: "Bannière d'accueil" },
  { id: "branches", label: "Les académies et toutes les formations" },
  { id: "highlights", label: "Ce qui nous distingue" },
  { id: "promotions", label: "Promotions & certificats" },
  { id: "about", label: "À propos" },
  { id: "videos", label: "Vidéos" },
  { id: "security", label: "Sécurité (Tunisian Security Academy)" },
  { id: "formations", label: "Formations" },
  { id: "method", label: "Parcours de formation" },
  { id: "testimonials", label: "Témoignages" },
  { id: "faq", label: "FAQ" },
  { id: "cta", label: "Appel à l'action" },
  { id: "partners", label: "Partenaires" },
] as const;

export type HomepageSection = { id: string; enabled: boolean; order: number };

/** Zones enregistrées, complétées par celles ajoutées depuis (à leur place par défaut). */
export function normalizeHomepageSections(value: unknown): HomepageSection[] {
  const saved = Array.isArray(value) ? value.filter((item): item is HomepageSection =>
    typeof item === "object" && item !== null &&
    "id" in item && typeof item.id === "string" &&
    "enabled" in item && typeof item.enabled === "boolean" &&
    "order" in item && typeof item.order === "number" && Number.isInteger(item.order),
  ) : [];
  return HOMEPAGE_SECTIONS.map((section, index) => {
    const config = saved.find((item) => item.id === section.id);
    return { id: section.id, enabled: config?.enabled ?? true, order: config ? config.order * 20 : index };
  }).sort((a, b) => a.order - b.order).map((section, index) => ({ ...section, order: index }));
}

/** Déplace une zone d'un rang. */
export function moveSection(sections: HomepageSection[], index: number, offset: -1 | 1): HomepageSection[] {
  const target = index + offset;
  if (target < 0 || target >= sections.length) return sections;
  const next = [...sections];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((section, order) => ({ ...section, order }));
}
