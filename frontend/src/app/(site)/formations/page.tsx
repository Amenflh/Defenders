import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { FormationCard } from "@/components/FormationCard";
import { Icon } from "@/components/Icon";
import { PageIntro } from "@/components/PageIntro";
import { Reveal } from "@/components/Reveal";
import { Unavailable } from "@/components/Unavailable";
import { getFormations } from "@/lib/formations";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.pages.formationsList.title, description: t.pages.formationsList.metaDescription };
}

/** Liste des formations publiées (#16). */
export default async function FormationsPage() {
  await connection();
  const [formations, { t }] = await Promise.all([getFormations(), getDictionary()]);
  const L = t.pages.formationsList;

  return (
    <>
      <PageIntro eyebrow={L.eyebrow} title={L.title}>
        {L.intro}
      </PageIntro>

      {formations === null ? (
        <Unavailable />
      ) : formations.length === 0 ? (
        <section className="py-20">
          <div className="container-site border border-line bg-ink-2 p-10 text-center">
            <h2 className="font-display text-2xl tracking-wide uppercase">{L.emptyTitle}</h2>
            <p className="mx-auto mt-3 max-w-md text-mist">{L.emptyText}</p>
            <Link href="/contact" className="btn btn-primary mt-6">
              {t.home.contactUs}
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
              <p className="max-w-xl text-mist">{L.hesitate}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/trouver-ma-formation" className="btn btn-ghost">
                  <Icon name="star" /> {L.quiz}
                </Link>
                <Link href="/planning" className="btn btn-ghost">
                  <Icon name="calendar" /> {t.nav.planning}
                </Link>
                <Link href="/contact" className="btn btn-primary">
                  {L.advice} <Icon name="arrow" className="rtl:-scale-x-100" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
