"use client";

import { useEffect, useRef, useState } from "react";
import { preconnect } from "react-dom";

export type FacebookVideoLayout = "portrait" | "square" | "landscape";

type FacebookVideoEmbedProps = {
  url: string;
  title: string;
  layout?: FacebookVideoLayout;
  loading?: "eager" | "lazy";
  /** Relance la vidéo à la fin. Activé par défaut : les vidéos du site tournent en continu. */
  loop?: boolean;
  /** Vidéo de fond (héro) : couvre tout le parent, sans interaction. */
  background?: boolean;
  /**
   * « cover » : la vidéo remplit entièrement le parent (positionné, à taille fixée par l'appelant) en étant
   * recadrée au besoin, comme une photo en object-cover. Permet d'aligner des vidéos de formats différents
   * dans des cadres identiques.
   */
  fit?: "contain" | "cover";
  /** Faux : la vidéo reste chargée mais en pause (plan en attente dans une rotation de fond). Vrai par défaut. */
  active?: boolean;
  /** Appelé à la fin de la vidéo (au lieu de boucler), pour passer au plan suivant. */
  onEnded?: () => void;
};

const RATIO: Record<FacebookVideoLayout, number> = { portrait: 9 / 16, square: 1, landscape: 16 / 9 };

/* ---------------------------------------------------------------------------------------------
 * Lecture automatique : l'iframe « plugins/video.php » ignore souvent le paramètre autoplay, ce qui
 * laisse les vidéos en pause. Le SDK JavaScript de Facebook expose le lecteur (play, mute, seek…) :
 * on coupe le son (condition imposée par les navigateurs), on lance la lecture dès que le lecteur est
 * prêt, on la relance quand la vidéo revient à l'écran et on boucle à la fin.
 * Si le SDK est bloqué (bloqueur de publicité, réseau), on revient à l'iframe classique.
 * ------------------------------------------------------------------------------------------- */

type FacebookPlayer = {
  play(): void;
  pause(): void;
  mute(): void;
  seek(seconds: number): void;
  subscribe(event: string, callback: () => void): { release(): void } | undefined;
};

type FacebookSdk = {
  init(options: { xfbml: boolean; version: string }): void;
  XFBML: { parse(element?: Element): void };
  Event: { subscribe(event: string, callback: (message: { type: string; id: string; instance: FacebookPlayer }) => void): void };
};

declare global {
  interface Window {
    FB?: FacebookSdk;
    fbAsyncInit?: () => void;
  }
}

const SDK_VERSION = "v21.0";
const READY_TIMEOUT_MS = 10_000;
/** Marge d'anticipation : le lecteur est préparé bien avant d'entrer à l'écran pour éviter l'attente. */
const PRELOAD_MARGIN = "900px 0px";
const readyCallbacks = new Map<string, (player: FacebookPlayer) => void>();
let sdkPromise: Promise<FacebookSdk> | null = null;
let listening = false;
let nextId = 0;

function listen(sdk: FacebookSdk) {
  if (listening) return;
  listening = true;
  sdk.Event.subscribe("xfbml.ready", (message) => {
    if (message.type === "video") readyCallbacks.get(message.id)?.(message.instance);
  });
}

function loadSdk(): Promise<FacebookSdk> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<FacebookSdk>((resolve, reject) => {
    if (window.FB) {
      listen(window.FB);
      resolve(window.FB);
      return;
    }
    window.fbAsyncInit = () => {
      const sdk = window.FB;
      if (!sdk) {
        reject(new Error("Facebook SDK initialised without FB global"));
        return;
      }
      sdk.init({ xfbml: false, version: SDK_VERSION });
      listen(sdk);
      resolve(sdk);
    };
    const script = document.createElement("script");
    script.src = `https://connect.facebook.net/${document.documentElement.lang === "ar" ? "ar_AR" : document.documentElement.lang === "en" ? "en_US" : "fr_FR"}/sdk.js`;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Facebook SDK could not be loaded"));
    };
    document.body.appendChild(script);
  });
  return sdkPromise;
}

function iframeSrc(url: string, layout: FacebookVideoLayout, loop: boolean) {
  const embedUrl = new URL("https://www.facebook.com/plugins/video.php");
  embedUrl.searchParams.set("href", url);
  embedUrl.searchParams.set("show_text", "0");
  embedUrl.searchParams.set("width", layout === "portrait" ? "360" : layout === "square" ? "480" : "560");
  embedUrl.searchParams.set("autoplay", "true");
  embedUrl.searchParams.set("mute", "true");
  if (loop) embedUrl.searchParams.set("loop", "true");
  return embedUrl.toString();
}

