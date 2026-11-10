import type { Locale } from "./i18n/config";
import { bannerPhotos, footballPhotos, personalPhotos, pilatesPhotos, type Photo } from "./images";

/**
 * HISTORIQUE DES FORMATIONS — CONTENU PROVISOIRE.
 *
 * Les sessions ci-dessous sont des exemples en attendant les détails réels des formations récentes
 * (dates exactes, lieux, nombre de stagiaires, photos et vidéos). Remplacez chaque entrée par les
 * informations réelles, puis passez HISTORY_PROVISIONAL à false pour retirer la mention « en cours de mise à jour ».
 *
 * Photos : ajoutez les images dans public/pics/<dossier>/ puis importez-les dans lib/images.ts.
 * Vidéos : déposez les fichiers .mp4 dans public/videos/ et indiquez leur chemin dans « video ».
 */
export const HISTORY_PROVISIONAL = true;

/** Activités suivies dans l'historique (slug des formations + filière sécurité). */
export type HistoryActivity = "football" | "pilates" | "personal-training" | "securite";

type Localized = Record<Locale, string>;

export type HistoryEntry = {
  id: string;
  activity: HistoryActivity;
  /** Date de la session (AAAA-MM-JJ). */
  date: string;
  title: Localized;
  place: Localized;
  participants: number;
  photos: Photo[];
  video?: string;
};

export const ACTIVITY_LABELS: Record<HistoryActivity, Localized> = {
  football: { fr: "Football", en: "Football", ar: "كرة القدم" },
  pilates: { fr: "Fitness · Pilates", en: "Fitness · Pilates", ar: "اللياقة · بيلاتس" },
  "personal-training": { fr: "Personal Trainer", en: "Personal Trainer", ar: "مدرب شخصي" },
  securite: { fr: "Sécurité", en: "Security", ar: "الأمن" },
};

const hammamet: Localized = { fr: "Hammamet", en: "Hammamet", ar: "الحمامات" };
const nabeul: Localized = { fr: "Nabeul", en: "Nabeul", ar: "نابل" };

export const history: HistoryEntry[] = [
  {
    id: "football-2026-09",
    activity: "football",
    date: "2026-09-18",
    title: { fr: "Préparation physique football — Promotion 2", en: "Football physical preparation — Class 2", ar: "الإعداد البدني لكرة القدم — الدفعة 2" },
    place: nabeul,
    participants: 18,
    photos: [footballPhotos[1]],
  },
  {
    id: "football-2026-06",
    activity: "football",
    date: "2026-06-12",
    title: { fr: "Formation d'entraîneurs de football — Promotion 1", en: "Football coach training — Class 1", ar: "تكوين مدربي كرة القدم — الدفعة 1" },
    place: hammamet,
    participants: 24,
    photos: [footballPhotos[0], footballPhotos[1]],
  },
  {
    id: "pilates-2026-08",
    activity: "pilates",
    date: "2026-08-07",
    title: { fr: "Pilates Matwork — Level 1", en: "Pilates Matwork — Level 1", ar: "بيلاتس على البساط — المستوى 1" },
    place: hammamet,
    participants: 10,
    photos: [pilatesPhotos[2]],
  },
  {
    id: "pilates-2026-04",
    activity: "pilates",
    date: "2026-04-20",
    title: { fr: "Pilates Matwork & Reformer — Level 1 & 2", en: "Pilates Matwork & Reformer — Level 1 & 2", ar: "بيلاتس على البساط والريفورمر — المستويان 1 و2" },
    place: { fr: "Sunset Studio, Lac 1", en: "Sunset Studio, Lac 1", ar: "سانسيت ستوديو، البحيرة 1" },
    participants: 12,
    photos: [pilatesPhotos[0], pilatesPhotos[1]],
    video: "/videos/2-Video by defenders_fitness_academy.mp4",
  },
  {
    id: "personal-2026-10",
    activity: "personal-training",
    date: "2026-10-03",
    title: { fr: "Personal Fitness Trainer — Promotion 2", en: "Personal Fitness Trainer — Class 2", ar: "مدرب لياقة شخصي — الدفعة 2" },
    place: hammamet,
    participants: 16,
    photos: [bannerPhotos[0], bannerPhotos[3]],
  },
  {
    id: "personal-2026-03",
    activity: "personal-training",
    date: "2026-03-14",
    title: { fr: "Personal Fitness Trainer Certification — 7 certificats", en: "Personal Fitness Trainer Certification — 7 certificates", ar: "شهادة مدرب لياقة شخصي — 7 شهادات" },
    place: hammamet,
    participants: 20,
    photos: [personalPhotos[0], bannerPhotos[2]],
    video: "/videos/1-Video by defenders_fitness_academy.mp4",
  },
  {
    id: "securite-2026-07",
    activity: "securite",
    date: "2026-07-05",
    title: { fr: "Agents de sécurité & protection rapprochée", en: "Security officers & close protection", ar: "أعوان الأمن والحماية المقرّبة" },
    place: hammamet,
    participants: 30,
    photos: [bannerPhotos[4], bannerPhotos[5]],
  },
];

/** Historique trié du plus récent au plus ancien, éventuellement limité à une activité. */
export function historyFor(activity?: string): HistoryEntry[] {
  return history
    .filter((entry) => !activity || entry.activity === activity)
    .sort((a, b) => b.date.localeCompare(a.date));
}
