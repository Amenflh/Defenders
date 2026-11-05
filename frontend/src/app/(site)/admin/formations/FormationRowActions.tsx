"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteFormation, setFormationStatus } from "./actions";

/** Actions rapides d'une ligne : modifier, publier / dépublier, archiver, supprimer. */
export function FormationRowActions({ id, name, slug, status, registrationCount }: { id: number; name: string; slug: string; status: string; registrationCount: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; message?: string }>) =>
    startTransition(async () => {
      setError(null);
      const res = await fn();
      if (!res.ok) setError(res.message ?? "Action impossible. Réessayez.");
    });

  const btn = "border border-line px-3 py-1.5 text-xs tracking-[0.1em] uppercase transition-colors hover:border-bone/50 disabled:opacity-50";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2" aria-busy={pending}>
        <Link href={`/admin/formations/${id}`} className={`${btn} border-gold text-gold`}>Modifier</Link>
        {status === "published" ? (
          <>
            <Link href={`/formations/${slug}`} target="_blank" className={btn}>Voir</Link>
            <button type="button" disabled={pending} onClick={() => run(() => setFormationStatus(id, "draft"))} className={btn}>Dépublier</button>
          </>
        ) : (
          <button type="button" disabled={pending} onClick={() => run(() => setFormationStatus(id, "published"))} className={btn}>Publier</button>
        )}
        {status !== "archived" && (
          <button type="button" disabled={pending} onClick={() => run(() => setFormationStatus(id, "archived"))} className={btn}>Archiver</button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            const warning = registrationCount
              ? `« ${name} » a ${registrationCount} demande(s) d'inscription : elle ne peut pas être supprimée, archivez-la plutôt.`
              : `Supprimer définitivement « ${name} » et ses créneaux ? Cette action est irréversible.`;
            if (registrationCount) return setError(warning);
            if (window.confirm(warning)) run(() => deleteFormation(id));
          }}
          className={`${btn} text-red-300 hover:border-red-400/60`}
        >
          Supprimer
        </button>
      </div>
      {pending && <p className="text-xs text-mist">Enregistrement…</p>}
      {error && <p role="alert" className="max-w-sm text-right text-xs text-red-300">{error}</p>}
    </div>
  );
}
