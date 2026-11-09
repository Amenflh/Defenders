"use client";

import { useCallback, useEffect, useState } from "react";
import { STATUS_LABELS, dateFmt } from "@/lib/labels";
import { formatTnd, type RewardState } from "@/lib/program";
import { getReferralsAction, setRewardGrantedAction } from "./program-actions";

type Data = NonNullable<Awaited<ReturnType<typeof getReferralsAction>>>;

const REWARD: Record<RewardState, { label: string; tone: string }> = {
  en_attente: { label: "Filleul pas encore inscrit", tone: "border-line text-mist" },
  a_verser: { label: "Bonus à verser", tone: "border-gold/60 text-gold" },
  verse: { label: "Bonus versé", tone: "border-football/60 text-football" },
};

/** Onglet « Parrainage » : qui a amené qui, et les bonus à verser. */
export function ReferralsManager() {
  const [data, setData] = useState<Data | null | undefined>(undefined);
  const [onlyDue, setOnlyDue] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => setData(await getReferralsAction().catch(() => null)), []);
  useEffect(() => {
    const t = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(t);
  }, [refresh]);

  if (data === undefined) return <p className="text-mist">Chargement…</p>;
  if (data === null) return <p className="text-red-300">Impossible de charger les parrainages.</p>;

  async function toggle(id: string, granted: boolean) {
    setError("");
    const result = await setRewardGrantedAction(id, granted);
    if (!result.ok) setError(result.error ?? "Action impossible.");
    await refresh();
  }

  const rows = data.referrals.filter((r) => !onlyDue || r.reward === "a_verser");
  return (
    <section className="space-y-8">
      <div>
        <p className="eyebrow text-gold">Croissance</p>
        <h1 className="mt-2 font-display text-3xl uppercase text-bone">Parrainage</h1>
        <p className="mt-1 text-sm text-mist">
          Chaque client a un lien personnel (/r/CODE) dans son espace. Bonus actuel : {formatTnd(data.rewardTnd)} par ami inscrit (modifiable dans l&apos;onglet Paiements).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Parrains actifs", String(data.totals.referrers)],
          ["Amis invités", String(data.totals.referred)],
          ["Amis inscrits", String(data.totals.enrolled)],
          ["Bonus à verser", formatTnd(data.totals.dueTnd)],
        ].map(([label, value]) => (
          <div key={label} className="border border-line bg-ink-2 p-5">
            <p className="text-xs tracking-[0.14em] text-mist uppercase">{label}</p>
            <p className="mt-2 font-display text-3xl text-bone">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl uppercase text-bone">Demandes parrainées</h2>
          <label className="flex items-center gap-2 text-sm text-mist">
            <input type="checkbox" checked={onlyDue} onChange={(e) => setOnlyDue(e.target.checked)} className="size-4 accent-[var(--color-gold)]" />
            Seulement les bonus à verser ({data.totals.due})
          </label>
        </div>
        {error && <p role="alert" className="mb-3 text-sm text-red-300">{error}</p>}
        {rows.length === 0 ? (
          <p className="border border-line bg-ink-2 p-8 text-center text-sm text-mist">Aucune demande parrainée pour l&apos;instant.</p>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className="grid gap-4 border border-line bg-ink-2 p-4 md:grid-cols-[1fr_1fr_auto] md:items-center">
                <div>
                  <p className="text-[0.65rem] tracking-[0.14em] text-mist uppercase">Parrain</p>
                  <p className="text-bone">{r.referrer?.name ?? "Compte supprimé"}</p>
                  <p className="text-xs text-mist">{r.referrer?.email}{r.referrer?.phone ? ` · ${r.referrer.phone}` : ""}</p>
                </div>
                <div>
                  <p className="text-[0.65rem] tracking-[0.14em] text-mist uppercase">Filleul · {dateFmt.format(new Date(r.createdAt))}</p>
                  <p className="text-bone">{r.firstName} {r.lastName}</p>
                  <p className="text-xs text-mist">{r.formations.join(", ") || "—"} · {STATUS_LABELS[r.status] ?? r.status}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <span className={`border px-2.5 py-1 text-[0.65rem] tracking-wider uppercase ${REWARD[r.reward].tone}`}>{REWARD[r.reward].label}</span>
                  {r.reward === "a_verser" && (
                    <button type="button" onClick={() => toggle(r.id, true)} className="btn btn-primary px-3 py-1.5 text-xs">Marquer versé</button>
                  )}
                  {r.reward === "verse" && (
                    <button type="button" onClick={() => toggle(r.id, false)} className="border border-line px-3 py-1.5 text-xs uppercase tracking-wider text-mist hover:text-bone" title={r.rewardGrantedAt ? `Versé le ${dateFmt.format(new Date(r.rewardGrantedAt))}` : undefined}>
                      Annuler
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
