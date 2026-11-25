"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { accentClassFor } from "@/lib/formation-visuals";
import type { Academy } from "@/lib/academies";
import { HISTORY_STATUS_LABELS, type HistoryEntry } from "@/lib/history";
import { intlLocale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { Icon } from "./Icon";
import { VideoEmbed } from "./VideoEmbed";

/**
 * Archives de formation : frise chronologique avec les détails et médias des programmes référencés.
 * Avec `showFilters`, des onglets permettent de n'afficher qu'une activité.
 */
export function HistoryTimeline({
  entries,
  showFilters = false,
  initialFilter = "all",
  initialAcademy = "all",
}: {
  entries: HistoryEntry[];
  showFilters?: boolean;
  initialFilter?: string;
  initialAcademy?: Academy | "all";
}) {
  const { locale, t } = useI18n();
  const [filter, setFilter] = useState<string>(initialFilter);
  const [academy, setAcademy] = useState<Academy | "all">(initialAcademy);
  // Activités présentes dans l'académie choisie : valeur, libellé et couleur de la formation.
  const activities = useMemo(() => {
    const found = new Map<string, { label: string; accent: string }>();
    for (const e of entries) if (e.activity && (academy === "all" || e.academy === academy)) found.set(e.activity, { label: e.activityLabel, accent: e.accent });
    return [...found];
  }, [entries, academy]);
  const visible = entries.filter((entry) =>
    (academy === "all" || entry.academy === academy) &&
    (filter === "all" || entry.activity === filter),
  );
  const dateFmt = new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const academyFilters: { value: Academy | "all"; label: string }[] = [
    { value: "all", label: t.history.allAcademies },
    { value: "fitness", label: t.nav.fitnessAcademy },
    { value: "tsa", label: t.nav.akAcademy },
  ];

  return (
    <div>
      {entries.some((entry) => entry.status === "course") && (
        <p className="mb-8 inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-4 py-2 text-xs text-gold-soft">
          <Icon name="calendar" width={14} height={14} /> {t.history.pending}
        </p>
      )}

      {showFilters && (
        <div className="mb-10 space-y-5">
          <div role="group" aria-label={t.history.filterAcademy} className="flex flex-wrap gap-2">
            {academyFilters.map(({ value, label }) => {
              const active = value === academy;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAcademy(value);
                    setFilter("all");
                  }}
                  aria-pressed={active}
                  className={`border px-4 py-2 font-display text-xs tracking-[0.12em] uppercase transition-colors ${
                    active ? "border-gold bg-gold text-ink" : "border-line text-mist hover:border-bone/50 hover:text-bone"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div role="group" aria-label={t.history.filterActivity} className="flex flex-wrap gap-2">
            {[["all", { label: t.history.filterAll, accent: "" }] as const, ...activities].map(([value, { label, accent }]) => {
              const active = value === filter;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  aria-pressed={active}
                  className={`${accentClassFor(accent)} flex items-center gap-2 border px-4 py-2 font-display text-xs tracking-[0.12em] uppercase transition-colors ${
                    active ? "border-gold bg-gold text-ink" : "border-line text-mist hover:border-bone/50 hover:text-bone"
                  }`}
                >
                  {value !== "all" && <span className={`size-2 rounded-full ${active ? "bg-ink" : "bg-gold"}`} />}
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <p className="max-w-3xl border border-line bg-ink-2 p-6 leading-relaxed text-mist">{t.history.empty}</p>
      ) : (
        <ol className="relative space-y-10 border-s border-line ps-6 sm:ps-10">
          {visible.map((entry) => (
          <li key={entry.id} className={`relative ${accentClassFor(entry.accent)}`}>
            <span aria-hidden="true" className="absolute -start-[1.95rem] top-1.5 size-3.5 rounded-full border-2 border-ink bg-gold sm:-start-[2.95rem]" />
            <div className="grid gap-6 border border-line bg-ink-2 p-5 sm:p-7 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-[0.16em] uppercase">
                  {entry.date ? (
                    <>
                      <span className="text-mist">{t.history.postDate}</span>
                      <time dateTime={entry.date} className="text-gold">{dateFmt.format(new Date(`${entry.date}T00:00:00Z`))}</time>
                    </>
                  ) : (
                    <span className="text-mist">{t.history.postDateUnknown}</span>
                  )}
                  <span className="text-mist">{[entry.academy === "tsa" ? "TSA" : t.nav.fitnessAcademy, entry.activityLabel].filter(Boolean).join(" · ")}</span>
                </p>
                <h3 className="mt-3 font-display text-2xl uppercase">{entry.title}</h3>
                {entry.description && <p className="mt-3 max-w-3xl leading-relaxed text-mist">{entry.description}</p>}
                <p className="mt-3 inline-flex border border-gold/40 bg-gold/10 px-2.5 py-1 text-xs leading-relaxed text-gold-soft">
                  {HISTORY_STATUS_LABELS[entry.status][locale]}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-mist">
                  {entry.place && <li className="flex items-center gap-2"><Icon name="pin" width={16} height={16} className="text-gold" /> {entry.place}</li>}
                  {entry.participants !== null && <li className="flex items-center gap-2"><Icon name="user" width={16} height={16} className="text-gold" /> {entry.participants} {t.history.participants}</li>}
                  {entry.medicalFollowUp && <li className="flex items-center gap-2"><Icon name="medical" width={16} height={16} className="text-gold" /> {t.highlights.medical.title}</li>}
                </ul>
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {entry.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-display text-xs tracking-[0.12em] text-gold uppercase hover:text-bone">
                        {source.label || t.history.source} <Icon name="arrow" width={14} height={14} className="rtl:-scale-x-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              {(entry.photos.length > 0 || entry.videos.length > 0) && (
                <div className="space-y-4">
                  {entry.videos.length > 0 && (
                    <div className={`grid gap-3 ${entry.videos.length > 1 ? "sm:grid-cols-2" : ""}`}>
                      {entry.videos.map((video) => (
                        <VideoEmbed key={video.url} url={video.url} title={video.title || entry.title} layout={video.layout} />
                      ))}
                    </div>
                  )}
                  {entry.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {entry.photos.map((photo) => (
                        <a key={photo} href={photo} target="_blank" rel="noreferrer" className="group relative block aspect-[4/3] overflow-hidden bg-ink" aria-label={`${t.history.photos} — ${entry.title}`}>
                          <Image src={photo} alt={entry.title} fill unoptimized={!photo.startsWith("/pics/")} sizes="(min-width:1024px) 20vw, 45vw" className="object-cover transition duration-500 group-hover:scale-105" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </li>
          ))}
        </ol>
      )}
    </div>
  );
}
