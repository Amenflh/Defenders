"use client";

import { useState, useTransition } from "react";
import { deleteMedia, updateMedia } from "./actions";

export type AdminMedia = {
  id: number;
  type: "image" | "video";
  url: string;
  title: string;
  category: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  formation: { id: number; name: string } | null;
};

const size = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} Ko` : `${(b / 1024 / 1024).toFixed(1)} Mo`);

/** Un média : aperçu, modification (titre, catégorie, formation) et suppression. */
export function MediaCard({ m, formations }: { m: AdminMedia; formations: { id: number; name: string }[] }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  function save(form: FormData) {
    startTransition(async () => {
      const formationId = String(form.get("formationId") ?? "");
      const res = await updateMedia(m.id, {
        title: String(form.get("title") ?? ""),
        category: String(form.get("category") ?? ""),
        formationId: formationId ? Number(formationId) : null,
      });
      setFeedback(res.ok ? { ok: true, text: "Enregistré" } : { ok: false, text: res.message ?? "Échec" });
    });
  }

  return (
    <li className="flex flex-col border border-line bg-ink-2">
      <div className="relative aspect-video bg-black">
        {m.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu admin d'un fichier téléversé
          <img src={m.url} alt={m.title} loading="lazy" className="size-full object-cover" />
        ) : (
          <video src={m.url} controls preload="metadata" className="size-full" />
        )}
        <span className="absolute top-2 left-2 bg-ink/80 px-2 py-0.5 text-[0.65rem] tracking-[0.15em] uppercase">
          {m.type === "image" ? "Image" : "Vidéo"} · {size(m.sizeBytes)}
        </span>
      </div>
      <form action={save} className="flex flex-1 flex-col gap-3 p-4" aria-busy={pending}>
        <input name="title" defaultValue={m.title} maxLength={120} aria-label="Titre" className="input !py-2 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input name="category" defaultValue={m.category} maxLength={40} placeholder="Catégorie" aria-label="Catégorie" list="categories" className="input !py-2 text-sm" />
          <select name="formationId" defaultValue={m.formation?.id ?? ""} aria-label="Formation associée" className="input !py-2 text-sm">
            <option value="">Aucune formation</option>
            {formations.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <p className="font-mono text-[0.7rem] break-all text-mist">{m.url}</p>
        <div className="mt-auto flex items-center gap-2">
          <button type="submit" disabled={pending} className="border border-gold px-3 py-1.5 text-xs tracking-[0.1em] text-gold uppercase disabled:opacity-50">
            {pending ? "…" : "Enregistrer"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!window.confirm(`Supprimer définitivement « ${m.title || "ce média"} » ? Le fichier sera effacé.`)) return;
              startTransition(async () => {
                const res = await deleteMedia(m.id);
                if (!res.ok) setFeedback({ ok: false, text: res.message ?? "Échec" });
              });
            }}
            className="border border-line px-3 py-1.5 text-xs tracking-[0.1em] text-red-300 uppercase hover:border-red-400/60 disabled:opacity-50"
          >
            Supprimer
          </button>
          {feedback && <span role={feedback.ok ? "status" : "alert"} className={`text-xs ${feedback.ok ? "text-football" : "text-red-300"}`}>{feedback.text}</span>}
        </div>
      </form>
    </li>
  );
}
