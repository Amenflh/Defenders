import type { Discipline } from "./disciplines.js";

export type Session = {
  id: string;
  discipline: Discipline;
  title: string;
  /** 1 = lundi … 7 = dimanche */
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  start: string;
  end: string;
  format: "Théorie" | "Pratique" | "Atelier" | "Évaluation";
  level: "Tous niveaux" | "Débutant" | "Intermédiaire" | "Avancé";
};

/**
 * Planning hebdomadaire type.
 * EXEMPLE À REMPLACER par le planning réel du centre.
 */
export const planning: Session[] = [
  { id: "pil-1", discipline: "pilates", title: "Fondamentaux du Pilates Mat", day: 1, start: "09:00", end: "11:00", format: "Pratique", level: "Débutant" },
  { id: "pil-2", discipline: "pilates", title: "Anatomie & biomécanique", day: 2, start: "14:00", end: "16:00", format: "Théorie", level: "Tous niveaux" },
  { id: "pil-3", discipline: "pilates", title: "Reformer : progressions", day: 4, start: "09:00", end: "11:30", format: "Pratique", level: "Intermédiaire" },
  { id: "pil-4", discipline: "pilates", title: "Construire une séance", day: 6, start: "10:00", end: "12:00", format: "Atelier", level: "Avancé" },

  { id: "foot-1", discipline: "football", title: "Méthodologie de l'entraînement", day: 1, start: "14:00", end: "16:00", format: "Théorie", level: "Tous niveaux" },
  { id: "foot-2", discipline: "football", title: "Séances terrain : jeu réduit", day: 3, start: "16:00", end: "18:30", format: "Pratique", level: "Intermédiaire" },
  { id: "foot-3", discipline: "football", title: "Préparation physique du footballeur", day: 5, start: "09:00", end: "11:00", format: "Théorie", level: "Tous niveaux" },
  { id: "foot-4", discipline: "football", title: "Analyse vidéo & tactique", day: 6, start: "14:00", end: "16:00", format: "Atelier", level: "Avancé" },

  { id: "pt-1", discipline: "personal-training", title: "Physiologie de l'effort", day: 2, start: "09:00", end: "11:00", format: "Théorie", level: "Tous niveaux" },
  { id: "pt-2", discipline: "personal-training", title: "Musculation : technique & sécurité", day: 3, start: "09:00", end: "11:30", format: "Pratique", level: "Débutant" },
  { id: "pt-3", discipline: "personal-training", title: "Nutrition & composition corporelle", day: 4, start: "14:00", end: "16:00", format: "Théorie", level: "Intermédiaire" },
  { id: "pt-4", discipline: "personal-training", title: "Coaching client & programmation", day: 5, start: "14:00", end: "16:30", format: "Atelier", level: "Avancé" },
  { id: "pt-5", discipline: "personal-training", title: "Évaluation pratique", day: 7, start: "10:00", end: "12:00", format: "Évaluation", level: "Tous niveaux" },
];
