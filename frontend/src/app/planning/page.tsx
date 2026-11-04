import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { getPlanning } from "@/lib/api";
import { DISCIPLINE_SLUGS, type DisciplineSlug } from "@/lib/disciplines";
import { site } from "@/lib/site";
import { PlanningBoard } from "./PlanningBoard";

export const metadata: Metadata = {
  title: "Planning des formations",
  description: "Planning hebdomadaire des cours de Pilates, football et personal training.",
};

export default async function PlanningPage({ searchParams }: PageProps<"/planning">) {
  // Rendu à chaque requête : le planning vient de l'API et BACKEND_URL est lu à l'exécution.
  await connection();
  const [sessions, params] = await Promise.all([getPlanning(), searchParams]);
  const requested = typeof params.discipline === "string" ? params.discipline : undefined;
  const initial = DISCIPLINE_SLUGS.includes(requested as DisciplineSlug) ? (requested as DisciplineSlug) : "all";

  return (
    <>
      <PageIntro eyebrow="Planning" title="Planning des formations">
        Retrouvez la semaine type de nos formations. Filtrez par discipline pour voir les créneaux théoriques, pratiques et
        les ateliers.
      </PageIntro>

      <section className="py-16 lg:py-20">
        <div className="container-site">
          {sessions ? (
            <PlanningBoard sessions={sessions} initial={initial} />
          ) : (
            <div className="border border-line bg-ink-2 p-10 text-center">
              <Icon name="calendar" width={36} height={36} className="mx-auto text-gold" />
              <h2 className="mt-4 font-display text-2xl tracking-wide uppercase">Planning momentanément indisponible</h2>
              <p className="mx-auto mt-3 max-w-md text-mist">
                Nous n&apos;arrivons pas à charger le planning pour le moment. Contactez-nous pour connaître les prochaines
                sessions.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link href="/contact?popup=1" className="btn btn-primary">Nous contacter</Link>
                <a href={site.phone.href} className="btn btn-ghost">{site.phone.label}</a>
              </div>
            </div>
          )}

          <p className="mt-10 text-sm text-mist">
            Planning indicatif, susceptible d&apos;évoluer selon les sessions. Les dates exactes des prochaines promotions
            vous sont communiquées lors de votre inscription.
          </p>
        </div>
      </section>
    </>
  );
}
