"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { logoutAction } from "@/app/(auth)/actions";
import { useI18n } from "@/lib/i18n/client";
import { site, type NavKey } from "@/lib/site";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import type { HeaderUser } from "./Header";
import { Icon, type IconName } from "./Icon";
import { Logo, type BrandIdentity } from "./Logo";

type Props = { open: boolean; onClose: () => void; pathname: string; user: HeaderUser | null; identity?: BrandIdentity };

/** Liens de navigation du panneau, avec leur icône. */
const NAV: { href: string; key: NavKey; icon: IconName }[] = [
  { href: "/", key: "home", icon: "home" },
  { href: "/formations", key: "formations", icon: "grid" },
  { href: "/planning", key: "planning", icon: "calendar" },
  { href: "/historique", key: "history", icon: "clock" },
  { href: "/#galerie", key: "gallery", icon: "image" },
  { href: "/contact", key: "contact", icon: "chat" },
];

const COPY = {
  fr: { academies: "Nos académies", explore: "Explorer", quick: "Contact rapide", quiz: "Trouver ma formation", quizHint: "Quiz d'orientation · 1 min", settings: "Préférences" },
  en: { academies: "Our academies", explore: "Explore", quick: "Quick contact", quiz: "Find my course", quizHint: "Orientation quiz · 1 min", settings: "Preferences" },
  ar: { academies: "أكاديمياتنا", explore: "تصفّح", quick: "اتصال سريع", quiz: "اعثر على تكوينك", quizHint: "اختبار التوجيه · دقيقة", settings: "التفضيلات" },
} as const;

/**
 * Panneau latéral (toutes tailles d'écran) : les deux académies en tête, navigation avec icônes,
 * orientation, contact rapide, réseaux, préférences et compte.
 */
