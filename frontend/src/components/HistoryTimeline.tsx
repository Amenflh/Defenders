"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { accentClassFor } from "@/lib/formation-visuals";
import { ACTIVITY_LABELS, HISTORY_PROVISIONAL, type HistoryActivity, type HistoryEntry } from "@/lib/history";
import { intlLocale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { Icon } from "./Icon";

/**
 * Historique des formations : frise chronologique avec photos et vidéos des sessions passées.
 * Avec `showFilters`, des onglets permettent de n'afficher qu'une activité.
 */
export function HistoryTimeline({ entries, showFilters = false, initialFilter = "all" }: { entries: HistoryEntry[]; showFilters?: boolean; initialFilter?: HistoryActivity | "all" }) {
  const { locale, t } = useI18n();
  const [filter, setFilter] = useState<HistoryActivity | "all">(initialFilter);
  const activities = useMemo(() => Array.from(new Set(entries.map((e) => e.activity))), [entries]);
  const visible = filter === "all" ? entries : entries.filter((e) => e.activity === filter);
  const dateFmt = new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <div>
      {HISTORY_PROVISIONAL && (
        <p className="mb-8 inline-flex items-center gap-2 border border-gold/40 bg-gold/10 px-4 py-2 text-xs text-gold-soft">
          <Icon name="calendar" width={14} height={14} /> {t.history.pending}
        </p>
      )}

      {showFilters && activities.length > 1 && (
        <div role="group" aria-label={t.history.title} className="mb-10 flex flex-wrap gap-2">
          {(["all", ...activities] as const).map((value) => {
            const active = value === filter;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={active}
                className={`${value === "all" ? "" : accentClassFor(value)} flex items-center gap-2 border px-4 py-2 font-display text-xs tracking-[0.12em] uppercase transition-colors ${
                  active ? "border-gold bg-gold text-ink" : "border-line text-mist hover:border-bone/50 hover:text-bone"
                }`}
              >
                {value !== "all" && <span className={`size-2 rounded-full ${active ? "bg-ink" : "bg-gold"}`} />}
                {value === "all" ? t.history.filterAll : ACTIVITY_LABELS[value][locale]}
              </button>
            );
          })}
        </div>
      )}

      <ol className="relative space-y-10 border-s border-line ps-6 sm:ps-10">
        {visible.map((entry) => (
          <li key={entry.id} className={`relative ${accentClassFor(entry.activity)}`}>
            <span aria-hidden="true" className="absolute -start-[1.95rem] top-1.5 size-3.5 rounded-full border-2 border-ink bg-gold sm:-start-[2.95rem]" />
            <div className="grid gap-6 border border-line bg-ink-2 p-5 sm:p-7 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs tracking-[0.16em] uppercase">
                  <time dateTime={entry.date} className="text-gold">{dateFmt.format(new Date(`${entry.date}T00:00:00Z`))}</time>
                  <span className="text-mist">{ACTIVITY_LABELS[entry.activity][locale]}</span>
                </p>
                <h3 className="mt-3 font-display text-2xl uppercase">{entry.title[locale]}</h3>
                <ul className="mt-4 space-y-2 text-sm text-mist">
                  <li className="flex items-center gap-2"><Icon name="pin" width={16} height={16} className="text-gold" /> {entry.place[locale]}</li>
                  <li className="flex items-center gap-2"><Icon name="user" width={16} height={16} className="text-gold" /> {entry.participants} {t.history.participants}</li>
                  <li className="flex items-center gap-2"><Icon name="medical" width={16} height={16} className="text-gold" /> {t.highlights.medical.title}</li>
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {entry.photos.map((photo, i) => (
                  <a key={i} href={photo.src.src} target="_blank" rel="noreferrer" className="group relative block aspect-[4/3] overflow-hidden bg-ink" aria-label={`${t.history.photos} — ${photo.alt}`}>
                    <Image src={photo.src} alt={photo.alt} fill sizes="(min-width:1024px) 20vw, 45vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  </a>
                ))}
                {entry.video && (
                  <video
                    src={entry.video}
                    controls
                    preload="metadata"
                    playsInline
                    aria-label={`${t.history.video} — ${entry.title[locale]}`}
                    className={`aspect-[4/3] w-full bg-ink object-cover ${entry.photos.length % 2 === 0 ? "col-span-2 aspect-video" : ""}`}
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
