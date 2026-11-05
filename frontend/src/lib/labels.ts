export const STATUS_LABELS: Record<string, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  inscrit: "Inscrit",
  archive: "Archivé",
};

/** Libellés côté client (suivi de ses demandes). */
export const STATUS_CLIENT_LABELS: Record<string, { label: string; text: string; tone: string }> = {
  nouveau: { label: "Demande reçue", text: "Notre équipe va vous contacter très prochainement.", tone: "border-gold/60 text-gold" },
  contacte: { label: "En cours", text: "Nous avons pris contact avec vous.", tone: "border-sky-400/60 text-sky-300" },
  inscrit: { label: "Inscription confirmée", text: "Bienvenue dans la promotion !", tone: "border-football/60 text-football" },
  archive: { label: "Clôturée", text: "Cette demande est clôturée.", tone: "border-line text-mist" },
};

export const PROFILE_LABELS: Record<string, string> = {
  "coach-pro": "Coach professionnel",
  "jeune-diplome": "Jeune diplômé",
  etudiant: "Étudiant",
  reconversion: "Reconversion",
  "demande-info": "Demande générale",
};

export const TRAINING_LABELS: Record<string, string> = {
  pilates: "Pilates",
  football: "Football",
  "personal-training": "Personal Training",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  intensif: "Session intensive",
  semaine: "En semaine",
  "week-end": "Week-end",
  soir: "Soirée",
  "non-precisee": "Non précisée",
};

export const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Tunis" });

/** Jours de la semaine (1 = lundi … 7 = dimanche), comme dans l'API. */
export const DAY_LABELS: Record<number, string> = { 1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi", 6: "Samedi", 7: "Dimanche" };
