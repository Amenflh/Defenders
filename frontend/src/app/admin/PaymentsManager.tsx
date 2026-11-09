"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { dateFmt } from "@/lib/labels";
import { millimesToTnd, type PaymentStatus } from "@/lib/program";
import { getPaymentsAction, saveProgramSettingsAction, type ProgramSettings } from "./program-actions";

type Data = NonNullable<Awaited<ReturnType<typeof getPaymentsAction>>>;

const STATUS: Record<PaymentStatus, { label: string; tone: string }> = {
  paid: { label: "Payé", tone: "border-football/60 text-football" },
  pending: { label: "En attente", tone: "border-gold/60 text-gold" },
  failed: { label: "Échoué", tone: "border-red-500/50 text-red-300" },
};

/** Onglet « Paiements » : réglages de l'acompte et du parrainage, encaissements et suivi des paiements. */
export function PaymentsManager() {
  const [data, setData] = useState<Data | null | undefined>(undefined);
  const [filter, setFilter] = useState<PaymentStatus | "all">("all");

  const refresh = useCallback(async () => setData(await getPaymentsAction().catch(() => null)), []);
  useEffect(() => {
    const t = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(t);
  }, [refresh]);

  if (data === undefined) return <p className="text-mist">Chargement…</p>;
  if (data === null) return <p className="text-red-300">Impossible de charger les paiements.</p>;

  const visible = data.payments.filter((p) => filter === "all" || p.status === filter);
  return (
    <section className="space-y-8">
      <div>
        <p className="eyebrow text-gold">Encaissements</p>
        <h1 className="mt-2 font-display text-3xl uppercase text-bone">Paiements en ligne</h1>
        <p className="mt-1 text-sm text-mist">
          {data.mode === "konnect" ? "Passerelle Konnect active (carte bancaire, wallet, e-DINAR)." : data.mode === "simulation" ? "Mode simulation : renseignez KONNECT_API_KEY et KONNECT_WALLET_ID pour encaisser réellement." : "Paiement en ligne désactivé : clés Konnect absentes."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total encaissé", millimesToTnd(data.totals.paidMillimes)],
          ["Acomptes payés", String(data.totals.paidCount)],
          ["En attente", String(data.payments.filter((p) => p.status === "pending").length)],
        ].map(([label, value]) => (
          <div key={label} className="border border-line bg-ink-2 p-5">
            <p className="text-xs tracking-[0.14em] text-mist uppercase">{label}</p>
            <p className="mt-2 font-display text-3xl text-bone">{value}</p>
          </div>
        ))}
      </div>

      <SettingsForm initial={data.settings} />

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl uppercase text-bone">Historique</h2>
          <div className="flex gap-1" role="group" aria-label="Filtrer par statut">
            {(["all", "paid", "pending", "failed"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setFilter(s)} aria-pressed={filter === s} className={`border px-3 py-1.5 text-xs uppercase tracking-wider ${filter === s ? "border-gold bg-gold text-ink" : "border-line text-mist hover:text-bone"}`}>
                {s === "all" ? "Tous" : STATUS[s].label}
              </button>
            ))}
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="border border-line bg-ink-2 p-8 text-center text-sm text-mist">Aucun paiement pour l&apos;instant.</p>
        ) : (
          <div className="overflow-x-auto border border-line">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-ink-2 text-xs tracking-wider text-mist uppercase">
                <tr>
                  <th className="px-4 py-3 font-normal">Date</th>
                  <th className="px-4 py-3 font-normal">Stagiaire</th>
                  <th className="px-4 py-3 font-normal">Formations</th>
                  <th className="px-4 py-3 text-right font-normal">Montant</th>
                  <th className="px-4 py-3 font-normal">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((p) => (
                  <tr key={p.id} className="bg-ink">
                    <td className="px-4 py-3 text-mist">{dateFmt.format(new Date(p.paidAt ?? p.createdAt))}</td>
                    <td className="px-4 py-3">
                      <span className="block text-bone">{p.registration.firstName} {p.registration.lastName}</span>
                      <span className="text-xs text-mist">{p.registration.email}</span>
                    </td>
                    <td className="px-4 py-3 text-mist">{p.registration.formations.join(", ") || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-bone tabular-nums">{millimesToTnd(p.amountMillimes)}</td>
                    <td className="px-4 py-3">
                      <span className={`border px-2 py-0.5 text-[0.65rem] tracking-wider uppercase ${STATUS[p.status].tone}`}>{STATUS[p.status].label}</span>
                      {p.provider === "simulation" && <span className="ml-2 text-[0.65rem] text-mist">simulation</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function SettingsForm({ initial }: { initial: ProgramSettings }) {
  const [values, setValues] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const { ok } = await saveProgramSettingsAction(values);
          setMessage(ok ? "Réglages enregistrés." : "Échec de l'enregistrement.");
        });
      }}
      className="grid gap-5 border border-line bg-ink-2 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
    >
      <label className="block text-sm text-mist">
        Montant de l&apos;acompte (DT)
        <input type="number" min={0} step="1" value={values.depositTnd} onChange={(e) => setValues({ ...values, depositTnd: Number(e.target.value) })} className="mt-1.5 w-full border border-line bg-ink px-3 py-2.5 text-bone focus:border-gold focus:outline-none" />
        <span className="mt-1 block text-xs text-mist/80">0 = paiement en ligne désactivé</span>
      </label>
      <label className="block text-sm text-mist">
        Bonus de parrainage par ami inscrit (DT)
        <input type="number" min={0} step="1" value={values.referralRewardTnd} onChange={(e) => setValues({ ...values, referralRewardTnd: Number(e.target.value) })} className="mt-1.5 w-full border border-line bg-ink px-3 py-2.5 text-bone focus:border-gold focus:outline-none" />
        <span className="mt-1 block text-xs text-mist/80">Affiché aux stagiaires dans leur espace</span>
      </label>
      <div>
        <button type="submit" disabled={pending} className="btn btn-primary w-full justify-center disabled:opacity-60">{pending ? "Enregistrement…" : "Enregistrer"}</button>
        <p role="status" className="mt-1 h-4 text-xs text-mist">{message}</p>
      </div>
    </form>
  );
}
