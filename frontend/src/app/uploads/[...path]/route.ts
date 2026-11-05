import { backendUrl } from "@/lib/api";

/**
 * /uploads/… — images et vidéos téléversées, servies par le backend.
 * Relais en flux continu (pas de mise en mémoire), avec les requêtes partielles (Range)
 * nécessaires à la lecture des vidéos et à l'avance rapide.
 */
const PASS_HEADERS = ["content-type", "content-length", "content-range", "accept-ranges", "cache-control", "etag", "last-modified", "content-disposition"];

export async function GET(request: Request, { params }: RouteContext<"/uploads/[...path]">) {
  const { path } = await params;
  // Noms générés par le backend : images/<uuid>.jpg, videos/<uuid>.mp4
  if (path.length !== 2 || !/^(images|videos)$/.test(path[0]) || !/^[\w-]+\.(jpg|png|webp|mp4|webm)$/.test(path[1])) {
    return new Response("Introuvable", { status: 404 });
  }

  const range = request.headers.get("range");
  const res = await fetch(backendUrl(`/uploads/${path[0]}/${path[1]}`), {
    headers: range ? { range } : {},
    cache: "no-store",
  }).catch(() => null);
  if (!res) return new Response("Service indisponible", { status: 502 });

  const headers = new Headers({ "x-content-type-options": "nosniff" });
  for (const h of PASS_HEADERS) {
    const v = res.headers.get(h);
    if (v) headers.set(h, v);
  }
  return new Response(res.body, { status: res.status, headers });
}
