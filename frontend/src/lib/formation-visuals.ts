import { bannerPhotos, footballPhotos, personalPhotos, pilatesPhotos, type Photo } from "./images";

/**
 * Identité visuelle des formations : couleur d'accent et photos fournies avec le site.
 * Le CONTENU (textes, objectifs, programme…) vient de l'API et se modifie dans /admin/formations.
 * Une formation créée par l'admin reçoit l'accent doré et les photos de l'académie, sauf si un visuel
 * lui est attribué (image téléversée).
 */
export type Accent = { text: string; bg: string; border: string; dot: string; borderL: string };

export type FormationVisual = {
  accent: Accent;
  /** Première photo : visuel principal ; les suivantes : galerie de la page. */
  photos: Photo[];
  /** Visuel des cartes (accueil, « découvrez aussi »). */
  cover: Photo;
};

const gold: Accent = { text: "text-gold", bg: "bg-gold", border: "border-gold", dot: "bg-gold", borderL: "border-l-gold" };

const VISUALS: Record<string, FormationVisual> = {
  pilates: {
    accent: { text: "text-pilates", bg: "bg-pilates", border: "border-pilates", dot: "bg-pilates", borderL: "border-l-pilates" },
    photos: pilatesPhotos,
    cover: pilatesPhotos[0],
  },
  football: {
    accent: { text: "text-football", bg: "bg-football", border: "border-football", dot: "bg-football", borderL: "border-l-football" },
    photos: footballPhotos,
    cover: footballPhotos[1],
  },
  personal: {
    accent: { text: "text-personal", bg: "bg-personal", border: "border-personal", dot: "bg-personal", borderL: "border-l-personal" },
    photos: personalPhotos,
    cover: personalPhotos[0],
  },
};

const fallback: FormationVisual = { accent: gold, photos: bannerPhotos.slice(0, 3), cover: bannerPhotos[0] };

/** Visuel par défaut selon la couleur choisie dans l'admin (accent). */
export function visualFor(accent: string): FormationVisual {
  return VISUALS[accent] ?? fallback;
}

/**
 * Classe CSS qui applique la couleur d'une formation (accent choisi dans l'admin) à toute une section
 * (voir globals.css). Les anciens slugs sont aussi reconnus. Sinon : beige.
 */
export function accentClassFor(slugOrAccent: string): string {
  if (/football/.test(slugOrAccent)) return "accent-football";
  if (/pilates|fitness/.test(slugOrAccent)) return "accent-pilates";
  if (/personal/.test(slugOrAccent)) return "accent-personal";
  if (/intervention/.test(slugOrAccent)) return "accent-intervention";
  if (/k9/.test(slugOrAccent)) return "accent-k9";
  if (/protection/.test(slugOrAccent)) return "accent-protection";
  return "";
}
