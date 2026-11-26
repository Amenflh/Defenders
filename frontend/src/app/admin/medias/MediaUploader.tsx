"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ACADEMIES, ACADEMY_NAME, MEDIA_CATEGORIES } from "@/lib/academies";
import { addMediaLink, refreshMedia } from "./actions";

/** Emplacement et académie d'un média (envoi, lien et modification). */
export function PlacementFields({ category = "galerie", academy = "", position, disabled }: { category?: string; academy?: string; position?: number; disabled?: boolean }) {
  const known = MEDIA_CATEGORIES.some((c) => c.value === category);
  return (
    <>
      <select name="category" defaultValue={category} aria-label="Emplacement" disabled={disabled} className="input !py-2 text-sm">
        {!known && <option value={category}>{category}</option>}
        {MEDIA_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
      <select name="academy" defaultValue={academy} aria-label="Académie" disabled={disabled} className="input !py-2 text-sm">
        <option value="">Les deux académies</option>
        {ACADEMIES.map((a) => <option key={a} value={a}>{ACADEMY_NAME[a]}</option>)}
      </select>
      {position !== undefined && <input name="position" type="number" min={0} max={9999} defaultValue={position} aria-label="Ordre d'affichage" title="Ordre d'affichage" disabled={disabled} className="input !py-2 text-sm" />}
    </>
  );
}

/** Format d'une vidéo : la galerie la recadre dans un cadre identique aux autres. */
export function LayoutField({ layout = "portrait", disabled }: { layout?: string; disabled?: boolean }) {
  return (
    <select name="layout" defaultValue={layout} aria-label="Format de la vidéo" title="Format de la vidéo" disabled={disabled} className="input !py-2 text-sm">
      <option value="portrait">Vidéo verticale (reel)</option>
      <option value="square">Vidéo carrée</option>
      <option value="landscape">Vidéo horizontale</option>
    </select>
  );
}

/** Vidéo Facebook, Instagram, YouTube ou image déjà en ligne : on colle simplement son lien. */
export function MediaLinkForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  return (
    <form ref={formRef} action={(form) => startTransition(async () => {
      const res = await addMediaLink(form);
      setMessage(res.ok ? { tone: "ok", text: "Média ajouté." } : { tone: "error", text: res.message ?? "Échec" });
      if (res.ok) formRef.current?.reset();
      router.refresh();
    })} className="space-y-3 border border-line bg-ink-2 p-6" aria-busy={pending}>
      <select name="type" defaultValue="video" aria-label="Type" className="input !py-2 text-sm">
        <option value="video">Vidéo</option>
        <option value="image">Image</option>
      </select>
      <input name="url" required placeholder="https://www.facebook.com/reel/…" aria-label="Lien" className="input !py-2 text-sm" />
      <input name="title" maxLength={120} placeholder="Titre (facultatif)" aria-label="Titre" className="input !py-2 text-sm" />
      <LayoutField disabled={pending} />
      <PlacementFields disabled={pending} />
      <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">{pending ? "Ajout…" : "Ajouter"}</button>
      {message && <p role={message.tone === "error" ? "alert" : "status"} className={`text-sm ${message.tone === "ok" ? "text-emerald-500" : "text-red-300"}`}>{message.text}</p>}
    </form>
  );
}

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
          <p className="block text-sm font-medium">Emplacement et académie</p>
          <PlacementFields disabled={busy} />
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
        {message && <p role={message.tone === "error" ? "alert" : undefined} className={`text-sm ${message.tone === "ok" ? "text-emerald-500" : "text-red-300"}`}>{message.text}</p>}
      </div>

      <button type="submit" disabled={busy} className="btn btn-primary disabled:opacity-60">
        {busy ? `Envoi… ${progress}%` : "Envoyer"}
      </button>
    </form>
  );
}
