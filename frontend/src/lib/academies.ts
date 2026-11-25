/** Les deux académies. Chaque formation, formateur, média, témoignage et entrée d'historique appartient à l'une d'elles. */
export type Academy = "fitness" | "tsa";
export const ACADEMIES: readonly Academy[] = ["fitness", "tsa"];
export const ACADEMY_PATH: Record<Academy, string> = { fitness: "/fitness-academy", tsa: "/tunisian-security-academy" };
/** Nom dans l'admin. */
export const ACADEMY_NAME: Record<Academy, string> = { fitness: "Defenders Fitness Academy", tsa: "Tunisian Security Academy" };

/** Adresse publique d'une formation : toujours Accueil / Académie / Formation. */
export const formationHref = (f: { slug: string; academy?: Academy | null }) => `${ACADEMY_PATH[f.academy ?? "fitness"]}/formations/${f.slug}`;

/** Couleurs proposées pour une formation (admin). */
export const ACCENTS = [
  { value: "gold", label: "Beige (par défaut)" },
  { value: "pilates", label: "Orange (Pilates)" },
  { value: "football", label: "Rouge (Football)" },
  { value: "personal", label: "Vert militaire (Personal Trainer)" },
  { value: "intervention", label: "Orange (Intervention)" },
  { value: "k9", label: "Turquoise (K9)" },
  { value: "protection", label: "Violet (Protection)" },
] as const;

/** Emplacements d'un média dans le site. */
export const MEDIA_CATEGORIES = [
  { value: "galerie", label: "Galerie de l'académie" },
  { value: "temoignage", label: "Témoignage vidéo" },
  { value: "accueil", label: "Vidéo de fond (haut de page)" },
  { value: "videos", label: "Section « Vidéos » de l'accueil" },
  { value: "bandeau", label: "Bandeau photos de l'accueil" },
  { value: "", label: "Aucun (bibliothèque)" },
] as const;
