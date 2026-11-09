"use client";

import { useMemo, useState, useTransition } from "react";
import { followUpMessage, whatsappHref } from "@/lib/contact-links";
import { AVAILABILITY_LABELS, PROFILE_LABELS, STATUS_LABELS } from "@/lib/labels";
import { getStatsAction, type AdminStats } from "./actions";

/**
 * Couleurs des graphiques (fond sombre #131315), validées pour le daltonisme :
 * or = inscriptions, bleu = demandes d'information. Une seule série → or.
 */
const SERIES = { registrations: "#c98500", inquiries: "#3987e5" } as const;
const PERIODS = [7, 30, 90, 365] as const;

const dayFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const fullDayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const nf = new Intl.NumberFormat("fr-FR");

type Bucket = { key: string; label: string; detail: string; registrations: number; inquiries: number };

/** Au-delà de 60 jours, les barres quotidiennes deviennent illisibles : regroupement par semaine. */
function toBuckets(series: AdminStats["series"]): Bucket[] {
  const asDate = (d: string) => new Date(`${d}T00:00:00Z`);
  if (series.length <= 60) {
    return series.map((p) => ({ key: p.date, label: dayFmt.format(asDate(p.date)), detail: fullDayFmt.format(asDate(p.date)), registrations: p.registrations, inquiries: p.inquiries }));
  }
  const buckets: Bucket[] = [];
  for (let i = 0; i < series.length; i += 7) {
    const week = series.slice(i, i + 7);
    const first = asDate(week[0].date);
    const last = asDate(week[week.length - 1].date);
    buckets.push({
      key: week[0].date,
      label: dayFmt.format(first),
      detail: `Semaine du ${dayFmt.format(first)} au ${dayFmt.format(last)}`,
      registrations: week.reduce((s, p) => s + p.registrations, 0),
      inquiries: week.reduce((s, p) => s + p.inquiries, 0),
    });
  }
  return buckets;
}

/** Échelle « ronde » pour l'axe vertical (1, 2, 5, 10, 20…). */
function niceMax(value: number): number {
  if (value <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 2.5, 5, 10]) if (value <= step * pow) return step * pow;
  return 10 * pow;
}

function relativeAge(iso: string): string {
  const hours = Math.floor((Date.now() - Date.parse(iso)) / 3_600_000);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} jour${days > 1 ? "s" : ""}`;
}

function Trend({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-mist">Nouveau sur la période</span>;
  if (value === 0) return <span className="text-xs text-mist">= stable vs période précédente</span>;
  const up = value > 0;
  return (
    <span className={`text-xs ${up ? "text-football" : "text-red-300"}`}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span> {up ? "+" : ""}{value} % <span className="text-mist">vs période précédente</span>
    </span>
  );
}

export function AnalyticsOverview({ initialStats, onOpenTab }: { initialStats: AdminStats | null; onOpenTab: (tab: string) => void }) {
  const [stats, setStats] = useState(initialStats);
  const [days, setDays] = useState(initialStats?.days ?? 30);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  const changePeriod = (next: number) => {
    setDays(next);
    setError(false);
    startTransition(async () => {
      const result = await getStatsAction(next);
      if (result) setStats(result);
      else setError(true);
    });
  };

  if (!stats) return <p className="text-mist">Impossible de charger les statistiques. Vérifiez que l&apos;API est démarrée.</p>;
  const { kpis } = stats;
  const tiles = [
    { label: "Demandes reçues", value: nf.format(kpis.total.value), trend: kpis.total.trend, hint: "Inscriptions + demandes d'information" },
    { label: "Inscriptions", value: nf.format(kpis.registrations.value), trend: kpis.registrations.trend, hint: "Formulaires d'inscription à une formation" },
    { label: "Inscrits confirmés", value: nf.format(kpis.enrolled.value), trend: kpis.enrolled.trend, hint: "Demandes passées au statut « Inscrit »" },
    { label: "Nouveaux comptes", value: nf.format(kpis.newClients.value), trend: kpis.newClients.trend, hint: "Comptes clients créés sur le site" },
  ];

  return (
    <div className={pending ? "opacity-70 transition-opacity" : "transition-opacity"} aria-busy={pending}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-gold">Pilotage</p>
          <h2 className="mt-2 font-display text-2xl uppercase text-bone">Performance de l&apos;académie</h2>
          <p className="mt-1 text-xs text-mist">Mis à jour {new Date(stats.generatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}{error && <span className="ml-2 text-red-300">· échec du chargement</span>}</p>
        </div>
        <div role="group" aria-label="Période" className="flex border border-line">
          {PERIODS.map((p) => (
            <button key={p} type="button" onClick={() => changePeriod(p)} aria-pressed={days === p} className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${days === p ? "bg-gold text-ink" : "text-mist hover:text-bone"}`}>
              {p === 365 ? "12 mois" : `${p} j`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="bg-ink-2 p-6">
            <p className="text-xs uppercase tracking-widest text-mist">{t.label}</p>
            <p className="mt-3 font-display text-4xl text-bone">{t.value}</p>
            <p className="mt-2"><Trend value={t.trend} /></p>
            <p className="mt-2 text-xs text-mist/80">{t.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ActivityChart series={stats.series} />
        <Funnel funnel={stats.funnel} conversionRate={kpis.conversionRate} processingRate={kpis.processingRate} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <BarList title="Formations les plus demandées" eyebrow="Inscriptions" items={stats.topFormations.map((f) => ({ label: f.name, count: f.count }))} empty="Aucune inscription sur la période." />
        <BarList title="Profils des candidats" eyebrow="Inscriptions" items={stats.profiles.map((p) => ({ label: PROFILE_LABELS[p.label] ?? p.label, count: p.count }))} empty="Aucun profil sur la période." />
        <BarList title="Disponibilités souhaitées" eyebrow="Inscriptions" items={stats.availabilities.map((a) => ({ label: AVAILABILITY_LABELS[a.label] ?? a.label, count: a.count }))} empty="Aucune donnée sur la période." />
        <BarList title="Villes" eyebrow="Toutes les demandes" items={stats.cities} empty="Aucune ville renseignée." />
        <FollowUps followUps={stats.followUps} onOpenTab={onOpenTab} />
      </div>
    </div>
  );
}

