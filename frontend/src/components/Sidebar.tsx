"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { mainNav, site } from "@/lib/site";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

type Props = { open: boolean; onClose: () => void; pathname: string };

/** Panneau latéral : navigation complète, coordonnées et appel à l'action. */
export function Sidebar({ open, onClose, pathname }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        id="site-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        inert={!open}
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-line bg-ink-2 transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <Logo />
          <button
            ref={closeRef}
            onClick={onClose}
            className="grid size-11 place-items-center rounded-full border border-line hover:border-bone"
            aria-label="Fermer le menu"
          >
            <Icon name="close" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-6" aria-label="Navigation principale">
          <ol className="space-y-1">
            {mainNav.map((item, i) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li
                  key={item.href}
                  className={`transition-all duration-500 ${open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}`}
                  style={{ transitionDelay: open ? `${120 + i * 50}ms` : "0ms" }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-baseline gap-4 py-2.5 font-display text-3xl uppercase tracking-wide transition-colors ${active ? "text-gold" : "text-bone hover:text-gold"}`}
                  >
                    <span className="w-7 text-xs tracking-widest text-mist">0{i + 1}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="space-y-4 border-t border-line px-6 py-6 text-sm">
          <a href={site.phone.href} className="flex items-center gap-3 text-mist hover:text-bone">
            <Icon name="phone" className="text-gold" /> {site.phone.label}
          </a>
          <a href={site.email.href} className="flex items-center gap-3 text-mist hover:text-bone">
            <Icon name="mail" className="text-gold" /> {site.email.label}
          </a>
          <a href={site.facebook.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-mist hover:text-bone">
            <Icon name="facebook" className="text-gold" /> {site.facebook.label}
          </a>
          <a href={site.instagram.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-mist hover:text-bone">
            <Icon name="instagram" className="text-gold" /> {site.instagram.label}
          </a>
          <a href={site.address.href} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-mist hover:text-bone">
            <Icon name="pin" className="text-gold" /> {site.address.lines.join(", ")}
          </a>
          <Link href="/contact" onClick={onClose} className="btn btn-primary mt-2 w-full">
            Réserver ma place <Icon name="arrow" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
