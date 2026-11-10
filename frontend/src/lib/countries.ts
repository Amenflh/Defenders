/**
 * Indicatifs téléphoniques proposés dans le formulaire d'inscription (code ISO 3166-1 alpha-2 + indicatif).
 * Les noms des pays sont générés dans la langue du visiteur avec Intl.DisplayNames ; les drapeaux
 * sont des images (les émojis drapeaux ne s'affichent pas sous Windows).
 */
export type Country = { iso: string; dial: string };

/** Pays mis en avant en tête de liste (Tunisie par défaut, voisins et destinations de recrutement). */
export const PRIORITY_COUNTRIES = ["tn", "dz", "ly", "ma", "fr", "sa", "ae", "qa", "kw"];

export const COUNTRIES: Country[] = [
  { iso: "tn", dial: "216" }, { iso: "dz", dial: "213" }, { iso: "ly", dial: "218" }, { iso: "ma", dial: "212" },
  { iso: "mr", dial: "222" }, { iso: "eg", dial: "20" }, { iso: "sd", dial: "249" }, { iso: "fr", dial: "33" },
  { iso: "be", dial: "32" }, { iso: "ch", dial: "41" }, { iso: "lu", dial: "352" }, { iso: "de", dial: "49" },
  { iso: "it", dial: "39" }, { iso: "es", dial: "34" }, { iso: "pt", dial: "351" }, { iso: "nl", dial: "31" },
  { iso: "gb", dial: "44" }, { iso: "ie", dial: "353" }, { iso: "at", dial: "43" }, { iso: "se", dial: "46" },
  { iso: "no", dial: "47" }, { iso: "dk", dial: "45" }, { iso: "fi", dial: "358" }, { iso: "pl", dial: "48" },
  { iso: "cz", dial: "420" }, { iso: "gr", dial: "30" }, { iso: "tr", dial: "90" }, { iso: "mt", dial: "356" },
  { iso: "cy", dial: "357" }, { iso: "ro", dial: "40" }, { iso: "bg", dial: "359" }, { iso: "hu", dial: "36" },
  { iso: "ru", dial: "7" }, { iso: "ua", dial: "380" }, { iso: "sa", dial: "966" }, { iso: "ae", dial: "971" },
  { iso: "qa", dial: "974" }, { iso: "kw", dial: "965" }, { iso: "bh", dial: "973" }, { iso: "om", dial: "968" },
  { iso: "ye", dial: "967" }, { iso: "jo", dial: "962" }, { iso: "lb", dial: "961" }, { iso: "sy", dial: "963" },
  { iso: "iq", dial: "964" }, { iso: "ps", dial: "970" }, { iso: "ir", dial: "98" }, { iso: "sn", dial: "221" },
  { iso: "ci", dial: "225" }, { iso: "ml", dial: "223" }, { iso: "ne", dial: "227" }, { iso: "td", dial: "235" },
  { iso: "cm", dial: "237" }, { iso: "ga", dial: "241" }, { iso: "cg", dial: "242" }, { iso: "cd", dial: "243" },
  { iso: "bf", dial: "226" }, { iso: "gn", dial: "224" }, { iso: "bj", dial: "229" }, { iso: "tg", dial: "228" },
  { iso: "ng", dial: "234" }, { iso: "gh", dial: "233" }, { iso: "ke", dial: "254" }, { iso: "et", dial: "251" },
  { iso: "za", dial: "27" }, { iso: "mg", dial: "261" }, { iso: "mu", dial: "230" }, { iso: "dj", dial: "253" },
  { iso: "km", dial: "269" }, { iso: "so", dial: "252" }, { iso: "us", dial: "1" }, { iso: "ca", dial: "1" },
  { iso: "br", dial: "55" }, { iso: "mx", dial: "52" }, { iso: "ar", dial: "54" }, { iso: "cn", dial: "86" },
  { iso: "jp", dial: "81" }, { iso: "kr", dial: "82" }, { iso: "in", dial: "91" }, { iso: "pk", dial: "92" },
  { iso: "id", dial: "62" }, { iso: "my", dial: "60" }, { iso: "au", dial: "61" },
];

export const flagUrl = (iso: string) => `https://flagcdn.com/w40/${iso}.png`;
