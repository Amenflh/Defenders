import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "dfa_session";
/** Pages accessibles sans être connecté. */
const PUBLIC_PATHS = ["/login", "/register"];

/**
 * Vérification « optimiste » : sans cookie de session, toute page renvoie vers /login.
 * La validité réelle de la session est vérifiée côté serveur (layout du site, espace admin).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!isPublic && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Exclut les fichiers statiques, l'optimisation d'images et les médias du dossier public
  // (sinon la vidéo de l'écran de connexion serait elle-même redirigée vers /login).
  matcher: ["/((?!_next/static|_next/image|pics/|video/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpe?g|svg|webp|avif|ico|mp4|webm)$).*)"],
};
