import type { Dictionary } from "./dictionaries";

/** Textes du site modifiés dans l'admin (Textes du site) : { "pages.akAcademy.aboutText": "…" }. */
export type TextOverrides = Record<string, string>;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

/** Copie du dictionnaire avec les textes personnalisés (seules les chaînes existantes sont remplacées). */
export function applyOverrides(dictionary: Dictionary, overrides: TextOverrides | undefined): Dictionary {
  if (!overrides) return dictionary;
  let result: Record<string, unknown> | null = null;
  for (const [path, value] of Object.entries(overrides)) {
    if (typeof value !== "string" || !value.trim()) continue;
    const keys = path.split(".");
    let source: unknown = dictionary;
    for (const key of keys) source = isObject(source) ? source[key] : undefined;
    if (typeof source !== "string") continue;
    // Copie superficielle de chaque niveau du chemin : le dictionnaire d'origine n'est jamais modifié.
    result ??= { ...(dictionary as unknown as Record<string, unknown>) };
    let level: Record<string, unknown> = result;
    for (const key of keys.slice(0, -1)) {
      const child = level[key];
      level[key] = Array.isArray(child) ? [...child] : { ...(child as Record<string, unknown>) };
      level = level[key] as Record<string, unknown>;
    }
    level[keys.at(-1)!] = value;
  }
  return result ? (result as unknown as Dictionary) : dictionary;
}

/** Toutes les chaînes d'un dictionnaire, avec leur chemin (éditeur de textes de l'admin). */
export function flattenTexts(value: unknown, prefix = ""): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path: prefix, text: value }];
  if (!isObject(value)) return [];
  return Object.entries(value).flatMap(([key, child]) => flattenTexts(child, prefix ? `${prefix}.${key}` : key));
}
