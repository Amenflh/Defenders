import { ar } from "./ar";
import type { Locale } from "./config";
import { en } from "./en";
import { fr, type Dictionary } from "./fr";

export const dictionaries: Record<Locale, Dictionary> = { fr, en, ar };
export type { Dictionary };
