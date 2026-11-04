"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Session } from "@/lib/api";
import type { DisciplineSlug } from "@/lib/disciplines";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const META: Record<DisciplineSlug, { label: string; dot: string; border: string; text: string }> = {
  pilates: { label: "Pilates", dot: "bg-pilates", border: "border-l-pilates", text: "text-pilates" },
  football: { label: "Football", dot: "bg-football", border: "border-l-football", text: "text-football" },
  "personal-training": { label: "Personal Training", dot: "bg-personal", border: "border-l-personal", text: "text-personal" },
};

type Filter = DisciplineSlug | "all";

export function PlanningBoard({ sessions, initial }: { sessions: Session[]; initial: Filter }) {
  const [filter, setFilter] = useState<Filter>(initial);

  const visible = useMemo(
    () => sessions.filter((s) => filter === "all" || s.discipline === filter),
    [sessions, filter],
  );

  const byDay = useMemo(
    () => DAYS.map((label, i) => ({ label, sessions: visible.filter((s) => s.day === i + 1) })),
    [visible],
  );

  const select = (f: Filter) => {
    setFilter(f);
    const url = new URL(window.location.href);
    if (f === "all") url.searchParams.delete("discipline");
    else url.searchParams.set("discipline", f);
    window.history.replaceState(null, "", url);
  };

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "Toutes" },
    ...Object.entries(META).map(([value, m]) => ({ value: value as Filter, label: m.label })),
  ];

  return (
    <div>
      <div role="group" aria-label="Filtrer par discipline" className="mb-10 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = f.value === filter;
          const count = f.value === "all" ? sessions.length : sessions.filter((s) => s.discipline === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => select(f.value)}
              aria-pressed={active}
              className={`flex items-center gap-2 border px-4 py-2.5 font-display text-sm tracking-[0.12em] uppercase transition-colors ${
                active ? "border-gold bg-gold text-ink" : "border-line text-mist hover:border-bone/50 hover:text-bone"
              }`}
            >
              {f.value !== "all" && <span className={`size-2 rounded-full ${META[f.value].dot}`} />}
              {f.label}
              <span className={`text-xs ${active ? "text-ink/60" : "text-mist/60"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 lg:gap-3">
        {byDay.map((day) => (
          <section key={day.label} aria-label={day.label} className={`${day.sessions.length === 0 ? "hidden lg:block" : ""}`}>
            <h2 className="mb-3 border-b border-line pb-2 font-display text-sm tracking-[0.2em] text-mist uppercase">{day.label}</h2>
            <ul className="space-y-3">
              {day.sessions.map((s) => {
                const m = META[s.discipline];
                return (
                  <li
                    key={s.id}
                    className={`border border-l-4 border-line ${m.border} bg-ink-2 p-4 transition-transform duration-300 hover:-translate-y-0.5`}
                  >
                    <p className="font-display text-lg tracking-wide">
                      {s.start} – {s.end}
                    </p>
                    <p className="mt-1 text-sm leading-snug font-medium">{s.title}</p>
                    <p className={`mt-3 text-[0.65rem] tracking-[0.18em] uppercase ${m.text}`}>{m.label}</p>
                    <p className="mt-1 text-xs text-mist">
                      {s.format} · {s.level}
                    </p>
                  </li>
                );
              })}
              {day.sessions.length === 0 && <li className="py-4 text-xs text-mist/60">—</li>}
            </ul>
          </section>
        ))}
      </div>

      {visible.length > 0 && filter !== "all" && (
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border border-line bg-ink-2 p-6">
          <p className="text-mist">
            Intéressé par la formation <span className="text-bone">{META[filter].label}</span> ?
          </p>
          <Link href={`/contact?popup=1&formation=${filter}`} className="btn btn-primary">
            Demander une inscription
          </Link>
        </div>
      )}
    </div>
  );
}
