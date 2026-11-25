import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/session";
import { EntryManager, type Entry } from "../EntryManager";
import { trainerFields } from "../entry-fields";

export const metadata: Metadata = { title: "Équipe · Espace admin" };

export default async function AdminTeamPage() {
  const res = await apiFetch("/api/admin/trainers").catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin/equipe");
  const trainers = res?.ok ? ((await res.json()) as { trainers: Entry[] }).trainers : null;

  return (
    <section>
      <div className="mb-6">
        <p className="eyebrow text-gold">Contenu du site</p>
        <h1 className="mt-2 font-display text-2xl uppercase text-bone">Équipe pédagogique</h1>
        <p className="mt-2 max-w-2xl text-sm text-mist">
          Formateurs présentés sur la page de leur académie. Pour les afficher aussi sur une formation, cochez-les dans la fiche de la formation.
        </p>
      </div>
      {trainers === null ? (
        <p role="alert" className="border border-red-400/40 bg-red-500/10 p-6 text-red-200">Impossible de charger l&apos;équipe : l&apos;API ne répond pas.</p>
      ) : (
        <EntryManager endpoint="/api/admin/trainers" entries={trainers} fields={trainerFields} titleField="name" badges={["title", "academy"]} itemName="formateur" empty="Aucun formateur pour le moment." />
      )}
    </section>
  );
}
