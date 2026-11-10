import type { Metadata } from "next";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { PageIntro } from "@/components/PageIntro";
import { ACTIVITY_LABELS, historyFor, type HistoryActivity } from "@/lib/history";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.history.metaTitle, description: t.history.intro };
}

/** Historique des formations : toutes les sessions passées, filtrables par activité (?activite=football). */
export default async function HistoryPage({ searchParams }: PageProps<"/historique">) {
  const [{ t }, params] = await Promise.all([getDictionary(), searchParams]);
  const requested = typeof params.activite === "string" ? params.activite : "";
  const initial: HistoryActivity | "all" = requested in ACTIVITY_LABELS ? (requested as HistoryActivity) : "all";

  return (
    <>
      <PageIntro eyebrow={t.history.eyebrow} title={t.history.title}>
        {t.history.intro}
      </PageIntro>
      <section className="py-16 lg:py-20">
        <div className="container-site">
          <HistoryTimeline key={initial} entries={historyFor()} showFilters initialFilter={initial} />
        </div>
      </section>
    </>
  );
}
