import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/session";
import { EntryManager, type Entry } from "../EntryManager";
import { historyFields } from "../entry-fields";

export const metadata: Metadata = { title: "Historique · Espace admin" };

export default async function AdminHistoryPage() {
  const [res, formationsRes] = await Promise.all([
    apiFetch("/api/admin/history").catch(() => null),
    apiFetch("/api/admin/formations").catch(() => null),
  ]);
  if (res?.status === 401) redirect("/login?next=/admin/historique");
  const entries = res?.ok ? ((await res.json()) as { entries: Entry[] }).entries : null;
  const formations = formationsRes?.ok ? ((await formationsRes.json()) as { formations: { slug: string; name: string }[] }).formations.map(({ slug, name }) => ({ slug, name })) : [];

  return (
    <section>
      <div className="mb-6">
        <p className="eyebrow text-gold">Contenu du site</p>
        <h1 className="mt-2 font-display text-2xl uppercase text-bone">Historique</h1>
        <p className="mt-2 max-w-2xl text-sm text-mist">Sessions et programmes affichés sur la page Historique, filtrables par académie et par formation.</p>
      </div>
      {entries === null ? (
        <p role="alert" className="border border-red-400/40 bg-red-500/10 p-6 text-red-200">Impossible de charger l&apos;historique : l&apos;API ne répond pas.</p>
      ) : (
        <EntryManager endpoint="/api/admin/history" entries={entries} fields={historyFields(formations)} titleField="title" badges={["academy", "activity", "status", "date"]} itemName="historique" empty="Aucune entrée pour le moment." />
      )}
    </section>
  );
}
