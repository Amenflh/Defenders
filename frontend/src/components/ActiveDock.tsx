"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type SectionKey = keyof Dictionary["dock"]["sections"];

/** Sections repérées dans la page, dans l'ordre d'affichage (premier identifiant trouvé retenu). */
const SECTIONS: readonly [SectionKey, ...string[]][] = [
  ["programmes", "programmes"],
  ["equipe", "equipe", "equipe-pedagogique"],
  ["galerie", "galerie"],
  ["temoignages", "temoignages"],
  ["historique", "historique"],
  ["inscription", "inscription"],
];

type FoundSection = { key: SectionKey; id: string };

/**
 * Bandeau affiché sous le header quand une rubrique du menu est ouverte : il remplace le bouton de la rubrique
 * (retiré du menu), montre où l'on se trouve (logo animé, nom, sous-page) et donne un accès direct aux sections
 * de la page, avec la section en cours de lecture mise en évidence.
 */
export function ActiveDock({
  label,
  href,
  logo,
  accent,
  pathname,
  copy,
}: {
  label: string;
  href: string;
  logo?: string;
  accent: string;
  pathname: string;
  copy: Dictionary["dock"];
}) {
  const [sections, setSections] = useState<FoundSection[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [crumb, setCrumb] = useState<string | null>(null);
  const subPage = pathname !== href;

  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    const frame = requestAnimationFrame(() => {
      const found = SECTIONS.flatMap(([key, ...ids]) => {
        const id = ids.find((candidate) => document.getElementById(candidate));
        return id ? [{ key, id }] : [];
      });
      setSections(found);
      setCurrent(null);
      setCrumb(subPage ? document.querySelector("#contenu h1")?.textContent?.trim() || null : null);
      if (!found.length || !("IntersectionObserver" in window)) return;

      const crossing = new Set<string>();
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        const active = found.filter(({ id }) => crossing.has(id)).at(-1);
        setCurrent(active?.id ?? null);
      }, { rootMargin: "-35% 0px -55% 0px" });
      found.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer?.observe(element);
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pathname, subPage]);

  return (
    <div className="dock relative overflow-hidden border-t border-white/5 bg-ink/85" style={{ "--dock": accent } as CSSProperties}>
      <span className="dock-sweep" aria-hidden="true" />
      <div className="container-site relative flex h-11 items-center gap-3 sm:h-12 sm:gap-4">
        <Link href={href} className="group flex min-w-0 shrink-0 items-center gap-2.5" aria-label={`${copy.youAreHere} : ${label}${crumb ? ` / ${crumb}` : ""}`}>
          <span className="dock-lens relative grid size-8 shrink-0 place-items-center rounded-full">
            {logo ? (
              <Image src={logo} alt="" width={28} height={28} className="size-7 rounded-full bg-white object-contain p-0.5" />
            ) : (
              <span className="dock-ping" aria-hidden="true" />
            )}
          </span>
          <span className="dock-label flex min-w-0 flex-col justify-center leading-none">
            <span className="hidden items-center gap-1.5 text-[0.55rem] tracking-[0.24em] text-mist uppercase sm:flex">
              <span className="dock-ping" aria-hidden="true" /> {copy.youAreHere}
            </span>
            <span className="mt-0.5 flex min-w-0 items-center gap-1.5 font-display text-xs tracking-[0.1em] text-bone uppercase sm:mt-1 sm:text-[0.8rem]">
              <span className="truncate transition-colors group-hover:text-[var(--dock)]">{label}</span>
              {crumb && (
                <>
                  <span aria-hidden="true" className="text-mist">/</span>
                  <span className="max-w-36 truncate text-[var(--dock)] sm:max-w-64">{crumb}</span>
                </>
              )}
            </span>
          </span>
        </Link>

        {sections.length > 0 && (
          <>
            <span className="hidden h-5 w-px shrink-0 bg-line sm:block" aria-hidden="true" />
            <nav aria-label={copy.sectionsNav} className="dock-chips -me-2 min-w-0 flex-1 overflow-x-auto pe-2">
              <ul className="flex w-max items-center gap-1.5">
                {sections.map(({ key, id }, index) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      aria-current={current === id ? "location" : undefined}
                      className="dock-chip flex items-center gap-1.5 rounded-full border border-line px-3 py-1 font-display text-[0.62rem] tracking-[0.12em] whitespace-nowrap text-mist uppercase hover:border-[var(--dock)] hover:text-bone"
                    >
                      <span className="opacity-60">{String(index + 1).padStart(2, "0")}</span>
                      {copy.sections[key]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        )}

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0 })}
          aria-label={copy.backToTop}
          title={copy.backToTop}
          className="ms-auto hidden size-8 shrink-0 place-items-center rounded-full border border-line text-mist transition-colors hover:border-[var(--dock)] hover:text-bone sm:grid"
        >
          <span aria-hidden="true">↑</span>
        </button>
      </div>
    </div>
  );
}
