"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { mainNav } from "@/lib/site";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { Sidebar } from "./Sidebar";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 24);
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        Aller au contenu
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled ? "border-b border-line bg-ink/85 backdrop-blur-md" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-site flex h-18 items-center justify-between gap-6">
          <Logo />

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.slice(1).map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative px-3 py-2 font-display text-sm tracking-[0.14em] uppercase transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-300 ${
                        active ? "text-bone after:scale-x-100" : "text-mist after:scale-x-0 hover:text-bone hover:after:scale-x-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/contact" className="btn btn-primary hidden !py-2.5 !px-4 !text-xs sm:inline-flex">
              S&apos;inscrire
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              className="grid size-11 place-items-center rounded-full border border-white/20 transition-colors hover:border-bone"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              aria-controls="site-sidebar"
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
        <div className="h-px origin-left bg-gold" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      </header>

      <Sidebar open={menuOpen} onClose={closeMenu} pathname={pathname} />
    </>
  );
}
