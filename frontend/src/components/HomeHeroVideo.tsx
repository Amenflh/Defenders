"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FacebookVideoEmbed, type FacebookVideoLayout } from "./FacebookVideoEmbed";

/** Un plan du fond animé : une vidéo, ou une série de photos animées (zoom lent) quand la vidéo n'existe pas encore. */
export type HeroClip =
  | { type: "video"; src: string; label?: string }
  | { type: "photos"; images: string[]; label?: string }
  /** Reel Facebook de l'académie, lu sans son et sans interaction. */
  | { type: "facebook"; url: string; layout: FacebookVideoLayout; label?: string };

/** Durée maximale d'un plan quand plusieurs plans s'enchaînent (une vidéo plus courte passe à la suivante à sa fin). */
const MAX_CLIP_MS = 9000;
/** Un reel Facebook met quelques secondes à démarrer : il reste plus longtemps à l'écran. */
const FACEBOOK_CLIP_MS = 16000;
/** Le plan suivant est préparé quelques secondes après le début du plan en cours. */
const PRELOAD_NEXT_MS = 3500;

const clipKey = (clip: HeroClip) => (clip.type === "video" ? clip.src : clip.type === "facebook" ? clip.url : clip.images.join("|"));

/**
 * Fond animé des en-têtes : une seule vidéo en boucle (`src`), ou plusieurs plans (`clips` / `sources`) qui
 * s'enchaînent en fondu. Une vidéo illisible est ignorée. Muette et décorative, elle se lit même quand les animations du système sont coupées.
 */
/**
 * `poster` : image affichée avant la vidéo. Les en-têtes de page n'en passent pas (fond sombre puis vidéo, sans
 * image intermédiaire qui « clignote » au changement de page) ; les cartes de formation, elles, en ont une.
 */
export function HomeHeroVideo({ src, sources, clips, poster }: { src?: string; sources?: string[]; clips?: HeroClip[]; poster?: string }) {
  const list: HeroClip[] = clips?.length
    ? clips
    : (sources?.length ? sources : src ? [src] : []).map((url) => ({ type: "video" as const, src: url }));
  const [failed, setFailed] = useState<string[]>([]);
  const playable = list.filter((clip) =>
    clip.type === "photos" ? clip.images.length > 0 : clip.type === "facebook" ? Boolean(clip.url) : !failed.includes(clip.src));
  // En-tête sorti de l'écran : tout est mis en pause (processeur, batterie et données économisés).
  const [playing, setPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const multiple = playable.length > 1;
  const hasClips = playable.length > 0;
  const current = playable.length ? active % playable.length : 0;
  const playableKey = playable.map(clipKey).join("\n");
  const currentIsFacebook = playable[current]?.type === "facebook";
  const nextKey = playable.length > 1 ? clipKey(playable[(current + 1) % playable.length]) : "";
  const currentKey = playable.length ? clipKey(playable[current]) : "";
  // Reels Facebook chargés au dernier moment : le SDK Facebook (lourd) ne ralentit plus l'ouverture de la page.
  const [mounted, setMounted] = useState<string[]>([]);
  useEffect(() => {
    const add = (key: string) => setMounted((old) => (key && !old.includes(key) ? [...old, key] : old));
    const now = window.setTimeout(() => add(currentKey), 0);
    const soon = window.setTimeout(() => add(nextKey), PRELOAD_NEXT_MS);
    return () => {
      window.clearTimeout(now);
      window.clearTimeout(soon);
    };
  }, [currentKey, nextKey]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasClips]);

  // Lit la vidéo active, met les autres en pause et revient au début pour leur prochain passage.
  useEffect(() => {
    playable.forEach((clip, index) => {
      const video = clip.type === "video" ? videos.current.get(clip.src) : undefined;
      if (!video) return;
      if (index !== current || !playing) {
        video.pause();
        if (index !== current) video.currentTime = 0;
        return;
      }
      void video.play().catch((error: unknown) => {
        if (error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "AbortError")) return;
        console.warn("[hero] background video playback failed", error);
      });
    });
    if (!multiple || !playing) return;
    const timer = window.setTimeout(() => setActive((value) => value + 1), currentIsFacebook ? FACEBOOK_CLIP_MS : MAX_CLIP_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `playable` est recalculé à chaque rendu ; sa clé suffit.
  }, [current, playing, multiple, playableKey, currentIsFacebook]);

  if (!playable.length) {
    return poster
      ? <Image src={poster} alt="" fill priority sizes="100vw" className="absolute inset-0 -z-20 object-cover" />
      : <div aria-hidden="true" className="absolute inset-0 -z-20 bg-ink" />;
  }

  return (
    <div ref={containerRef} aria-hidden="true" className="absolute inset-0 -z-20 bg-ink">
      {playable.map((clip, index) => {
        const visible = index === current;
        const layer = `absolute inset-0 h-full w-full transition-opacity duration-1000 ${visible ? "opacity-100" : "opacity-0"}`;
        if (clip.type === "facebook") {
          if (!mounted.includes(clip.url)) return null;
          return (
            <div key={clip.url} className={`${layer} isolate`}>
              <FacebookVideoEmbed
                url={clip.url}
                layout={clip.layout}
                title={clip.label ?? ""}
                background
                loop={!multiple}
                active={visible && playing}
                onEnded={multiple ? () => setActive((value) => (value % playable.length === index ? value + 1 : value)) : undefined}
              />
            </div>
          );
        }
        if (clip.type === "photos") {
          return <PhotoClip key={clip.images.join("|")} images={clip.images} playing={visible && playing} className={layer} />;
        }
        return (
          <video
            key={clip.src}
            ref={(node) => {
              if (node) videos.current.set(clip.src, node);
              else videos.current.delete(clip.src);
            }}
            src={clip.src}
            poster={index === 0 ? poster : undefined}
            loop={!multiple}
            muted
            playsInline
            // Plan en cours : chargé tout de suite (dès le premier rendu) pour que la vidéo apparaisse sans attente.
            preload={visible ? "auto" : index === (current + 1) % playable.length ? "auto" : "metadata"}
            onEnded={multiple ? () => setActive((value) => value + 1) : undefined}
            onError={() => {
              // Fichier illisible : le plan est retiré de la rotation (avertissement seulement, ce n'est pas une panne).
              console.warn(`[hero] background video unavailable, skipped: ${clip.src}`);
              setFailed((old) => (old.includes(clip.src) ? old : [...old, clip.src]));
            }}
            className={`${layer} object-cover`}
          />
        );
      })}
    </div>
  );
}

/** Photos qui se succèdent en fondu avec un zoom lent, pour donner un effet vidéo. */
function PhotoClip({ images, playing, className }: { images: string[]; playing: boolean; className: string }) {
  const [step, setStep] = useState(0);
  const perImage = Math.max(2500, Math.floor(MAX_CLIP_MS / images.length));

  useEffect(() => {
    if (!playing || images.length < 2) return;
    const timer = window.setInterval(() => setStep((value) => value + 1), perImage);
    return () => window.clearInterval(timer);
  }, [playing, images.length, perImage]);

  const shown = step % images.length;
  return (
    <div className={`${className} overflow-hidden`}>
      {images.map((image, index) => (
        <Image
          key={image}
          src={image}
          alt=""
          fill
          sizes="100vw"
          className={`object-cover transition-[opacity,transform] ease-linear ${index === shown ? "opacity-100" : "opacity-0"} ${
            playing && index === shown ? "scale-110" : "scale-100"
          }`}
          style={{ transitionDuration: `1000ms, ${perImage + 1000}ms` }}
        />
      ))}
    </div>
  );
}