export function FacebookVideoEmbed({
  url,
  title,
  layout = "portrait",
  loading = "lazy",
  loop = true,
  background = false,
  fit = "contain",
  active = true,
  onEnded,
}: FacebookVideoEmbedProps) {
  const activeRef = useRef(active);
  const onEndedRef = useRef(onEnded);
  const playerRef = useRef<FacebookPlayer | null>(null);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);
  // Plan activé : reprise depuis le début ; plan désactivé : pause.
  useEffect(() => {
    activeRef.current = active;
    const player = playerRef.current;
    if (!player) return;
    if (active) {
      player.seek(0);
      player.mute();
      player.play();
    } else {
      player.pause();
    }
  }, [active]);
  // Ouvre les connexions vers Facebook dès le rendu de la page : le SDK et le lecteur arrivent plus vite.
  preconnect("https://connect.facebook.net", { crossOrigin: "anonymous" });
  preconnect("https://www.facebook.com");
  preconnect("https://video.xx.fbcdn.net");
  const frameRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  const [ready, setReady] = useState(false);
  const cover = background || fit === "cover";
  const eager = background || loading === "eager";

  useEffect(() => {
    const frame = frameRef.current;
    const host = hostRef.current;
    if (!frame || !host || fallback) return;

    let cancelled = false;
    let player: FacebookPlayer | null = null;
    let visible = eager;
    const id = `fb-video-${++nextId}`;
    const releases: { release(): void }[] = [];
    let readyTimer: number | undefined;
    let element: HTMLDivElement | null = null;

    const play = () => {
      if (!player || !activeRef.current) return;
      player.mute();
      player.play();
    };

    const mount = () => {
      if (element || cancelled) return;
      element = document.createElement("div");
      element.id = id;
      element.className = "fb-video";
      element.dataset.href = url;
      element.dataset.width = String(Math.max(220, Math.round(host.clientWidth || frame.clientWidth || 360)));
      element.dataset.autoplay = "true";
      element.dataset.allowfullscreen = background ? "false" : "true";
      element.dataset.showText = "false";
      element.dataset.showCaptions = "false";
      element.dataset.lazy = "false";
      host.appendChild(element);

      readyCallbacks.set(id, (instance) => {
        if (cancelled) return;
        window.clearTimeout(readyTimer);
        player = instance;
        playerRef.current = instance;
        setReady(true);
        const finished = instance.subscribe("finishedPlaying", () => {
          if (onEndedRef.current) {
            onEndedRef.current();
            return;
          }
          if (!loop) return;
          instance.seek(0);
          play();
        });
        if (finished) releases.push(finished);
        if (visible) play();
        else instance.pause();
        // Lecture automatique du SDK : un plan en attente ne doit pas tourner en arrière-plan.
        if (!activeRef.current) instance.pause();
      });

      readyTimer = window.setTimeout(() => {
        if (!player && !cancelled) setFallback(true);
      }, READY_TIMEOUT_MS);

      loadSdk()
        .then((sdk) => {
          if (!cancelled) sdk.XFBML.parse(host);
        })
        .catch((error: unknown) => {
          console.warn("[video] Facebook SDK unavailable, using the iframe player", error);
          if (!cancelled) setFallback(true);
        });
    };

    // Le SDK est téléchargé tout de suite (une seule fois pour toute la page), même si la vidéo est plus bas.
    loadSdk().catch(() => undefined);

    // Chargement dès l'approche de l'écran, puis relance de la lecture à chaque retour dans la vue.
    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible) {
            mount();
            play();
          }
        }, { rootMargin: PRELOAD_MARGIN })
      : null;
    // Pause hors écran : économise la bande passante et le processeur quand plusieurs vidéos tournent.
    const pauseObserver = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) player?.pause();
          else if (visible) play();
        })
      : null;
    pauseObserver?.observe(frame);

    if (eager || !observer) mount();
    observer?.observe(frame);

    return () => {
      cancelled = true;
      observer?.disconnect();
      pauseObserver?.disconnect();
      window.clearTimeout(readyTimer);
      readyCallbacks.delete(id);
      releases.forEach((subscription) => subscription.release());
      playerRef.current = null;
      element?.remove();
      host.replaceChildren();
    };
  }, [url, loop, background, eager, fallback]);

  const aspectClassName = layout === "portrait"
    ? "aspect-[9/16] max-w-[360px]"
    : layout === "square"
      ? "aspect-square max-w-[480px]"
      : "aspect-video max-w-none";
  // Recadrage « cover » : le lecteur garde son format natif et déborde du cadre, centré (unités de conteneur).
  // Format réel de la vidéo : un reel vertical en fond est agrandi à la largeur et recadré en haut / bas.
  const ratio = RATIO[layout];
  const fillStyle = cover
    ? {
        width: `max(100cqw, calc(100cqh * ${ratio}))`,
        height: `max(100cqh, calc(100cqw / ${ratio}))`,
      }
    : undefined;
  const fillClassName = cover ? "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" : "absolute inset-0";
  const frameClassName = background
    ? "pointer-events-none absolute inset-0 -z-20 overflow-hidden bg-black"
    : cover
      ? "absolute inset-0 overflow-hidden bg-black"
      : `relative mx-auto w-full overflow-hidden bg-black ${aspectClassName}`;

  return (
    <div
      ref={frameRef}
      aria-hidden={background || undefined}
      className={frameClassName}
      style={cover ? { containerType: "size" } : undefined}
    >
      {!background && (
        <div aria-hidden="true" className={`video-skeleton absolute inset-0 transition-opacity duration-700 ${ready || fallback ? "opacity-0" : "opacity-100"}`}>
          <span className="video-skeleton-play" />
        </div>
      )}
      {fallback ? (
        <iframe
          src={iframeSrc(url, layout, loop)}
          title={title}
          loading={eager ? "eager" : "lazy"}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen={!background}
          tabIndex={background ? -1 : undefined}
          className={`${fillClassName} border-0 ${cover ? "" : "size-full"}`}
          style={fillStyle}
        />
      ) : (
        <div
          ref={hostRef}
          title={title}
          className={`fb-embed-host ${fillClassName} transition-opacity duration-700 ${cover ? "" : "size-full"} ${ready || background ? "opacity-100" : "opacity-0"}`}
          style={fillStyle}
        />
      )}
    </div>
  );
}
