"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { Icon } from "./Icon";

export function HomeHeroVideo({ src, poster }: { src?: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const [paused, setPaused] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const video = ref.current;
    const update = () => {
      const shouldPlay = !preference.matches;
      setMotionAllowed(shouldPlay);
      if (!video) return;
      if (!shouldPlay) {
        video.pause();
        return;
      }
      void video.play().catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "NotAllowedError") return;
        console.error("[home] hero video playback failed", error);
      });
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  if (!src) {
    return <Image src={poster} alt="" fill priority sizes="100vw" className="absolute inset-0 -z-20 object-cover" />;
  }

  // Bouton pause / lecture : toute vidéo qui tourne en continu doit pouvoir être arrêtée (WCAG 2.2.2).
  const toggle = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => undefined);
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <>
      <video
        ref={ref}
        key={src}
        src={src}
        poster={poster}
        autoPlay={motionAllowed}
        loop
        muted
        playsInline
        preload={motionAllowed ? "metadata" : "none"}
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      {motionAllowed && (
        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? t.common.playVideo : t.common.pauseVideo}
          aria-pressed={paused}
          className="absolute end-5 top-24 z-10 grid size-11 place-items-center rounded-full border border-bone/30 bg-ink/50 text-bone backdrop-blur transition-colors hover:border-gold hover:text-gold sm:end-8 sm:top-28"
        >
          {paused ? (
            <Icon name="play" width={16} height={16} />
          ) : (
            <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          )}
        </button>
      )}
    </>
  );
}
