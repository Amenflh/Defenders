"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { formatSize } from "@/lib/program";
import { deleteResourceAction, getResourcesAction, updateResourceAction, type AdminResource } from "./program-actions";

/** Onglet « Ressources » : supports (PDF, vidéos, images, liens) visibles seulement des stagiaires inscrits. */
export function ResourcesManager({ formations }: { formations: { id: number; name: string }[] }) {
  const [resources, setResources] = useState<AdminResource[] | null | undefined>(undefined);
  const refresh = useCallback(async () => setResources(await getResourcesAction().catch(() => null)), []);
  useEffect(() => {
    const t = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(t);
  }, [refresh]);

  const formationName = (id: number | null) => (id === null ? "Tous les stagiaires inscrits" : formations.find((f) => f.id === id)?.name ?? "Formation supprimée");

  return (
    <section className="space-y-8">
      <div>
        <p className="eyebrow text-gold">Espace stagiaire</p>
        <h1 className="mt-2 font-display text-3xl uppercase text-bone">Ressources réservées</h1>
        <p className="mt-1 max-w-3xl text-sm text-mist">
          Programmes, fiches techniques, vidéos d&apos;exercices… Visibles dans « Mon espace » des stagiaires dont l&apos;inscription est confirmée.
          Les autres clients voient les titres avec un cadenas. Les fichiers sont stockés en privé, jamais accessibles par une adresse publique.
        </p>
      </div>

      <UploadForm formations={formations} onDone={refresh} />

      {resources === undefined ? (
        <p className="text-mist">Chargement…</p>
      ) : resources === null ? (
        <p className="text-red-300">Impossible de charger les ressources.</p>
      ) : resources.length === 0 ? (
        <p className="border border-line bg-ink-2 p-8 text-center text-sm text-mist">Aucune ressource pour l&apos;instant.</p>
      ) : (
        <ul className="space-y-3">
          {resources.map((r) => (
            <li key={r.id} className={`flex flex-wrap items-center gap-4 border border-line bg-ink-2 p-4 ${r.active ? "" : "opacity-60"}`}>
              <span className="grid size-10 shrink-0 place-items-center border border-gold/50 text-gold">
                <Icon name={r.kind === "link" ? "arrow" : "file"} width={18} height={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-bone">{r.title}</p>
                <p className="truncate text-xs text-mist">
                  {formationName(r.formationId)} · {r.kind === "link" ? r.url : `${r.originalName ?? "fichier"} · ${formatSize(r.size)}`}
                </p>
              </div>
              <select
                aria-label={`Formation de « ${r.title} »`}
                value={r.formationId ?? ""}
                onChange={async (e) => {
                  await updateResourceAction(r.id, { formationId: e.target.value ? Number(e.target.value) : null });
                  void refresh();
                }}
                className="border border-line bg-ink px-2 py-1.5 text-xs text-bone"
              >
                <option value="">Tous les inscrits</option>
                {formations.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <button
                type="button"
                onClick={async () => {
                  await updateResourceAction(r.id, { active: !r.active });
                  void refresh();
                }}
                className="border border-line px-3 py-1.5 text-xs uppercase tracking-wider text-mist hover:border-gold hover:text-gold"
              >
                {r.active ? "Masquer" : "Publier"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!window.confirm(`Supprimer « ${r.title} » ? Le fichier sera effacé.`)) return;
                  await deleteResourceAction(r.id);
                  void refresh();
                }}
                className="border border-red-500/40 px-3 py-1.5 text-xs uppercase tracking-wider text-red-300 hover:bg-red-500/10"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Ajout d'un support : fichier (PDF, image, vidéo) ou lien (YouTube, Drive…). Envoi en flux via /admin/medias/upload. */
function UploadForm({ formations, onDone }: { formations: { id: number; name: string }[]; onDone: () => void }) {
  const [mode, setMode] = useState<"file" | "link">("file");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    if (mode === "link") data.delete("file");
    else data.delete("url");
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/admin/medias/upload?type=resource", { method: "POST", body: data });
      const body = (await res.json().catch(() => null)) as { error?: string; errors?: Record<string, string[]> } | null;
      if (res.ok) {
        setMessage({ ok: true, text: "Ressource ajoutée." });
        form.reset();
        onDone();
      } else {
        const first = body?.errors ? Object.values(body.errors).flat()[0] : undefined;
        setMessage({ ok: false, text: first ?? body?.error ?? "Envoi impossible." });
      }
    } catch {
      setMessage({ ok: false, text: "Envoi interrompu. Vérifiez votre connexion." });
    } finally {
      setBusy(false);
    }
  }

  const input = "mt-1.5 w-full border border-line bg-ink px-3 py-2.5 text-sm text-bone focus:border-gold focus:outline-none";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit(e.currentTarget);
      }}
      className="grid gap-4 border border-line bg-ink-2 p-5 md:grid-cols-2"
    >
      <div className="flex gap-1 md:col-span-2" role="group" aria-label="Type de ressource">
        {(["file", "link"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={`border px-4 py-2 text-xs uppercase tracking-wider ${mode === m ? "border-gold bg-gold text-ink" : "border-line text-mist hover:text-bone"}`}>
            {m === "file" ? "Fichier (PDF, vidéo, image)" : "Lien (YouTube, Drive…)"}
          </button>
        ))}
      </div>
      <label className="block text-sm text-mist">
        Titre *
        <input name="title" required minLength={2} maxLength={160} placeholder="Ex. Programme semaine 1" className={input} />
      </label>
      <label className="block text-sm text-mist">
        Formation
        <select name="formationId" defaultValue="" className={input}>
          <option value="">Tous les stagiaires inscrits</option>
          {formations.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </label>
      <label className="block text-sm text-mist md:col-span-2">
        Description
        <input name="description" maxLength={1000} placeholder="Facultatif" className={input} />
      </label>
      {mode === "file" ? (
        <label className="block text-sm text-mist md:col-span-2">
          Fichier * <span className="text-xs">(PDF, JPG, PNG, WebP, MP4 ou WebM)</span>
          <input name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png,.webp,.mp4,.webm,application/pdf,image/*,video/mp4,video/webm" className={`${input} file:mr-4 file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-xs file:uppercase file:text-ink`} />
        </label>
      ) : (
        <label className="block text-sm text-mist md:col-span-2">
          Lien *
          <input name="url" type="url" required placeholder="https://…" className={input} />
        </label>
      )}
      <div className="flex items-center gap-4 md:col-span-2">
        <button type="submit" disabled={busy} className="btn btn-primary disabled:cursor-wait disabled:opacity-60">{busy ? "Envoi…" : "Ajouter la ressource"}</button>
        {message && <p role="status" className={`text-sm ${message.ok ? "text-football" : "text-red-300"}`}>{message.text}</p>}
      </div>
    </form>
  );
}
