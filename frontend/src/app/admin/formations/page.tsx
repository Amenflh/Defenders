import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { formatPrice } from "@/lib/formations";
import { listAdminFormations } from "./data";
import { FormationRowActions } from "./FormationRowActions";

export const metadata: Metadata = { title: "Formations · Espace admin" };

const STATUS = {
  published: { label: "Publiée", tone: "border-football/60 text-football" },
  draft: { label: "Brouillon", tone: "border-gold/60 text-gold" },
  archived: { label: "Archivée", tone: "border-line text-mist" },
} as const;

/** Gestion des formations (#36). */
export default async function AdminFormationsPage() {
  const formations = await listAdminFormations();

  return (
    <section className="container-site">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow mb-2">Espace admin</p>
          <h1 className="heading-lg">Formations</h1>
          <p className="mt-2 max-w-2xl text-sm text-mist">
            Le contenu des pages formations se modifie ici. Une formation publiée apparaît immédiatement sur le site ;
            un brouillon reste invisible.
          </p>
        </div>
        <Link href="/admin/formations/nouvelle" className="btn btn-primary">
          Nouvelle formation <Icon name="arrow" />
        </Link>
      </div>

      {formations === null ? (
        <p role="alert" className="border border-red-400/40 bg-red-500/10 p-6 text-red-200">
          Impossible de charger les formations : l&apos;API ne répond pas. Vérifiez que le backend est démarré.
        </p>
      ) : formations.length === 0 ? (
        <div className="border border-line bg-ink-2 p-10 text-center text-mist">
          Aucune formation pour le moment.{" "}
          <Link href="/admin/formations/nouvelle" className="text-gold underline">Créer la première</Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {formations.map((f) => {
            const status = STATUS[f.status];
            return (
              <li key={f.id} className="flex flex-wrap items-start justify-between gap-6 border border-line bg-ink-2 p-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-2xl tracking-wide uppercase">{f.name}</h2>
                    <span className={`border px-2 py-0.5 text-[0.65rem] tracking-[0.15em] uppercase ${status.tone}`}>{status.label}</span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-mist">/formations/{f.slug}</p>
                  {f.headline && <p className="mt-3 text-sm text-mist">{f.headline}</p>}
                  <p className="mt-3 text-xs tracking-[0.1em] text-mist uppercase">
                    {[f.durationLabel, f.levelLabel, formatPrice(f.priceTnd)].filter(Boolean).join(" · ") || "Infos pratiques à compléter"}
                    {" · "}
                    {f.registrationCount} demande(s) · {f.sessionCount} créneau(x) · ordre {f.position}
                  </p>
                </div>
                <FormationRowActions id={f.id} name={f.name} slug={f.slug} status={f.status} registrationCount={f.registrationCount} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
