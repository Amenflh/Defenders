/** Formulaire d'une formation : champs et conversion vers l'API (utilisée à l'enregistrement et par l'aperçu en direct). */

const FIELDS = [
  "name", "slug", "headline", "summary", "status", "level", "durationLabel", "priceTnd", "position", "coverUrl", "nextSessionDate",
  "intro", "objectives", "prerequisites", "audience", "careers", "modules", "facts",
  "academy", "accent", "location", "practical", "contactPhone", "sourceUrl", "coverIsPoster", "videos", "galleryUrls", "trainerIds",
] as const;
/** Champs traduits, saisis sous les noms « en.name », « ar.name »… */
const TRANSLATED = ["name", "headline", "summary", "durationLabel", "location", "practical", "intro", "objectives", "prerequisites", "audience", "careers", "modules", "facts"] as const;
const ALL_FIELDS = [...FIELDS, ...TRANSLATED.flatMap((k) => [`en.${k}`, `ar.${k}`])];

/** Une ligne = un élément ; lignes vides ignorées. */
const lines = (v: string) => v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
/** « Titre | texte » sur chaque ligne. */
const pairs = <K extends string, V extends string>(v: string, k: K, val: V) =>
  lines(v).map((l) => {
    const [a, ...rest] = l.split("|");
    return { [k]: a.trim(), [val]: rest.join("|").trim() } as Record<K | V, string>;
  });
/** Introduction : paragraphes séparés par une ligne vide. */
const paragraphs = (v: string) => v.split(/\r?\n\s*\r?\n/).map((p) => p.replace(/\s*\r?\n\s*/g, " ").trim()).filter(Boolean);
/** « lien | titre | format » sur chaque ligne. */
const videoLinks = (v: string) => lines(v).map((l) => {
  const [url, title = "", layout = ""] = l.split("|").map((p) => p.trim());
  return { url, title, layout: ["portrait", "square", "landscape"].includes(layout) ? layout : "portrait" };
});
/** Champs remplis d'une langue ; un champ vide s'affiche en français. */
function translation(v: Record<string, string>, lang: "en" | "ar") {
  const get = (k: string) => v[`${lang}.${k}`] ?? "";
  const entries: [string, unknown][] = [
    ...(["name", "headline", "summary", "durationLabel", "location", "practical"] as const).map((k): [string, unknown] => [k, get(k).trim()]),
    ["intro", paragraphs(get("intro"))],
    ...(["objectives", "prerequisites", "audience", "careers"] as const).map((k): [string, unknown] => [k, lines(get(k))]),
    ["modules", pairs(get("modules"), "title", "text")],
    ["facts", pairs(get("facts"), "label", "value")],
  ];
  return Object.fromEntries(entries.filter(([, value]) => (Array.isArray(value) ? value.length : value)));
}

/** Valeurs saisies, en texte. */
export function formValues(formData: FormData): Record<string, string> {
  const values = Object.fromEntries(ALL_FIELDS.map((k) => [k, String(formData.get(k) ?? "")])) as Record<string, string>;
  values.trainerIds = formData.getAll("trainerIds").map(String).join(",");
  return values;
}

/** Formulaire → corps JSON attendu par l'API. */
export function toPayload(v: Record<string, string>) {
  const price = v.priceTnd.trim().replace(",", ".");
  return {
    name: v.name,
    slug: v.slug,
    headline: v.headline,
    summary: v.summary,
    status: v.status,
    level: v.level || null,
    durationLabel: v.durationLabel.trim() || null,
    priceTnd: price === "" ? null : Number(price),
    position: Number(v.position || 0),
    coverUrl: v.coverUrl || null,
    nextSessionDate: v.nextSessionDate.trim() || null,
    intro: paragraphs(v.intro),
    objectives: lines(v.objectives),
    prerequisites: lines(v.prerequisites),
    audience: lines(v.audience),
    careers: lines(v.careers),
    modules: pairs(v.modules, "title", "text"),
    facts: pairs(v.facts, "label", "value"),
    academy: v.academy === "tsa" ? "tsa" : "fitness",
    accent: v.accent || "gold",
    location: v.location,
    practical: v.practical,
    contactPhone: v.contactPhone,
    sourceUrl: v.sourceUrl,
    coverIsPoster: v.coverIsPoster === "on",
    videos: videoLinks(v.videos),
    galleryUrls: lines(v.galleryUrls),
    trainerIds: v.trainerIds.split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0),
    translations: { en: translation(v, "en"), ar: translation(v, "ar") },
  };
}
