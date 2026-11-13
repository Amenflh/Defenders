import type { Metadata } from "next";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { PageIntro } from "@/components/PageIntro";
import {
  ACTIVITY_LABELS,
  HISTORY_ACADEMY_FOR_ACTIVITY,
  historyFor,
  type HistoryAcademy,
  type HistoryActivity,
} from "@/lib/history";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.history.metaTitle, description: t.history.intro };
}

/** Historique des formations : toutes les sessions passées, filtrables par activité (?activite=football). */
export default async function HistoryPage({ searchParams }: PageProps<"/historique">) {
  const [{ t }, params] = await Promise.all([getDictionary(), searchParams]);
  const requestedAcademy = typeof params.academy === "string" ? params.academy : "";
  const initialAcademy: HistoryAcademy | "all" = ["fitness", "security", "tsa"].includes(requestedAcademy)
    ? requestedAcademy as HistoryAcademy
    : "all";
  const requestedActivity = typeof params.activite === "string" ? params.activite : "";
  const isActivity = Object.prototype.hasOwnProperty.call(ACTIVITY_LABELS, requestedActivity);
  const selectedActivity = isActivity ? requestedActivity as HistoryActivity : "all";
  const initial: HistoryActivity | "all" =
    selectedActivity !== "all" &&
    initialAcademy !== "all" &&
    HISTORY_ACADEMY_FOR_ACTIVITY[selectedActivity] !== initialAcademy
      ? "all"
      : selectedActivity;

  return (
    <>
      <PageIntro eyebrow={t.history.eyebrow} title={t.history.title}>
        {t.history.intro}
      </PageIntro>
      <section className="py-16 lg:py-20">
        <div className="container-site">
          <HistoryTimeline
            key={`${initialAcademy}-${initial}`}
            entries={historyFor()}
            showFilters
            initialFilter={initial}
            initialAcademy={initialAcademy}
          />
        </div>
      </section>
    </>
  );
}
