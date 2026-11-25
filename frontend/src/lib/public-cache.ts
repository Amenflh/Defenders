import "server-only";

/**
 * Cache mémoire des lectures publiques de l'API (réglages, contenus CMS, formations, médias, planning).
 *
 * Sans lui, chaque page affichée déclenche 5 à 10 appels identiques à l'API, pour chaque visiteur :
 * l'API et la base deviennent le goulot d'étranglement dès que le trafic monte. Ici :
 * - une réponse publique est réutilisée pendant TTL_MS pour tous les visiteurs ;
 * - les appels simultanés au même chemin n'en font qu'un (déduplication en vol) ;
 * - toute écriture passant par ce serveur (POST, PUT, PATCH, DELETE) vide le cache, pour que les
 *   modifications de l'admin apparaissent immédiatement.
 * Seules les routes publiques, identiques pour tous les visiteurs, sont concernées (jamais /api/me, /api/admin…).
 */

const TTL_MS = 30_000;
const MAX_ENTRIES = 300;

const PUBLIC_ROUTES = [
  /^\/api\/content\/(settings|items)\/[\w-]+$/,
  /^\/api\/formations(\/[\w-]+)?(\?[^#]*)?$/,
  /^\/api\/media(\?[^#]*)?$/,
  /^\/api\/(history|trainers)(\?[^#]*)?$/,
  /^\/api\/planning(\?[^#]*)?$/,
];

type Entry = { expires: number; status: number; body: string; contentType: string };

const store = new Map<string, Entry>();
const inFlight = new Map<string, Promise<Entry>>();

export function isCacheablePublicGet(path: string, method = "GET"): boolean {
  return method.toUpperCase() === "GET" && PUBLIC_ROUTES.some((pattern) => pattern.test(path));
}

/** Vidé après chaque écriture : l'admin voit tout de suite le site à jour. */
export function clearPublicCache() {
  store.clear();
}

const toResponse = (entry: Entry) =>
  new Response(entry.body, { status: entry.status, headers: { "Content-Type": entry.contentType, "X-Cache": "HIT" } });

export async function cachedPublicGet(path: string, load: () => Promise<Response>): Promise<Response> {
  const now = Date.now();
  const hit = store.get(path);
  if (hit && hit.expires > now) return toResponse(hit);

  let pending = inFlight.get(path);
  if (!pending) {
    pending = (async () => {
      const response = await load();
      const entry: Entry = {
        expires: Date.now() + TTL_MS,
        status: response.status,
        body: await response.text(),
        contentType: response.headers.get("content-type") ?? "application/json",
      };
      // Seules les réponses valides sont gardées : une erreur passagère de l'API n'est pas mémorisée.
      if (response.ok) {
        if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value!);
        store.set(path, entry);
      }
      return entry;
    })().finally(() => inFlight.delete(path));
    inFlight.set(path, pending);
  }
  return toResponse(await pending);
}
