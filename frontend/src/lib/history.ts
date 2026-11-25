import type { Academy } from "./academies";
import type { VideoLink } from "./formations";
import type { Locale } from "./i18n/config";

/** Entrée d'historique, gérée dans l'admin (Historique) et déjà dans la langue du visiteur. */
export type HistoryEntry = {
  id: number;
  academy: Academy;
  /** Slug de la formation ou nom libre. */
  activity: string;
  activityLabel: string;
  accent: string;
  date: string | null;
  status: "course" | "completed";
  title: string;
  description: string;
  place: string;
  participants: number | null;
  medicalFollowUp: boolean;
  photos: string[];
  videos: VideoLink[];
  sources: { url: string; label: string }[];
};

export const HISTORY_STATUS_LABELS: Record<HistoryEntry["status"], Record<Locale, string>> = {
  course: {
    fr: "Programme de formation · réalisation non confirmée",
    en: "Course programme · delivery not confirmed",
    ar: "برنامج تكوين · لم يتم تأكيد انعقاده",
  },
  completed: {
    fr: "Session réalisée",
    en: "Session completed",
    ar: "دورة منجزة",
  },
};
