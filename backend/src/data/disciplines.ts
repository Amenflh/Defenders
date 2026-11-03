export const DISCIPLINES = ["pilates", "football", "personal-training"] as const;
export type Discipline = (typeof DISCIPLINES)[number];
