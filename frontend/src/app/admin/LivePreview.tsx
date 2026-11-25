"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";
import { previewHref, type FromPreview, type ToPreview } from "@/lib/preview/config";
import type { Draft } from "@/lib/preview/draft";
import { setPreviewDraftAction } from "./preview-actions";

const DEVICES = [
  { key: "desktop", label: "Ordinateur", width: 1280 },
  { key: "tablet", label: "Tablette", width: 820 },
  { key: "mobile", label: "Téléphone", width: 390 },
] as const;
type Device = (typeof DEVICES)[number]["key"];

const EMPTY: Draft = {};

/**
 * La vraie page du site, à côté du formulaire : elle se met à jour pendant la saisie, sans rien publier.
 * « Avant » montre la version actuellement en ligne, « Après » le résultat des modifications.
 */
export function LivePreview({ path, draft, focus, locale: fixedLocale, edit = false, onSelect, onLocale, className = "", height = "72vh" }: {
  path: string;
  draft: Draft;
  /** Zone à montrer (« f.12 », « t.home.title »…). */
  focus?: string;
  locale?: Locale;
  /** Mode « cliquer pour modifier ». */
  edit?: boolean;
  onSelect?: (message: Extract<FromPreview, { type: "dfa:select" }>) => void;
  onLocale?: (locale: Locale) => void;
  className?: string;
  height?: string;
}) {
  // Identifiant propre à cette fenêtre d'aperçu : deux onglets ne se mélangent pas.
  const [draftId] = useState(() => Math.random().toString(36).slice(2, 12));
  const [ownLocale, setOwnLocale] = useState<Locale>("fr");
  const locale = fixedLocale ?? ownLocale;
  const [chosenDevice, setDevice] = useState<Device | null>(null);
  const [before, setBefore] = useState(false);
  const [busy, setBusy] = useState(true);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [ready, setReady] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  // Petit écran : l'aperçu est loin du champ, un bouton mène de l'un à l'autre.
  const [inView, setInView] = useState(true);
  const [returnTo, setReturnTo] = useState<number | null>(null);
  const latest = useRef({ edit, focus, onSelect });
  useEffect(() => {
    latest.current = { edit, focus, onSelect };
  });

  const post = (message: ToPreview) => frame.current?.contentWindow?.postMessage(message, window.location.origin);
  const src = useMemo(() => previewHref(path, locale, draftId), [path, locale, draftId]);
  const shownDraft = before ? EMPTY : draft;
  const serialized = JSON.stringify(shownDraft);

  // Chargement de la page, seulement une fois le brouillon reçu par le serveur.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setBusy(true);
      await setPreviewDraftAction(draftId, JSON.parse(serialized) as Draft).catch(() => false);
      if (cancelled) return;
      if (loadedSrc !== src) {
        setReady(false);
        setLoadedSrc(src);
      } else post({ type: "dfa:refresh" });
    }, loadedSrc === src ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [serialized, src, draftId, loadedSrc]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<FromPreview>) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      const message = event.data;
      if (message?.type === "dfa:ready") {
        setReady(true);
        setBusy(false);
        post({ type: "dfa:mode", edit: latest.current.edit });
        if (latest.current.focus) window.setTimeout(() => latest.current.focus && post({ type: "dfa:focus", ref: latest.current.focus }), 500);
      }
      if (message?.type === "dfa:refreshed") {
        setBusy(false);
        if (latest.current.focus) post({ type: "dfa:focus", ref: latest.current.focus });
      }
      if (message?.type === "dfa:select") latest.current.onSelect?.(message);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (ready) post({ type: "dfa:mode", edit });
  }, [edit, ready]);
  useEffect(() => {
    if (ready && focus) post({ type: "dfa:focus", ref: focus });
  }, [focus, ready]);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    const visibility = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "-25% 0px" });
    observer.observe(element);
    visibility.observe(element);
    return () => {
      observer.disconnect();
      visibility.disconnect();
    };
  }, []);

  // Petit écran : version téléphone par défaut, la version ordinateur y serait illisible.
  const device = chosenDevice ?? (size.width > 0 && size.width < 480 ? "mobile" : "desktop");
  const width = DEVICES.find((d) => d.key === device)!.width;
  const scale = size.width ? Math.min(1, size.width / width) : 1;
  const changed = Object.keys(draft).length > 0;
  const button = (active: boolean) => `border px-2.5 py-1.5 text-[0.68rem] uppercase tracking-wider transition-colors ${active ? "border-gold bg-gold text-ink" : "border-line text-mist hover:text-bone"}`;

  return (
    <div className={`flex min-w-0 scroll-mt-24 flex-col border border-line bg-ink-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line p-2.5">
        <p className="flex items-center gap-2 text-xs text-bone">
          <span aria-hidden="true" className={`size-2 rounded-full ${busy ? "animate-pulse bg-gold" : "bg-emerald-500"}`} />
          {busy ? "Mise à jour…" : "Aperçu en direct"}
        </p>
        <div role="group" aria-label="Taille d'écran" className="flex gap-1">
          {DEVICES.map((d) => <button key={d.key} type="button" aria-pressed={device === d.key} onClick={() => setDevice(d.key)} className={button(device === d.key)}>{d.label}</button>)}
        </div>
        <div role="group" aria-label="Langue de l'aperçu" className="flex gap-1">
          {LOCALES.map((l) => <button key={l} type="button" aria-pressed={locale === l} onClick={() => { setOwnLocale(l); onLocale?.(l); }} className={button(locale === l)}>{LOCALE_LABELS[l].short}</button>)}
        </div>
        <div role="group" aria-label="Comparer" className="ms-auto flex gap-1">
          <button type="button" aria-pressed={before} disabled={!changed} onClick={() => setBefore(true)} className={`${button(before)} disabled:opacity-40`}>Avant</button>
          <button type="button" aria-pressed={!before} onClick={() => setBefore(false)} className={button(!before)}>Après</button>
        </div>
      </div>
      <div ref={box} style={{ height }} className="relative overflow-hidden bg-ink">
        {loadedSrc && (
          <iframe
            ref={frame}
            key={loadedSrc}
            src={loadedSrc}
            title="Aperçu du site"
            className="absolute top-0 left-1/2 origin-top border-0 bg-ink"
            style={{ width, height: size.height / scale || "100%", transform: `translateX(-50%) scale(${scale})` }}
          />
        )}
        {!ready && <p className="absolute inset-0 grid place-items-center bg-ink text-sm text-mist">Chargement de l&apos;aperçu…</p>}
      </div>
      {(!inView || returnTo !== null) && (
        <button
          type="button"
          onClick={() => {
            if (!inView) {
              setReturnTo(window.scrollY);
              box.current?.parentElement?.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              window.scrollTo({ top: returnTo ?? 0, behavior: "smooth" });
              setReturnTo(null);
            }
          }}
          className="fixed end-4 bottom-40 z-20 border border-gold bg-ink-2 px-4 py-3 text-xs tracking-wider text-gold uppercase shadow-2xl"
        >
          {inView ? "↩ Retour au formulaire" : "Voir l'aperçu"}
        </button>
      )}
    </div>
  );
}
