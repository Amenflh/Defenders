"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import gsap from "gsap";

export function HeroSlideshow({ photos }: { photos: StaticImageData[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % photos.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [photos.length]);

  useEffect(() => {
    gsap.fromTo(
      "[data-hero-slide][data-active='true']",
      { scale: 1.04, opacity: 0.25 },
      { scale: 1, opacity: 1, duration: 1.8, ease: "power2.out" },
    );
  }, [active]);

  return (
    <div className="absolute inset-0 -z-20 overflow-hidden bg-ink">
      {photos.map((photo, index) => (
        <div
          key={photo.src}
          data-hero-slide
          data-active={index === active ? "true" : "false"}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        >
          <Image
            src={photo}
            alt=""
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,11,12,.96)_0%,rgba(11,11,12,.82)_48%,rgba(11,11,12,.52)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink" />
    </div>
  );
}
