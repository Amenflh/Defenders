import type { Metadata } from "next";
import Link from "next/link";
import { listImages, listTrainers, toFormValues } from "../data";
import { FormationForm } from "../FormationForm";

export const metadata: Metadata = { title: "Nouvelle formation · Espace admin" };

export default async function NewFormationPage() {
  const [images, trainers] = await Promise.all([listImages(), listTrainers()]);
  return (
    <section className="max-w-5xl">
      <p className="eyebrow text-gold"><Link href="/admin/formations" className="hover:text-bone">← Formations</Link></p>
      <h1 className="mt-2 mb-2 font-display text-2xl uppercase text-bone">Nouvelle formation</h1>
      <p className="mb-10 text-sm text-mist">Elle est créée en brouillon : publiez-la quand son contenu est prêt.</p>
      <FormationForm id={null} initial={toFormValues()} images={images} trainers={trainers} />
    </section>
  );
}
