"use client";

import { useEffect, useState } from "react";

/** Fait défiler une liste de mots, l'un après l'autre. */
export function RotatingWord({ words, interval = 2400 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className="relative inline-grid overflow-hidden align-bottom" aria-live="off">
      {/* Le mot le plus long réserve la largeur pour éviter les sauts de mise en page. */}
      {words.map((word, i) => (
        <span
          key={word}
          aria-hidden={i !== index}
          className={`col-start-1 row-start-1 transition-all duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
            i === index ? "translate-y-0 opacity-100" : i === (index + words.length - 1) % words.length ? "-translate-y-full opacity-0" : "translate-y-full opacity-0"
          }`}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
