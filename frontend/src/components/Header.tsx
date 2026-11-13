"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { headerNav } from "@/lib/site";
import { subscribeToScroll } from "@/lib/scroll-subscription";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Icon } from "./Icon";
import { Logo, type BrandIdentity } from "./Logo";
import { Sidebar } from "./Sidebar";

export type HeaderUser = { name: string; email: string; role: "admin" | "client" };

export function Header({ user, identity = {} }: { user: HeaderUser | null; identity?: BrandIdentity }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
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
        <div className="container-site flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4">
          <span className="shrink-0 sm:hidden"><Logo compact {...identity} /></span>
          <span className="hidden shrink-0 sm:inline-flex"><Logo {...identity} /></span>

          <nav aria-label={t.common.mainNav} className="hidden min-w-0 lg:block">
            <ul className="flex items-center gap-0 xl:gap-1">
              {headerNav.map((item) => {
                const route = item.href.split("#")[0] || "/";
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(route) && route !== "/";
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative px-1 py-2 font-display text-[0.62rem] tracking-[0.03em] uppercase transition-colors after:absolute after:inset-x-1 after:-bottom-0.5 after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-300 xl:px-2 xl:text-xs xl:tracking-[0.08em] ${
                        active ? "text-bone after:scale-x-100" : "text-mist after:scale-x-0 hover:text-bone hover:after:scale-x-100"
                      }`}
                    >
                      {t.nav[item.key]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <nav aria-label={t.common.quickLinks} className="hidden min-w-0 items-center gap-3 sm:flex lg:hidden">
            <Link href="/fitness-academy" className="whitespace-nowrap font-display text-xs uppercase text-bone hover:text-gold">
              {t.nav.fitnessAcademy}
            </Link>
            <Link href="/securite" className="whitespace-nowrap font-display text-xs uppercase text-mist hover:text-gold">
              {t.nav.security}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher className="hidden md:flex" />
            <ThemeToggle className="hidden sm:grid" />
            {user?.role !== "admin" && (
              <Link href="/contact" className="btn btn-primary !py-2 !px-2.5 !text-[0.62rem] sm:!py-2.5 sm:!px-3 sm:!text-xs xl:!px-4">
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
              className="grid size-10 place-items-center rounded-full border border-white/20 transition-colors hover:border-bone sm:size-11 lg:hidden"
              aria-label={t.common.openMenu}
              aria-expanded={menuOpen}
              aria-controls="site-sidebar"
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>
        {user?.role !== "admin" && (
          <div className="h-10 bg-gold text-ink">
            <div className="container-site flex h-full items-center justify-between gap-2 sm:gap-4">
              <p className="min-w-0 truncate text-[0.68rem] font-semibold leading-4 sm:text-sm">
                {t.common.coursePromotion}
              </p>
              <Link
                href="/contact"
                className="inline-flex shrink-0 items-center gap-1 border border-ink/50 px-2.5 py-1 text-[0.65rem] font-bold leading-4 transition-colors hover:bg-ink hover:text-gold focus-visible:outline-ink sm:gap-2 sm:px-4 sm:text-xs"
              >
                {t.common.coursePromotionCta}
                <Icon name="arrow" width={14} height={14} className="rtl:-scale-x-100" />
              </Link>
            </div>
          </div>
        )}
        <div ref={progressRef} className="h-px origin-left bg-gold rtl:origin-right" aria-hidden="true" />
      </header>

      <Sidebar open={menuOpen} onClose={closeMenu} pathname={pathname} user={user} identity={identity} />
    </>
  );
}
