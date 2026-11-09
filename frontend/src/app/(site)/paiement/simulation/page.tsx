import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { apiFetch } from "@/lib/session";
import { millimesToTnd, type PaymentConfig } from "@/lib/program";

export const metadata: Metadata = { title: "Paiement (simulation)", robots: { index: false } };

/**
 * Enregistre le résultat simulé puis revient dans l'espace du stagiaire, comme après un vrai paiement.
 * (Le retour Konnect passe par la route /paiement/retour, appelée par le navigateur ; une Server Action
 * ne peut pas rediriger vers une route handler, d'où la vérification faite ici directement.)
 */
async function simulate(formData: FormData) {
  "use server";
  const ref = String(formData.get("ref") ?? "");
  const outcome = formData.get("outcome") === "paid" ? "paid" : "failed";
  if (!/^sim_[\w-]{6,120}$/.test(ref)) notFound();
  const res = await apiFetch(`/api/payments/simulation/${encodeURIComponent(ref)}`, { method: "POST", body: JSON.stringify({ outcome }) }).catch(() => null);
  const status = res?.ok ? ((await res.json()) as { status: string }).status : "error";
  redirect(`/mon-espace?paiement=${encodeURIComponent(status)}#inscriptions`);
}

/**
 * Page de paiement FACTICE, utilisée seulement quand Konnect n'est pas configuré (développement).
 * En production sans clé Konnect, le paiement est désactivé et cette page renvoie 404.
 */
export default async function SimulationPage({ searchParams }: PageProps<"/paiement/simulation">) {
  const { ref, amount } = await searchParams;
  const res = await apiFetch("/api/payments/config").catch(() => null);
  const config = res?.ok ? ((await res.json()) as PaymentConfig) : null;
  if (config?.mode !== "simulation" || typeof ref !== "string" || !ref.startsWith("sim_")) notFound();
  const millimes = Number.parseInt(typeof amount === "string" ? amount : "", 10);

  return (
    <section className="py-24">
      <div className="container-site max-w-lg">
        <div className="border border-dashed border-gold/60 bg-ink-2 p-8 text-center">
          <p className="eyebrow">Mode simulation</p>
          <h1 className="mt-3 font-display text-3xl tracking-wide uppercase">Paiement de l&apos;acompte</h1>
          {Number.isFinite(millimes) && <p className="mt-4 font-display text-5xl text-gold">{millimesToTnd(millimes)}</p>}
          <p className="mt-4 text-sm text-mist">
            Cette page remplace la passerelle Konnect tant qu&apos;aucune clé n&apos;est configurée. Aucun paiement réel n&apos;est effectué.
          </p>
          <form action={simulate} className="mt-8 grid gap-3">
            <input type="hidden" name="ref" value={ref} />
            <button type="submit" name="outcome" value="paid" className="btn btn-primary justify-center">Simuler un paiement réussi</button>
            <button type="submit" name="outcome" value="failed" className="btn btn-ghost justify-center">Simuler un échec</button>
          </form>
        </div>
      </div>
    </section>
  );
}
