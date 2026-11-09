import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { FormationCard } from "@/components/FormationCard";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { Unavailable } from "@/components/Unavailable";
import { getFormations } from "@/lib/formations";

export const metadata: Metadata = {
  title: "Nos formations",
  description: "Toutes les formations certifiantes de Defenders Fitness Academy : programme, durée, niveau et inscription.",
};

/** Liste des formations publiées (#16). */
export default async function FormationsPage() {
  await connection();
  const formations = await getFormations();

  return (
    <>
      <PageIntro eyebrow="Catalogue" title="Nos formations">
        Des formations certifiantes, intensives et encadrées par des professionnels du terrain. Choisissez votre spécialité
        et découvrez le programme détaillé.
      </PageIntro>

      {formations === null ? (
        <Unavailable what="la liste des formations" />
      ) : formations.length === 0 ? (
        <section className="py-20">
          <div className="container-site border border-line bg-ink-2 p-10 text-center">
            <h2 className="font-display text-2xl tracking-wide uppercase">Nouvelles sessions en préparation</h2>
            <p className="mx-auto mt-3 max-w-md text-mist">
              Aucune formation n&apos;est ouverte pour le moment. Contactez-nous pour être informé des prochaines dates.
            </p>
            <Link href="/contact" className="btn btn-primary mt-6">
              Nous contacter
            </Link>
          </div>
        </section>
      ) : (
        <section className="py-16 lg:py-24">
          <div className="container-site">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {formations.map((f, i) => (
                <Reveal key={f.slug} delay={(i % 3) * 120}>
                  <FormationCard f={f} priority={i < 3} />
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-14 flex flex-wrap items-center justify-between gap-6 border border-line bg-ink-2 p-8">
              <p className="max-w-xl text-mist">
                Vous hésitez entre plusieurs formations ? Faites notre quiz d&apos;orientation en 4 questions, ou laissez notre équipe vous conseiller.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/trouver-ma-formation" className="btn btn-ghost">
                  <Icon name="star" /> Faire le quiz
                </Link>
                <Link href="/planning" className="btn btn-ghost">
                  <Icon name="calendar" /> Planning
                </Link>
                <Link href="/contact" className="btn btn-primary">
                  Être conseillé <Icon name="arrow" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
