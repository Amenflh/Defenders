import { divisionCopy, type DivisionCopy } from "../division-copy";
import { internalRules } from "../internal-rules";
import { ar } from "./ar";
import type { Locale } from "./config";
import { en } from "./en";
import { fr, type Dictionary as BaseDictionary } from "./fr";

export type Dictionary = BaseDictionary & { divisions: DivisionCopy; internalRules: (typeof internalRules)[Locale] };

export const dictionaries: Record<Locale, Dictionary> = {
  fr: { ...fr, divisions: divisionCopy.fr, internalRules: internalRules.fr },
  en: { ...en, divisions: divisionCopy.en, internalRules: internalRules.en },
  ar: { ...ar, divisions: divisionCopy.ar, internalRules: internalRules.ar },
};
