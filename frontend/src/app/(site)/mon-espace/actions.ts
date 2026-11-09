"use server";

import { apiFetch } from "@/lib/session";

/** Lance le paiement de l'acompte et renvoie l'adresse de la page de paiement (Konnect ou simulation). */
export async function startDepositAction(registrationId: string): Promise<{ ok: true; payUrl: string } | { ok: false; error: string }> {
  const res = await apiFetch("/api/me/payments", { method: "POST", body: JSON.stringify({ registrationId }) }).catch(() => null);
  if (res?.ok) {
    const { payUrl } = (await res.json()) as { payUrl: string };
    // Seules des adresses https (Konnect) ou internes (simulation) sont suivies.
    if (/^https:\/\//.test(payUrl) || /^http:\/\/localhost[:/]/.test(payUrl)) return { ok: true, payUrl };
    return { ok: false, error: "Adresse de paiement invalide." };
  }
  if (res?.status === 401) return { ok: false, error: "Votre session a expiré. Reconnectez-vous." };
  if (res && [404, 409, 503, 502].includes(res.status)) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "Paiement impossible pour cette demande." };
  }
  return { ok: false, error: "Le service de paiement est indisponible. Réessayez dans un instant." };
}
