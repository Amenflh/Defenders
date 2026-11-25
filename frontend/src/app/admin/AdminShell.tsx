"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { logoutAction } from "@/app/(auth)/actions";
import { Logo, type BrandIdentity } from "@/components/Logo";
import { STATUS_LABELS, dateFmt } from "@/lib/labels";
import { getAdminUnreadAction } from "./chat-actions";

export type AdminNotification = { label: string; tab: string; item: { name: string; createdAt: string; status: string } | null };

type Item = { label: string; href: string; tab?: string };
const tab = (name: string): Item => ({ label: name, href: `/admin?tab=${encodeURIComponent(name)}`, tab: name });

/** Menu de l'espace admin : onglets du tableau de bord (?tab=…) et pages de gestion du contenu, au même endroit. */
const MENU: { title: string; items: Item[] }[] = [
  { title: "Suivi", items: ["aperçu", "messages", "demandes d'information", "inscriptions", "devis sécurité", "paiements", "parrainage", "ressources"].map(tab) },
  {
    title: "Contenu du site",
    items: [
      { label: "formations", href: "/admin/formations" },
      { label: "historique", href: "/admin/historique" },
      { label: "équipe", href: "/admin/equipe" },
      { label: "médias et galeries", href: "/admin/medias" },
      tab("contenus"),
      tab("partenaires"),
      { label: "textes du site", href: "/admin/textes" },
    ],
  },
  { title: "Réglages", items: [tab("paramètres & footer")] },
];
const ITEMS = MENU.flatMap(({ items }) => items);
const TABS = ITEMS.flatMap((item) => item.tab ?? []);

/** Onglet du tableau de bord demandé par l'adresse (« aperçu » par défaut). */
export function useAdminTab(): string {
  const requested = useSearchParams().get("tab");
  return requested && TABS.includes(requested) ? requested : "aperçu";
}

/** Change d'onglet sans recharger la page (l'adresse suit, le bouton Retour fonctionne). */
export function openAdminTab(name: string) {
  window.history.pushState(null, "", tab(name).href);
  window.scrollTo({ top: 0 });
}

const UnreadContext = createContext<(count: number) => void>(() => undefined);
/** Met à jour le compteur « messages » du menu depuis la messagerie. */
export const useSetUnread = () => useContext(UnreadContext);

