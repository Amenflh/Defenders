"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Signature du pied de page : le nom de la marque apparaît lettre par lettre (montée + fondu en cascade)
 * quand le bas de page entre dans l'écran. Le nom complet reste lisible sans JavaScript.
 */
export function FooterWordmark({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window)) {
      const frame = window.requestAnimationFrame(() => setVisible(true));
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <p ref={ref} data-wordmark={visible ? "visible" : "hidden"} className="footer-wordmark-text font-display leading-[0.8] uppercase">
      {Array.from(text).map((letter, index) => (
        <span key={index} className="footer-wordmark-letter" style={{ "--letter-index": index } as CSSProperties}>
          {letter === " " ? " " : letter}
        </span>
      ))}
    </p>
  );
}