export function Sidebar({ open, onClose, pathname, user, identity = {} }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const { locale, t } = useI18n();
  const c = COPY[locale];

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        e.preventDefault();
        sidebarRef.current?.focus();
      } else if (e.shiftKey && (document.activeElement === first || !sidebarRef.current?.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !sidebarRef.current?.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [open, onClose]);

  const isActive = (href: string) => {
    const route = href.split("#")[0] || "/";
    if (href.includes("#")) return false;
    return route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`);
  };
  const stagger = (i: number) => ({ transitionDelay: open ? `${80 + i * 40}ms` : "0ms" });
  const reveal = `transition-[opacity,translate] duration-500 ${open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0 rtl:-translate-x-4"}`;
  const sectionTitle = "mb-3 px-1 font-display text-[0.68rem] tracking-[0.24em] text-mist uppercase";

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 cursor-default border-0 bg-black/60 backdrop-blur-[3px] transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        ref={sidebarRef}
        id="site-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label={t.common.mainMenu}
        inert={!open}
        tabIndex={-1}
        className={`sidebar-panel absolute top-0 end-0 flex h-full w-full max-w-[26rem] flex-col overscroll-contain border-s border-line bg-ink-2 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"}`}
      >
        {/* En-tête : identité et fermeture */}
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <Logo {...identity} />
          <button
            ref={closeRef}
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-line text-mist transition-colors hover:border-gold hover:text-bone"
            aria-label={t.common.closeMenu}
          >
            <Icon name="close" width={18} height={18} />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6">
          {/* Compte */}
          {user && (
            <div className={`flex items-center gap-3 rounded-xl border border-line bg-ink p-3 ${reveal}`} style={stagger(0)}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold font-display text-ink uppercase">
                {user.name.trim().charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-bone">{user.name}</p>
                <p className="truncate text-xs text-mist">{user.role === "admin" ? t.common.administrator : user.email}</p>
              </div>
              <Link
                href={user.role === "admin" ? "/admin" : "/mon-espace"}
                onClick={onClose}
                className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[0.68rem] tracking-[0.12em] uppercase transition-colors hover:border-gold hover:text-gold"
              >
                {user.role === "admin" ? t.common.admin : t.common.mySpace}
              </Link>
            </div>
          )}

          {/* Les deux académies */}
          <section aria-labelledby="sidebar-academies">
            <h2 id="sidebar-academies" className={sectionTitle}>{c.academies}</h2>
            <ul className="grid gap-2.5">
              {site.branches.map((branch, i) => {
                const active = isActive(branch.href);
                return (
                  <li key={branch.key} className={reveal} style={stagger(i + 1)}>
                    <Link
                      href={branch.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center gap-3.5 rounded-xl border p-3 transition-[border-color,background-color] ${
                        active ? "border-gold bg-gold/10" : "border-line bg-ink hover:border-gold/60"
                      }`}
                    >
                      <Image src={branch.logo} alt="" width={48} height={48} className="size-12 shrink-0 rounded-full bg-white object-contain p-0.5 ring-1 ring-white/20" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-sm tracking-[0.06em] text-bone uppercase">{branch.name}</span>
                        <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-mist">{t.branches.items[i]?.text}</span>
                      </span>
                      <Icon name="arrow" width={16} height={16} className="shrink-0 text-gold transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Navigation */}
          <nav aria-label={t.common.mainNav}>
            <h2 className={sectionTitle}>{c.explore}</h2>
            <ul className="space-y-0.5">
              {NAV.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href} className={reveal} style={stagger(i + 3)}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.95rem] transition-colors ${
                        active ? "bg-gold/10 text-bone" : "text-mist hover:bg-white/[0.04] hover:text-bone"
                      }`}
                    >
                      {active && <span aria-hidden="true" className="absolute inset-y-2 start-0 w-0.5 rounded-full bg-gold" />}
                      <Icon name={item.icon} width={18} height={18} className={active ? "text-gold" : "text-mist"} />
                      {t.nav[item.key]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Orientation */}
          <Link
            href="/trouver-ma-formation"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl border border-gold/40 bg-gradient-to-br from-gold/15 to-transparent p-3.5 transition-colors hover:border-gold ${reveal}`}
            style={stagger(NAV.length + 3)}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold text-ink"><Icon name="star" width={18} height={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm tracking-[0.06em] text-bone uppercase">{c.quiz}</span>
              <span className="block text-xs text-mist">{c.quizHint}</span>
            </span>
            <Icon name="arrow" width={16} height={16} className="text-gold rtl:-scale-x-100" />
          </Link>

          {/* Contact rapide */}
          <section aria-labelledby="sidebar-contact">
            <h2 id="sidebar-contact" className={sectionTitle}>{c.quick}</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { href: site.phone.href, label: t.common.contact, icon: "phone" as const },
                { href: site.whatsapp.href, label: "WhatsApp", icon: "chat" as const, external: true },
                { href: site.email.href, label: "E-mail", icon: "mail" as const },
              ].map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  {...(action.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-ink px-2 py-3 text-[0.7rem] text-mist transition-colors hover:border-gold hover:text-bone"
                >
                  <Icon name={action.icon} width={18} height={18} className="text-gold" />
                  {action.label}
                </a>
              ))}
            </div>
            <a href={site.address.href} target="_blank" rel="noreferrer" className="mt-3 flex items-start gap-2.5 px-1 text-xs leading-relaxed text-mist hover:text-bone">
              <Icon name="pin" width={16} height={16} className="mt-0.5 shrink-0 text-gold" /> {site.address.lines.join(", ")}
            </a>
            <div className="mt-3 flex items-center gap-2 px-1">
              {[
                { href: site.facebook.href, icon: "facebook" as const, label: "Facebook" },
                { href: site.instagram.href, icon: "instagram" as const, label: "Instagram" },
                ...(site.linkedin.href ? [{ href: site.linkedin.href, icon: "linkedin" as const, label: "LinkedIn" }] : []),
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="grid size-9 place-items-center rounded-full border border-line text-mist transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon name={social.icon} width={16} height={16} />
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Pied : préférences, inscription, déconnexion */}
        <div className="space-y-3 border-t border-line bg-ink-2 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-[0.68rem] tracking-[0.24em] text-mist uppercase">{c.settings}</span>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
          {user?.role !== "admin" && (
            <Link href="/contact" onClick={onClose} className="btn btn-primary w-full !rounded-full">
              {t.common.register} <Icon name="arrow" className="rtl:-scale-x-100" />
            </Link>
          )}
          {user && (
            <form action={logoutAction}>
              <button type="submit" className="btn btn-ghost w-full !rounded-full">
                <Icon name="logout" width={18} height={18} /> {t.common.logout}
              </button>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
