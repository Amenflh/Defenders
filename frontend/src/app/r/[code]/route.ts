import { NextResponse, type NextRequest } from "next/server";
import { REFERRAL_CODE, REFERRAL_COOKIE } from "@/lib/program";
import { apiFetch } from "@/lib/session";

/**
 * GET /r/CODE — lien de parrainage partagé par un stagiaire.
 * Code valide : il est mémorisé 30 jours (cookie) et joint à la prochaine demande d'inscription ;
 * l'ami arrive sur la page d'inscription avec un mot d'accueil. Code inconnu : simple accueil du site.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/r/[code]">) {
  const { code } = await params;
  const target = request.nextUrl.clone();
  target.search = "";

  const valid = REFERRAL_CODE.test(code) && (await apiFetch(`/api/referrals/${encodeURIComponent(code)}`).then((r) => r.ok).catch(() => false));
  if (!valid) {
    target.pathname = "/";
    return NextResponse.redirect(target, 307);
  }

  target.pathname = "/contact";
  target.searchParams.set("invite", "1");
  const response = NextResponse.redirect(target, 307);
  response.cookies.set(REFERRAL_COOKIE, code.toUpperCase(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 3600,
    path: "/",
  });
  return response;
}
