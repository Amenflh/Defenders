import type { Dictionary } from "../i18n/dictionaries";

/*
 * Aperçu de l'admin : chaque texte modifiable porte, à la fin, une référence invisible (« t.home.title »,
 * « f.12.summary »…) écrite avec des caractères de largeur nulle. Un clic sur le texte dans l'aperçu permet
 * ainsi de savoir ce qu'il faut modifier. Jamais utilisé sur le site public.
 */

// Opérateurs invisibles (U+2061 à U+2064) : sans effet sur l'affichage ni sur la liaison des lettres arabes.
const DIGITS = ["⁡", "⁢", "⁣", "⁤"];
const SOURCE = "[⁡-⁤]";
const MARKER = new RegExp(`(?:${SOURCE}{4})+`, "g");

/** Référence → suite invisible (4 chiffres en base 4 par octet ASCII). */
export function encodeRef(ref: string): string {
  let out = "";
  for (const char of `|${ref}|`) {
    const code = char.charCodeAt(0) & 0xff;
    out += DIGITS[(code >> 6) & 3] + DIGITS[(code >> 4) & 3] + DIGITS[(code >> 2) & 3] + DIGITS[code & 3];
  }
  return out;
}

/** Références contenues dans un texte, dans l'ordre. */
export function decodeRefs(text: string): string[] {
  const refs: string[] = [];
  for (const [run] of text.matchAll(MARKER)) {
    let decoded = "";
    for (let i = 0; i < run.length; i += 4) {
      const digits = [...run.slice(i, i + 4)].map((c) => DIGITS.indexOf(c));
      decoded += String.fromCharCode((digits[0] << 6) | (digits[1] << 4) | (digits[2] << 2) | digits[3]);
    }
    for (const part of decoded.split("|")) if (part) refs.push(part);
  }
  return refs;
}

/** Texte sans références invisibles. */
export const stripRefs = (text: string) => text.replace(new RegExp(SOURCE, "g"), "");

const mark = (text: unknown, ref: string, always = false) => (typeof text === "string" && (always || text.trim()) ? text + encodeRef(ref) : text);

/** Clés techniques du dictionnaire : jamais affichées telles quelles. */
const TECHNICAL = new Set(["value", "slug", "href", "id", "dir", "key"]);

/** Dictionnaire dont chaque chaîne porte sa référence « t.<chemin> ». */
export function markDictionary(dictionary: Dictionary): Dictionary {
  const walk = (value: unknown, path: string): unknown => {
    if (typeof value === "string") return mark(value, `t.${path}`);
    if (Array.isArray(value)) return value.map((child, i) => walk(child, `${path}.${i}`));
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, TECHNICAL.has(key) ? child : walk(child, path ? `${path}.${key}` : key)]));
    }
    return value;
  };
  return walk(dictionary, "") as Dictionary;
}

type Item = Record<string, unknown> & { id?: number };

/** Réglages affichés comme textes sur le site. */
export const MARKED_SETTINGS = [
  "phone", "phone2", "email", "securityEmail", "address", "approval", "tsaPhone", "tsaPhone2", "tsaEmail", "tsaAddress",
  "certificationLabel", "heroLead", "heroDescription", "footerTagline", "mentions", "privacy", "cookies",
  "contactPopupButtonLabel", "contactPopupTitle", "contactFirstNameLabel", "contactLastNameLabel", "contactEmailLabel", "contactPhoneLabel",
  "contactMessageLabel", "contactConsentText", "contactSubmitLabel",
];

export const FORMATION_TEXTS = ["name", "headline", "summary", "durationLabel", "location", "practical"];
export const FORMATION_LISTS = ["intro", "objectives", "prerequisites", "audience", "careers"];

function markFields(item: Item, prefix: string, fields: string[], lists: string[] = [], pairs: string[] = []): Item {
  const one = (source: Record<string, unknown>) => {
    const out = { ...source };
    for (const field of fields) if (field in out) out[field] = mark(out[field], `${prefix}.${field}`);
    for (const field of lists) if (Array.isArray(out[field])) out[field] = (out[field] as unknown[]).map((v, i) => mark(v, `${prefix}.${field}.${i}`));
    for (const field of pairs) {
      if (!Array.isArray(out[field])) continue;
      out[field] = (out[field] as Record<string, unknown>[]).map((row, i) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, mark(v, `${prefix}.${field}.${i}.${k}`)])));
    }
    return out;
  };
  const marked = one(item) as Item;
  const translations = item.translations as Record<string, Record<string, unknown>> | undefined;
  if (translations) marked.translations = Object.fromEntries(Object.entries(translations).map(([lang, tr]) => [lang, one(tr ?? {})]));
  return marked;
}

const markTrainer = (t: Item) => markFields(t, `r.${t.id}`, ["name", "title", "bio"]);
const markFormation = (f: Item): Item => {
  const out = markFields(f, `f.${f.id}`, FORMATION_TEXTS, FORMATION_LISTS, ["modules", "facts"]);
  if (Array.isArray(out.trainers)) out.trainers = (out.trainers as Item[]).map(markTrainer);
  return out;
};

/** Ajoute les références aux textes d'une réponse publique de l'API. */
export function markResponse(path: string, body: unknown): unknown {
  const data = body as Record<string, unknown>;
  const list = (key: string, fn: (item: Item) => Item) => ({ ...data, [key]: ((data[key] as Item[] | undefined) ?? []).map(fn) });
  if (path === "/api/content/settings/site") {
    const value = { ...(data.value as Record<string, unknown>) };
    for (const key of MARKED_SETTINGS) if (key in value) value[key] = mark(value[key], `s.${key}`);
    return { ...data, value };
  }
  if (path.startsWith("/api/content/items/")) return list("items", (c) => markFields(c, `c.${c.id}`, ["title", "subtitle", "body"]));
  if (path.startsWith("/api/formations/")) return data.formation ? { ...data, formation: markFormation(data.formation as Item) } : data;
  if (path.startsWith("/api/formations")) return list("formations", markFormation);
  if (path.startsWith("/api/history")) return list("entries", (h) => markFields(h, `h.${h.id}`, ["title", "description", "place"]));
  if (path.startsWith("/api/trainers")) return list("trainers", markTrainer);
  // Image sans titre : la référence seule (invisible) suffit à la reconnaître.
  if (path.startsWith("/api/media")) return list("media", (m) => ({ ...m, title: mark(m.title, `m.${m.id}.title`, m.type === "image") }));
  return body;
}