function ActivityChart({ series }: { series: AdminStats["series"] }) {
  const buckets = useMemo(() => toBuckets(series), [series]);
  const [active, setActive] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const max = niceMax(Math.max(0, ...buckets.map((b) => b.registrations + b.inquiries)));
  const weekly = series.length > 60;
  const ticks = [max, max / 2, 0];
  const labelEvery = Math.ceil(buckets.length / 6);
  const current = active === null ? null : buckets[active];

  return (
    <section className="border border-line bg-ink-2 p-6" aria-labelledby="activity-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-gold">Activité</p>
          <h3 id="activity-title" className="mt-2 font-display text-xl uppercase text-bone">Demandes {weekly ? "par semaine" : "par jour"}</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-mist">
          <span className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-sm" style={{ background: SERIES.registrations }} />Inscriptions</span>
          <span className="flex items-center gap-2"><span aria-hidden="true" className="size-3 rounded-sm" style={{ background: SERIES.inquiries }} />Demandes d&apos;info</span>
          <button type="button" onClick={() => setShowTable((v) => !v)} className="border border-line px-2 py-1 uppercase tracking-wider hover:border-gold hover:text-gold">{showTable ? "Graphique" : "Tableau"}</button>
        </div>
      </div>

      {showTable ? (
        <div className="mt-6 max-h-80 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-ink-2 text-xs uppercase tracking-wider text-mist"><tr><th className="py-2">Période</th><th className="py-2 text-right">Inscriptions</th><th className="py-2 text-right">Demandes d&apos;info</th><th className="py-2 text-right">Total</th></tr></thead>
            <tbody>
              {[...buckets].reverse().map((b) => (
                <tr key={b.key} className="border-t border-line"><td className="py-2 text-mist">{b.detail}</td><td className="py-2 text-right text-bone">{b.registrations}</td><td className="py-2 text-right text-bone">{b.inquiries}</td><td className="py-2 text-right text-bone">{b.registrations + b.inquiries}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative mt-6 pl-8">
          {/* Grille et graduations (discrètes). */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 left-8 flex h-56 flex-col justify-between">
            {ticks.map((t) => (
              <div key={t} className="relative border-t border-line/70">
                <span className="absolute -top-2 -left-8 w-6 text-right text-[10px] text-mist">{t}</span>
              </div>
            ))}
          </div>
          <div className="relative flex h-56 items-end gap-[2px]" onMouseLeave={() => setActive(null)}>
            {buckets.map((b, i) => {
              const total = b.registrations + b.inquiries;
              return (
                <button
                  key={b.key}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  aria-label={`${b.detail} : ${b.registrations} inscription(s), ${b.inquiries} demande(s) d'information`}
                  className="group relative flex h-full min-w-0 flex-1 flex-col justify-end focus:outline-none"
                >
                  <span className={`absolute inset-0 transition-colors ${active === i ? "bg-bone/5" : ""}`} />
                  {total > 0 && (
                    <span className="relative flex flex-col gap-[2px] overflow-hidden rounded-t-[4px]" style={{ height: `${(total / max) * 100}%` }}>
                      {b.inquiries > 0 && <span style={{ flex: b.inquiries, background: SERIES.inquiries }} />}
                      {b.registrations > 0 && <span style={{ flex: b.registrations, background: SERIES.registrations }} />}
                    </span>
                  )}
                </button>
              );
            })}
            {current && active !== null && (
              <div
                role="status"
                className="pointer-events-none absolute -top-2 z-10 w-52 -translate-y-full border border-line bg-ink p-3 text-xs shadow-2xl"
                style={{ left: `clamp(0px, calc(${((active + 0.5) / buckets.length) * 100}% - 6.5rem), calc(100% - 13rem))` }}
              >
                <p className="font-display uppercase text-bone first-letter:uppercase">{current.detail}</p>
                <p className="mt-2 flex justify-between text-mist"><span className="flex items-center gap-2"><span className="size-2 rounded-sm" style={{ background: SERIES.registrations }} />Inscriptions</span><span className="text-bone">{current.registrations}</span></p>
                <p className="mt-1 flex justify-between text-mist"><span className="flex items-center gap-2"><span className="size-2 rounded-sm" style={{ background: SERIES.inquiries }} />Demandes d&apos;info</span><span className="text-bone">{current.inquiries}</span></p>
                <p className="mt-2 flex justify-between border-t border-line pt-2 text-mist"><span>Total</span><span className="text-bone">{current.registrations + current.inquiries}</span></p>
              </div>
            )}
          </div>
          <div aria-hidden="true" className="mt-2 flex gap-[2px] text-[10px] text-mist">
            {buckets.map((b, i) => (
              <span key={b.key} className="min-w-0 flex-1 overflow-visible whitespace-nowrap">{i % labelEvery === 0 ? b.label : ""}</span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Funnel({ funnel, conversionRate, processingRate }: { funnel: AdminStats["funnel"]; conversionRate: number; processingRate: number }) {
  const total = funnel.reduce((s, f) => s + f.count, 0);
  const max = Math.max(1, ...funnel.map((f) => f.count));
  return (
    <section className="border border-line bg-ink-2 p-6" aria-labelledby="funnel-title">
      <p className="eyebrow text-gold">Conversion</p>
      <h3 id="funnel-title" className="mt-2 font-display text-xl uppercase text-bone">Suivi commercial</h3>
      <div className="mt-6 grid grid-cols-2 gap-px border border-line bg-line">
        <div className="bg-ink p-4"><p className="font-display text-3xl text-bone">{conversionRate} %</p><p className="mt-1 text-[10px] uppercase tracking-widest text-mist">Taux de conversion</p></div>
        <div className="bg-ink p-4"><p className="font-display text-3xl text-bone">{processingRate} %</p><p className="mt-1 text-[10px] uppercase tracking-widest text-mist">Demandes traitées</p></div>
      </div>
      <ul className="mt-6 space-y-4">
        {funnel.map((f) => (
          <li key={f.status}>
            <div className="mb-1.5 flex justify-between text-sm"><span className="text-mist">{STATUS_LABELS[f.status] ?? f.status}</span><span className="text-bone">{f.count}<span className="ml-2 text-xs text-mist">{total ? Math.round((f.count / total) * 100) : 0} %</span></span></div>
            <div className="h-2 bg-line"><div className="h-full rounded-r-[4px]" style={{ width: `${(f.count / max) * 100}%`, background: SERIES.registrations }} /></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BarList({ title, eyebrow, items, empty }: { title: string; eyebrow: string; items: { label: string; count: number }[]; empty: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <section className="border border-line bg-ink-2 p-6">
      <p className="eyebrow text-gold">{eyebrow}</p>
      <h3 className="mt-2 font-display text-xl uppercase text-bone">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-mist">{empty}</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={item.label} title={`${item.label} : ${item.count}`}>
              <div className="mb-1.5 flex justify-between gap-3 text-sm"><span className="truncate text-mist">{item.label}</span><span className="text-bone">{item.count}</span></div>
              <div className="h-2 bg-line"><div className="h-full rounded-r-[4px]" style={{ width: `${(item.count / max) * 100}%`, background: SERIES.registrations }} /></div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function FollowUps({ followUps, onOpenTab }: { followUps: AdminStats["followUps"]; onOpenTab: (tab: string) => void }) {
  return (
    <section className="border border-gold/40 bg-ink-2 p-6 lg:col-span-2 xl:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-gold">À relancer</p>
          <h3 className="mt-2 font-display text-xl uppercase text-bone">{followUps.total} demande{followUps.total === 1 ? "" : "s"} sans réponse depuis plus de {followUps.afterHours} h</h3>
        </div>
        <button type="button" onClick={() => onOpenTab("inscriptions")} className="border border-line px-3 py-2 text-xs uppercase tracking-wider text-mist hover:border-gold hover:text-gold">Tout voir</button>
      </div>
      {followUps.items.length === 0 ? (
        <p className="mt-6 text-sm text-mist"><span aria-hidden="true">✓ </span>Toutes les demandes ont été prises en charge. Bravo !</p>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {followUps.items.map((c) => {
            const wa = whatsappHref(c.phone, followUpMessage(c.firstName, c.formations));
            return (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-bone">{c.firstName} {c.lastName} <span className="text-xs text-mist">· {relativeAge(c.createdAt)}</span></p>
                  <p className="truncate text-xs text-mist">{c.formations.length ? c.formations.join(", ") : PROFILE_LABELS[c.profile] ?? "Demande générale"}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {wa && <a href={wa} target="_blank" rel="noreferrer" className="border border-football/50 px-3 py-1.5 text-xs uppercase tracking-wider text-football hover:bg-football/10">WhatsApp</a>}
                  <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="border border-line px-3 py-1.5 text-xs uppercase tracking-wider text-mist hover:border-gold hover:text-gold">Appeler</a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
