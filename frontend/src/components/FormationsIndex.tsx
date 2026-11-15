"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

export type FormationsIndexItem = {
  href: string;
  title: string;
  academy: string;
  detail: string;
  image: string | StaticImageData;
};

/**
 * Index des formations : une liste typographique pleine largeur. Au survol (souris), l'affiche de la
 * formation apparaît et suit le pointeur ; les autres lignes s'estompent. Sur écran tactile, une vignette
 * accompagne chaque ligne à la place de l'aperçu flottant.
 */
export function FormationsIndex({ items }: { items: FormationsIndexItem[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let first = true;

    const render = () => {
      const ease = reduced ? 1 : 0.16;
      current.x += (target.x - current.x) * ease;
      current.y += (target.y - current.y) * ease;
      // Légère inclinaison proportionnelle à la vitesse horizontale : l'affiche « suit » le geste.
      const tilt = reduced ? 0 : Math.max(-8, Math.min(8, (target.x - current.x) * 0.08));
      preview.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) rotate(${tilt}deg)`;
      frame = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.2 ? requestAnimationFrame(render) : 0;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      if (first) {
        current.x = target.x;
        current.y = target.y;
        first = false;
      }
      if (!frame) frame = requestAnimationFrame(render);
    };
    const onLeave = () => {
      first = true;
      setActive(null);
    };
    list.addEventListener("pointermove", onMove);
    list.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="relative">
      <ul ref={listRef} className="formations-index border-t border-line" data-active={active !== null || undefined}>
        {items.map((item, index) => (
          <li key={item.href} data-current={active === index || undefined} className="formations-index-row border-b border-line">
            <Link
              href={item.href}
              onPointerEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              className="group flex items-center gap-4 py-5 outline-none sm:gap-6 sm:py-7 focus-visible:bg-white/[0.03]"
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-full border border-line sm:hidden">
                <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="formations-index-title block font-display text-2xl leading-[1.05] uppercase sm:text-4xl lg:text-5xl">{item.title}</span>
                <span className="mt-2 block text-sm text-mist sm:hidden">{item.academy}</span>
              </span>
              <span className="hidden w-64 shrink-0 text-end sm:block">
                <span className="block text-sm text-bone">{item.academy}</span>
                <span className="mt-1 block text-xs text-mist">{item.detail}</span>
              </span>
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-mist transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-ink group-focus-visible:border-gold group-focus-visible:text-gold">
                <Icon name="arrow" width={18} height={18} className="transition-transform duration-300 group-hover:-rotate-45 rtl:-scale-x-100 rtl:group-hover:rotate-45" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Aperçu flottant (souris uniquement) : toutes les affiches sont chargées, une seule est visible. */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className="formations-preview pointer-events-none fixed top-0 left-0 z-30 hidden [@media(hover:hover)_and_(pointer:fine)]:block"
        data-visible={active !== null || undefined}
      >
        <div className="formations-preview-frame relative ms-10 h-[19rem] w-[14rem] -translate-y-1/2 overflow-hidden border border-gold/40 bg-ink shadow-2xl shadow-black/60">
          {items.map((item, index) => (
            <Image
              key={item.href}
              src={item.image}
              alt=""
              fill
              sizes="224px"
              className={`object-cover transition-[opacity,scale] duration-500 ${active === index ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
