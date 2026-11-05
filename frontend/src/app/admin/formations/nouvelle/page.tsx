import type { Metadata } from "next";
import { listImages, toFormValues } from "../data";
import { FormationForm } from "../FormationForm";

export const metadata: Metadata = { title: "Nouvelle formation · Espace admin" };

export default async function NewFormationPage() {
  const images = await listImages();
  return (
    <section className="container-site max-w-5xl">
      <p className="eyebrow mb-2">Formations</p>
      <h1 className="heading-lg mb-2">Nouvelle formation</h1>
      <p className="mb-10 text-sm text-mist">Elle est créée en brouillon : publiez-la quand son contenu est prêt.</p>
      <FormationForm id={null} initial={toFormValues()} images={images} />
    </section>
  );
}
