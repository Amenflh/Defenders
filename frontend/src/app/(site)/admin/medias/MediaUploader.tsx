"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { refreshMedia } from "./actions";

const LIMITS = {
  image: { accept: "image/jpeg,image/png,image/webp", label: "JPG, PNG ou WebP", maxMb: 5 },
  video: { accept: "video/mp4,video/webm", label: "MP4 ou WebM", maxMb: 100 },
} as const;

type Kind = keyof typeof LIMITS;

/** Envoi d'une image ou d'une vidéo, avec barre de progression (XMLHttpRequest). */
export function MediaUploader({ formations }: { formations: { id: number; name: string }[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<Kind>("image");
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const limits = LIMITS[kind];

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    setMessage(null);

    // Contrôles immédiats (l'API revérifie tout, y compris le contenu réel du fichier).
    if (!(file instanceof File) || file.size === 0) return setMessage({ tone: "error", text: "Choisissez un fichier." });
    if (!limits.accept.split(",").includes(file.type)) return setMessage({ tone: "error", text: `Format non accepté : ${limits.label} uniquement.` });
    if (file.size > limits.maxMb * 1024 * 1024) return setMessage({ tone: "error", text: `Fichier trop volumineux : ${limits.maxMb} Mo maximum.` });

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/admin/medias/upload?type=${kind}`);
    xhr.responseType = "json";
    xhr.upload.onprogress = (ev) => ev.lengthComputable && setProgress(Math.round((ev.loaded / ev.total) * 100));
    xhr.onerror = () => {
      setProgress(null);
      setMessage({ tone: "error", text: "Envoi interrompu (connexion perdue). Réessayez." });
    };
    xhr.onload = async () => {
      setProgress(null);
      const body = xhr.response as { error?: string; errors?: Record<string, string[]> } | null;
      if (xhr.status === 201) {
        formRef.current?.reset();
        setMessage({ tone: "ok", text: `${kind === "image" ? "Image" : "Vidéo"} envoyée.` });
        await refreshMedia();
        router.refresh();
      } else if (xhr.status === 401) {
        router.push("/login?next=/admin/medias");
      } else {
        setMessage({ tone: "error", text: Object.values(body?.errors ?? {})[0]?.[0] ?? body?.error ?? `Échec de l'envoi (${xhr.status}).` });
      }
    };
    setProgress(0);
    xhr.send(data);
  }

  const busy = progress !== null;

  return (
    <form ref={formRef} onSubmit={submit} className="space-y-5 border border-line bg-ink-2 p-6" aria-busy={busy}>
      <fieldset className="flex flex-wrap gap-2" disabled={busy}>
        <legend className="sr-only">Type de média</legend>
        {(["image", "video"] as const).map((k) => (
          <label key={k} className={`cursor-pointer border px-4 py-2 font-display text-sm tracking-[0.12em] uppercase ${kind === k ? "border-gold bg-gold text-ink" : "border-line text-mist"}`}>
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} className="sr-only" />
            {k === "image" ? "Image" : "Vidéo"}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="file" className="block text-sm font-medium">
            Fichier <span className="text-gold">*</span>
          </label>
          <input
            id="file"
            key={kind}
            name="file"
            type="file"
            accept={limits.accept}
            required
            disabled={busy}
            className="block w-full border border-line bg-ink px-4 py-3 text-sm text-mist file:mr-4 file:border-0 file:bg-gold file:px-4 file:py-2 file:font-display file:text-xs file:uppercase file:text-ink"
          />
          <p className="text-xs text-mist">{limits.label} · {limits.maxMb} Mo maximum</p>
        </div>
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">Titre</label>
          <input id="title" name="title" maxLength={120} placeholder="Ex. Promotion Pilates 2026" disabled={busy} className="input" />
        </div>
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium">Catégorie de galerie</label>
          <input id="category" name="category" maxLength={40} list="categories" placeholder="Ex. promotions" disabled={busy} className="input" />
          <datalist id="categories">
            {["promotions", "certifications", "terrain", "studio", "evenements"].map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="formationId" className="block text-sm font-medium">Formation associée</label>
          <select id="formationId" name="formationId" defaultValue="" disabled={busy} className="input">
            <option value="">Aucune (galerie générale)</option>
            {formations.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <p className="text-xs text-mist">Les médias associés s&apos;affichent dans la galerie de la page de la formation.</p>
        </div>
      </div>

      {busy && (
        <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Progression de l'envoi" className="h-2 overflow-hidden bg-ink">
          <div className="h-full bg-gold transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div aria-live="polite">
        {message && <p role={message.tone === "error" ? "alert" : undefined} className={`text-sm ${message.tone === "ok" ? "text-football" : "text-red-300"}`}>{message.text}</p>}
      </div>

      <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-60">
        {busy ? `Envoi… ${progress}%` : "Envoyer"}
      </button>
    </form>
  );
}
