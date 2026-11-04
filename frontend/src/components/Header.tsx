"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { mainNav } from "@/lib/site";
import { Icon } from "./Icon";
import { Logo } from "./Logo";
import { Sidebar } from "./Sidebar";

export type HeaderUser = { name: string; email: string; role: "admin" | "client" };

export function Header({ user }: { user: HeaderUser | null }) {
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
          scrolled ? "border-b border-line bg-ink-2/95 shadow-lg shadow-black/30 backdrop-blur-md" : "border-b border-line/70 bg-ink-2/80 backdrop-blur-md"
        }`}
      >
        <div className="container-site flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4">
          <span className="sm:hidden"><Logo compact /></span>
          <span className="hidden sm:inline-flex"><Logo /></span>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {mainNav.map((item) => {
                const route = item.href.split("#")[0] || "/";
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(route) && route !== "/";
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative px-1.5 py-2 font-display text-[0.68rem] tracking-[0.08em] uppercase transition-colors after:absolute after:inset-x-1.5 after:-bottom-0.5 after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-300 xl:px-2 xl:text-xs ${
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

          <nav aria-label="Liens rapides" className="hidden items-center gap-2 sm:flex lg:hidden">
            <Link href="/#formations" className="whitespace-nowrap font-display text-xs uppercase text-bone hover:text-gold">
              Formations
            </Link>
            <Link href="/#galerie" className="whitespace-nowrap font-display text-xs uppercase text-mist hover:text-gold">
              Galerie
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {user?.role !== "admin" && (
              <Link href="/contact" className="btn btn-primary !py-2 !px-2.5 !text-[0.62rem] sm:!py-2.5 sm:!px-3 sm:!text-xs xl:!px-4">
                <span className="sm:hidden">Inscription</span>
                <span className="hidden sm:inline">Réserver ma place</span>
              </Link>
            )}
            {user && (
              <Link
                href={user.role === "admin" ? "/admin" : "/mon-espace"}
                title={user.role === "admin" ? "Espace admin" : "Mon espace"}
                className="hidden items-center gap-2.5 rounded-full border border-white/20 py-1 pr-4 pl-1 transition-colors hover:border-gold xl:flex"
              >
                <span className="grid size-8 place-items-center rounded-full bg-gold font-display text-sm text-ink uppercase">
                  {user.name.trim().charAt(0)}
                </span>
                <span className="max-w-32 truncate text-sm">{user.role === "admin" ? "Admin" : user.name.split(" ")[0]}</span>
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className="grid size-10 place-items-center rounded-full border border-white/20 transition-colors hover:border-bone sm:size-11"
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

      <Sidebar open={menuOpen} onClose={closeMenu} pathname={pathname} user={user} />
    </>
  );
}