/** Cadre de toutes les pages admin : en-tête (notifications, compte) et menu latéral. */
export function AdminShell({ user, identity, counts, newCount, notifications, initialUnread, children }: {
  user: { name: string; email: string };
  identity: BrandIdentity;
  counts: Record<string, number>;
  newCount: number;
  notifications: AdminNotification[];
  initialUnread: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const currentTab = useAdminTab();
  const onDashboard = pathname === "/admin";
  const isActive = (item: Item) => (item.tab ? onDashboard && item.tab === currentTab : pathname === item.href || pathname.startsWith(`${item.href}/`));
  const title = ITEMS.find(isActive)?.label ?? "administration";
  const [unread, setUnread] = useState(initialUnread);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const readingMessages = onDashboard && currentTab === "messages";

  // Badge « messages » tenu à jour hors de l'onglet (l'onglet ouvert le met à jour lui-même).
  useEffect(() => {
    if (readingMessages) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") getAdminUnreadAction().then(setUnread).catch(() => undefined);
    }, 30_000);
    return () => clearInterval(timer);
  }, [readingMessages]);

  // Téléphone : le menu défile horizontalement, la rubrique ouverte reste visible.
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>("[aria-current='page']");
    if (nav && active && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = active.offsetLeft - nav.offsetLeft - 16;
  }, [pathname, currentTab]);

  const open = (event: MouseEvent, item: Item) => {
    setNotificationsOpen(false);
    if (!item.tab || !onDashboard || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    openAdminTab(item.tab);
  };
  const initials = user.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AD";

  return (
    <UnreadContext.Provider value={setUnread}>
      <div className="min-h-dvh bg-ink">
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-3 border-b border-line bg-ink-2/95 px-4 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <Logo compact {...identity} />
            <div className="min-w-0">
              <p className="eyebrow hidden text-gold sm:block">{identity.brandName} · Administration</p>
              <p className="truncate font-display text-lg uppercase text-bone sm:mt-1 sm:text-xl">{title}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <a href="/" target="_blank" rel="noreferrer" className="hidden border border-line px-3 py-2 text-xs uppercase tracking-wider text-mist hover:border-gold hover:text-gold md:inline-flex">Voir le site</a>
            <div className="hidden text-right lg:block"><p className="text-sm text-bone">{user.name}</p><p className="text-xs text-mist">{user.email}</p></div>
            <div className="relative">
              <button type="button" onClick={() => setNotificationsOpen((value) => !value)} aria-label={`Notifications${newCount ? `, ${newCount} nouvelle(s) demande(s)` : ""}`} aria-expanded={notificationsOpen} className="relative grid size-10 place-items-center border border-line text-mist transition-colors hover:border-gold hover:text-gold">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="size-5" stroke="currentColor" strokeWidth="1.7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
                </svg>
                {newCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">{newCount}</span>}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 top-full z-40 mt-3 w-[min(22rem,calc(100vw-2rem))] border border-line bg-ink-2 p-4 shadow-2xl">
                  <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
                    <h2 className="font-display text-lg uppercase text-bone">Notifications</h2>
                    <span className="text-[10px] uppercase tracking-widest text-mist">{newCount} nouvelle{newCount === 1 ? "" : "s"}</span>
                  </div>
                  <div className="space-y-2">
                    {notifications.map(({ label, tab: target, item }) => item ? (
                      <Link key={target} href={tab(target).href} onClick={(event) => open(event, tab(target))} className="block w-full border border-line bg-ink p-3 text-left transition-colors hover:border-gold">
                        <span className="block text-[10px] uppercase tracking-widest text-gold">{label}</span>
                        <span className="mt-1 block truncate text-sm text-bone">{item.name}</span>
                        <span className="mt-1 block text-xs text-mist">{dateFmt.format(new Date(item.createdAt))} · {STATUS_LABELS[item.status] ?? item.status}</span>
                      </Link>
                    ) : (
                      <div key={target} className="border border-line bg-ink p-3 opacity-60">
                        <span className="block text-[10px] uppercase tracking-widest text-gold">{label}</span>
                        <span className="mt-1 block text-xs text-mist">Aucune demande reçue.</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div aria-hidden="true" className="hidden size-10 place-items-center rounded-full border border-gold/50 bg-gold text-sm font-bold text-ink sm:grid">{initials}</div>
            <form action={logoutAction}><button type="submit" className="border border-line px-3 py-2.5 text-xs uppercase tracking-wider text-mist hover:border-gold hover:text-gold sm:px-4">Déconnexion</button></form>
          </div>
        </header>

        <div className="grid min-h-[calc(100dvh-5rem)] min-w-0 grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="min-w-0 border-b border-line bg-ink-2 p-3 lg:border-r lg:border-b-0 lg:p-5">
            <nav ref={navRef} aria-label="Menu administrateur" className="flex w-full min-w-0 gap-2 overflow-x-auto lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:flex-col lg:gap-6 lg:overflow-x-hidden lg:overflow-y-auto">
              {MENU.map((group) => (
                <div key={group.title} className="flex shrink-0 gap-2 lg:flex-col lg:gap-0.5">
                  <p className="hidden px-4 pb-2 text-[0.65rem] tracking-[0.2em] text-mist/70 uppercase lg:block">{group.title}</p>
                  {group.items.map((item) => {
                    const active = isActive(item);
                    const count = item.tab ? counts[item.tab] : undefined;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(event) => open(event, item)}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center justify-between gap-2 border px-4 py-2.5 text-left text-xs tracking-wider whitespace-nowrap uppercase transition-colors lg:w-full lg:whitespace-normal ${active ? "border-gold bg-gold text-ink" : "border-transparent text-mist hover:border-line hover:text-bone"}`}
                      >
                        {item.label}
                        {count !== undefined && <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? "bg-ink/15" : "bg-ink-3"}`}>{count}</span>}
                        {item.tab === "messages" && unread > 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${active ? "bg-ink text-gold" : "bg-gold text-ink"}`} aria-label={`${unread} non lu(s)`}>{unread}</span>}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>
          <main id="contenu" className="min-w-0 bg-ink px-4 py-8 sm:px-8 lg:px-10">{children}</main>
        </div>
      </div>
    </UnreadContext.Provider>
  );
}
