"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { headerNav, site, type NavKey } from "@/lib/site";
import { ActiveDock } from "./ActiveDock";
import { subscribeToScroll } from "@/lib/scroll-subscription";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./Icon";
import { Logo, type BrandIdentity } from "./Logo";
import { Sidebar } from "./Sidebar";

/** Couleur du bandeau de la rubrique active (jetons du thème : s'adaptent au mode clair). */
const dockAccent: Partial<Record<NavKey, string>> = {
  fitnessAcademy: "var(--color-pilates)",
  akAcademy: "var(--color-intervention)",
  security: "var(--color-gold)",
};

export type HeaderUser = { name: string; email: string; role: "admin" | "client" };

export function Header({ user, identity = {} }: { user: HeaderUser | null; identity?: BrandIdentity }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const isActive = (href: string) => {
    const route = href.split("#")[0] || "/";
    return route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`);
  };
  const activeItem = headerNav.find((item) => isActive(item.href));
  const activeBranch = activeItem && site.branches.find(({ href }) => href === activeItem.href);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 80rem)");
    const closeOnDesktop = () => {
      if (desktop.matches) closeMenu();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [closeMenu]);

  useEffect(() => {
    const updateScrollIndicators = () => {
      const scrollY = window.scrollY;
      setScrolled((current) => current === (scrollY > 24) ? current : scrollY > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progressRef.current) {
        const progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
    };
    return subscribeToScroll(updateScrollIndicators);
  }, [pathname]);

  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[60] focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        {t.common.skip}
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled ? "border-b border-line bg-ink-2/95 shadow-lg shadow-black/30 backdrop-blur-md" : "border-b border-line/70 bg-ink-2/80 backdrop-blur-md"
        }`}
      >
        <div className="container-site flex h-16 items-center justify-between gap-3 sm:h-[4.5rem] xl:gap-5">
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
            <span className="shrink-0 sm:hidden"><Logo compact {...identity} /></span>
            <span className="hidden shrink-0 sm:inline-flex"><Logo {...identity} /></span>
            <span className="max-w-24 truncate font-display text-[0.62rem] tracking-[0.12em] uppercase sm:hidden">
              {identity.brandName ?? site.shortName} {identity.brandDescriptor ?? site.descriptor}
            </span>
          </div>

          <nav aria-label={t.common.mainNav} className="hidden min-w-0 xl:block">
            <ul className="flex items-center gap-1">
              {headerNav.map((item) => {
                // La rubrique ouverte quitte le menu : elle est présentée dans le bandeau sous le header.
                const hidden = item === activeItem;
                return (
                  <li
                    key={item.href}
                    aria-hidden={hidden || undefined}
                    className={`overflow-hidden transition-[max-width,opacity,transform] duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
                      hidden ? "max-w-0 -translate-y-2 opacity-0" : "max-w-56 opacity-100"
                    }`}
                  >
                    <Link
                      href={item.href}
                      tabIndex={hidden ? -1 : undefined}
                      className="block rounded-full px-3 py-2 font-display text-[0.68rem] tracking-[0.06em] whitespace-nowrap text-mist uppercase transition-colors hover:bg-white/[0.05] hover:text-bone"
                    >
                      {t.nav[item.key]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="hidden md:flex" />
            <ThemeToggle className="hidden sm:grid" />
            {user?.role !== "admin" && (
              <Link href="/contact" className="btn btn-primary !rounded-full !px-3 !py-2.5 !text-[0.62rem] sm:!px-4 sm:!text-xs">
                {t.common.register}
              </Link>
            )}
            {user && (
              <Link
                href={user.role === "admin" ? "/admin" : "/mon-espace"}
                title={user.role === "admin" ? t.common.admin : t.common.mySpace}
                className="hidden items-center gap-2.5 rounded-full border border-white/20 py-1 pr-4 pl-1 transition-colors hover:border-gold xl:flex"
              >
                <span className="grid size-8 place-items-center rounded-full bg-gold font-display text-sm text-ink uppercase">
                  {user.name.trim().charAt(0)}
                </span>
                <span className="max-w-32 truncate text-sm">{user.role === "admin" ? t.common.admin : user.name.split(" ")[0]}</span>
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className="grid size-10 place-items-center rounded-full border border-white/20 transition-colors hover:border-bone sm:size-11 xl:hidden"
              aria-label={t.common.openMenu}
              aria-expanded={menuOpen}
              aria-controls="site-sidebar"
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
        {activeItem && (
          <ActiveDock
            key={activeItem.href}
            label={t.nav[activeItem.key]}
            href={activeItem.href}
            logo={activeBranch?.logo}
            accent={dockAccent[activeItem.key] ?? "var(--color-gold)"}
            pathname={pathname}
            copy={t.dock}
          />
        )}
        <div ref={progressRef} className="h-px origin-left bg-gold rtl:origin-right" aria-hidden="true" />
      </header>

      <Sidebar open={menuOpen} onClose={closeMenu} pathname={pathname} user={user} identity={identity} />
    </>
  );
}
