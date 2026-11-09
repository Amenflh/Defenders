import { NextResponse, type NextRequest } from "next/server";
import { apiFetch } from "@/lib/session";

/**
 * GET /paiement/retour?payment_ref=… — adresse donnée à Konnect comme « webhook ».
 * Konnect l'appelle (serveur à serveur) ET y renvoie le payeur. Dans les deux cas, l'API redemande
 * le statut réel à Konnect avant de valider : l'adresse peut être appelée par n'importe qui sans risque.
 * Le payeur est ensuite renvoyé vers son espace avec le résultat.
 */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("payment_ref") ?? request.nextUrl.searchParams.get("ref") ?? "";
  let status = "error";
  if (/^[\w-]{6,120}$/.test(ref)) {
    const res = await apiFetch("/api/payments/verify", { method: "POST", body: JSON.stringify({ ref }) }).catch(() => null);
    if (res?.ok) status = ((await res.json()) as { status: string }).status;
  }
  const target = request.nextUrl.clone();
  target.pathname = "/mon-espace";
  target.search = `?paiement=${encodeURIComponent(status)}`;
  target.hash = "inscriptions";
  return NextResponse.redirect(target, 303);
}
