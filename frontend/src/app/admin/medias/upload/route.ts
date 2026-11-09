import { backendUrl } from "@/lib/api";
import { clientIp, getSessionToken } from "@/lib/session";

/**
 * POST /admin/medias/upload?type=image|video|cms|resource — relaie l'envoi d'un fichier vers l'API :
 *   image / video → /api/admin/media/… (onglet Médias) ; cms → /api/admin/uploads (tableau de bord) ;
 *   resource → /api/admin/resources (supports réservés aux inscrits, stockés en privé).
 * Le corps (multipart) est transmis en flux continu, sans limite des Server Actions.
 * Le jeton reste côté serveur (cookie httpOnly) ; le rôle admin est vérifié par l'API.
 * Exclu du proxy (proxy.ts) : celui-ci mettrait le corps en mémoire au-delà de 10 Mo.
 */
export async function POST(request: Request) {
  const type = new URL(request.url).searchParams.get("type");
  const targets: Record<string, string> = { image: "/api/admin/media/images", video: "/api/admin/media/videos", cms: "/api/admin/uploads", resource: "/api/admin/resources" };
  const target = type ? targets[type] : undefined;
  if (!target) return Response.json({ error: "Type de média invalide" }, { status: 400 });

  const token = await getSessionToken();
  if (!token) return Response.json({ error: "Authentification requise" }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) return Response.json({ error: "Envoi invalide" }, { status: 400 });

  try {
    const res = await fetch(backendUrl(target), {
      method: "POST",
      body: request.body,
      // @ts-expect-error -- option Node.js requise pour envoyer un flux
      duplex: "half",
      headers: {
        "content-type": contentType,
        ...(request.headers.get("content-length") ? { "content-length": request.headers.get("content-length")! } : {}),
        authorization: `Bearer ${token}`,
        "x-forwarded-for": await clientIp(),
      },
    });
    return new Response(res.body, { status: res.status, headers: { "content-type": res.headers.get("content-type") ?? "application/json" } });
  } catch {
    return Response.json({ error: "L'API ne répond pas. Réessayez dans un instant." }, { status: 502 });
  }
}
