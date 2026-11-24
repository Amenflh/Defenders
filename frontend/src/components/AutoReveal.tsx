"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type Direction = "left" | "right" | "up";
const GRID_DIRECTIONS: Direction[] = ["left", "up", "right"];

/**
 * Animations sur toutes les pages du site, sans modifier chaque page :
 * - chaque bloc des sections de <main> entre en glissant depuis la gauche ou la droite
 *   (les éléments d'une grille alternent gauche / bas / droite) ;
 * - les cartes des grilles se soulèvent au survol, les cellules collées changent de fond.
 * Réutilise les styles du composant <Reveal> (attribut data-reveal). Ignore les blocs déjà animés,
 * les en-têtes vidéo (.surface-dark) et tout ce qui est marqué data-no-auto-reveal.
 * Sans JavaScript ou avec « réduire les animations », rien n'est masqué.
 */
export function AutoReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.getElementById("contenu");
    if (!main || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );

    const alreadyAnimated = (el: Element) =>
      el.hasAttribute("data-reveal") || el.querySelector("[data-reveal]") !== null || el.parentElement?.closest("[data-reveal]") !== null;

    const animate = (el: HTMLElement, from: Direction, delay: number) => {
      // Bloc masqué par un passage précédent mais pas encore apparu : on le surveille de nouveau.
      if (el.dataset.autoReveal) {
        if (el.dataset.visible !== "true") observer.observe(el);
        return;
      }
      if (alreadyAnimated(el)) return;
      // Déjà affiché à l'écran au moment du traitement : on ne le masque pas (pas de clignotement).
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) return;
      el.dataset.autoReveal = "true";
      el.dataset.reveal = from === "up" ? "" : from;
      el.style.setProperty("--reveal-delay", `${delay}ms`);
      observer.observe(el);
    };

    const isGrid = (el: Element) => {
      const style = getComputedStyle(el);
      return (style.display === "grid" || style.display === "inline-grid") && el.children.length >= 2;
    };

    const decorateCards = (grid: Element) => {
      const tight = /\bgap-px\b/.test(grid.className);
      for (const child of Array.from(grid.children)) {
        const el = child as HTMLElement;
        if (el.dataset.autoCard || el.classList.contains("video-card") || el.classList.contains("card-hover")) continue;
        if (tight) el.dataset.autoCard = "cell";
        else if (/\bborder\b/.test(el.className) || el.querySelector(":scope > .border, :scope > a.border")) el.dataset.autoCard = "lift";
      }
    };

    const process = () => {
      for (const section of Array.from(main.querySelectorAll("section"))) {
        if (section.closest(".surface-dark, [data-no-auto-reveal]")) continue;
        const container = section.querySelector(":scope > .container-site") ?? section;
        const blocks = Array.from(container.children).filter((el): el is HTMLElement => el instanceof HTMLElement);

        if (isGrid(container)) {
          decorateCards(container);
          blocks.forEach((el, i) => animate(el, GRID_DIRECTIONS[i % 3], (i % 3) * 90));
          continue;
        }
        let side = 0;
        for (const block of blocks) {
          if (isGrid(block)) {
            decorateCards(block);
            Array.from(block.children).forEach((el, i) => {
              if (el instanceof HTMLElement) animate(el, GRID_DIRECTIONS[i % 3], (i % 3) * 90);
            });
            continue;
          }
          // Titres et blocs successifs : gauche, puis droite, puis gauche…
          animate(block, side % 2 === 0 ? "left" : "right", 0);
          side += 1;
        }
      }
    };

    // Après l'affichage, puis une seconde fois pour le contenu arrivé en streaming.
    const frame = window.requestAnimationFrame(process);
    const late = window.setTimeout(process, 800);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(late);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}
