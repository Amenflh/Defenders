import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminFormation, listImages, listTrainers, toFormValues } from "../data";
import { FormationForm } from "../FormationForm";

export const metadata: Metadata = { title: "Modifier une formation · Espace admin" };

export default async function EditFormationPage({ params, searchParams }: PageProps<"/admin/formations/[id]">) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  const [formation, images, trainers, { cree }] = await Promise.all([getAdminFormation(id), listImages(), listTrainers(), searchParams]);
  if (formation === "not-found") notFound();

  if (formation === null) {
    return (
      <section>
        <p role="alert" className="border border-red-400/40 bg-red-500/10 p-6 text-red-200">
          Impossible de charger la formation : l&apos;API ne répond pas.{" "}
          <Link href="/admin/formations" className="underline">Retour à la liste</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-5xl">
      <p className="eyebrow text-gold"><Link href="/admin/formations" className="hover:text-bone">← Formations</Link></p>
      <h1 className="mt-2 mb-2 font-display text-2xl uppercase text-bone">{formation.name}</h1>
      <p className="mb-10 text-sm text-mist">Dernière modification : {new Date(formation.updatedAt).toLocaleString("fr-FR", { timeZone: "Africa/Tunis" })}</p>
      {cree === "1" && (
        <p className="mb-8 border border-emerald-500/50 bg-emerald-500/10 p-4 text-sm">
          Formation créée en brouillon. Complétez son contenu puis passez son statut à « Publiée ».
        </p>
      )}
      <FormationForm id={formation.id} initial={toFormValues(formation)} images={images} trainers={trainers} />
    </section>
  );
}
