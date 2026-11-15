"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function HomeHeroVideo({ src, poster }: { src?: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);

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

  return (
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
  );
}
