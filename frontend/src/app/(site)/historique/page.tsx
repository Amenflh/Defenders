import type { Metadata } from "next";
import { connection } from "next/server";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { PageIntro } from "@/components/PageIntro";
import type { Academy } from "@/lib/academies";
import { getHistory } from "@/lib/academy-content";
import { getDictionary } from "@/lib/i18n/server";
import { getHeroClips } from "@/lib/home-page-data";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.history.metaTitle, description: t.history.intro };
}

/** Historique des formations (admin › Historique), filtrable par académie et par formation (?academy=tsa&activite=k9). */
export default async function HistoryPage({ searchParams }: PageProps<"/historique">) {
  await connection();
  const [{ t }, params, heroClips, entries] = await Promise.all([getDictionary(), searchParams, getHeroClips(), getHistory()]);
  // L'ancien filtre « security » (DSP) renvoie vers la Tunisian Security Academy, dont la sécurité fait partie.
  const requested = params.academy === "security" ? "tsa" : params.academy;
  const academy: Academy | "all" = requested === "fitness" || requested === "tsa" ? requested : "all";
  const activity = typeof params.activite === "string" ? params.activite : "";
  const filter = entries.some((e) => e.activity === activity && (academy === "all" || e.academy === academy)) ? activity : "all";

  return (
    <>
      <PageIntro eyebrow={t.history.eyebrow} title={t.history.title} clips={heroClips}>
        {t.history.intro}
      </PageIntro>
      <section className="py-16 lg:py-20">
        <div className="container-site">
          <HistoryTimeline key={`${academy}-${filter}`} entries={entries} showFilters initialFilter={filter} initialAcademy={academy} />
        </div>
      </section>
    </>
  );
}
