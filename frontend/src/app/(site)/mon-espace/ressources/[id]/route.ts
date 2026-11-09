import { backendUrl } from "@/lib/api";
import { clientIp, getSessionToken } from "@/lib/session";

/** En-têtes de la réponse de l'API transmis au navigateur (lecture vidéo par plages incluse). */
const FORWARDED = ["content-type", "content-length", "content-range", "accept-ranges", "content-disposition", "cache-control", "x-content-type-options", "last-modified", "etag"];

/**
 * GET /mon-espace/ressources/:id — ouvre un support réservé aux inscrits.
 * Le jeton reste côté serveur (cookie httpOnly) ; l'API vérifie l'inscription avant d'envoyer le fichier,
 * transmis en flux continu (en-tête Range relayé : une vidéo se lit sans être téléchargée en entier).
 */
export async function GET(request: Request, { params }: RouteContext<"/mon-espace/ressources/[id]">) {
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id)) return new Response("Ressource introuvable", { status: 404 });
  const token = await getSessionToken();
  if (!token) return Response.redirect(new URL(`/login?next=/mon-espace%23ressources`, request.url), 303);

  try {
    const res = await fetch(backendUrl(`/api/me/resources/${id}/file`), {
      headers: {
        authorization: `Bearer ${token}`,
        "x-forwarded-for": await clientIp(),
        ...(request.headers.get("range") ? { range: request.headers.get("range")! } : {}),
      },
      cache: "no-store",
    });
    if (!res.ok && res.status !== 206) {
      const message = res.status === 403 ? "Ce support est réservé aux stagiaires inscrits à cette formation." : "Ressource introuvable.";
      return new Response(message, { status: res.status === 403 ? 403 : 404, headers: { "content-type": "text/plain; charset=utf-8" } });
    }
    const headers = new Headers();
    for (const name of FORWARDED) {
      const value = res.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new Response(res.body, { status: res.status, headers });
  } catch {
    return new Response("Service indisponible, réessayez dans un instant.", { status: 502 });
  }
}
