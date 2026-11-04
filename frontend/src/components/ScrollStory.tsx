"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type StoryItem = {
  id: string;
  label: string;
  title: string;
  body: ReactNode;
  points: string[];
};

/**
 * Section « domaine d'activité » : une colonne latérale collante (sommaire + progression)
 * suit le défilement pendant que les blocs de contenu apparaissent à droite.
 */
export function ScrollStory({ items }: { items: StoryItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blocks = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    // 1) Apparition : dès qu'un bloc entre par le bas de l'écran.
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            revealObserver.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    // 2) Sommaire : le bloc actif est celui qui traverse le milieu de l'écran.
    const activeObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    blocks.forEach((b) => {
      revealObserver.observe(b);
      activeObserver.observe(b);
    });

    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.5;
      const passed = window.innerHeight * 0.5 - rect.top;
      setProgress(Math.min(1, Math.max(0, passed / total)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      revealObserver.disconnect();
      activeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  return (
    <div ref={sectionRef} className="grid gap-12 lg:grid-cols-[18rem_1fr] lg:gap-20">
      {/* Colonne latérale collante */}
      <aside className="hidden lg:block" aria-label="Sommaire de la section">
        <div className="sticky top-32">
          <div className="relative pl-6">
            <div className="absolute top-0 bottom-0 left-0 w-px bg-line" />
            <div
              className="absolute top-0 left-0 w-px bg-gold transition-[height] duration-200"
              style={{ height: `${progress * 100}%` }}
            />
            <ol className="space-y-6">
              {items.map((item, i) => {
                const isActive = item.id === active;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`block transition-all duration-500 ${isActive ? "translate-x-1 text-bone" : "text-mist hover:text-bone"}`}
                    >
                      <span className={`block font-display text-xs tracking-[0.3em] ${isActive ? "text-gold" : ""}`}>
                        0{i + 1}
                      </span>
                      <span className="font-display text-xl tracking-wide uppercase">{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </aside>

      {/* Blocs de contenu */}
      <div className="space-y-20 lg:space-y-28 lg:py-[8vh]">
        {items.map((item, i) => (
          <article key={item.id} id={item.id} data-reveal="" className="scroll-mt-32">
            <p className="eyebrow mb-4">
              0{i + 1} — {item.label}
            </p>
            <h3 className="heading-lg mb-6 max-w-2xl">{item.title}</h3>
            <div className="max-w-2xl space-y-4 text-lg leading-relaxed text-mist">{item.body}</div>
            <ul className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
              {item.points.map((p) => (
                <li key={p} className="flex items-start gap-3 border border-line bg-ink-2 px-4 py-3 text-sm">
                  <span className="mt-0.5 text-gold" aria-hidden="true">✦</span>
                  {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
