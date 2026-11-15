"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { useI18n } from "@/lib/i18n/client";
import { buildSearchIndex, prepareIndex, searchIndex, type SearchGroup, type SearchIcon, type SearchItem } from "@/lib/search-index";
import { Icon } from "./Icon";

const GROUP_ORDER: SearchGroup[] = ["formations", "pages", "questions", "contact"];
const ICONS: Record<SearchIcon, Parameters<typeof Icon>[0]["name"]> = {
  fitness: "award",
  shield: "shield",
  page: "file",
  question: "chat",
  phone: "phone",
  mail: "mail",
  pin: "pin",
};
const SUGGESTED = ["formation-pilates", "formation-football", "formation-personal-training", "formation-k9", "page-planning", "page-quiz", "contact-whatsapp"];

const noopSubscribe = () => () => {};

/**
 * Recherche du site : bouton du header + panneau plein écran (Ctrl/⌘ K ou « / »).
 * L'index est construit dans la langue courante, sans requête réseau : les résultats s'affichent à chaque frappe.
 */
export function SiteSearch({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // Raccourci affiché selon le système (⌘ sur Mac) ; « Ctrl » au rendu serveur.
  const isMac = useSyncExternalStore(noopSubscribe, () => /mac|iphone|ipad/i.test(navigator.userAgent), () => false);

  const index = useMemo(() => prepareIndex(buildSearchIndex(t, locale)), [t, locale]);
  const results = useMemo<SearchItem[]>(() => {
    if (query.trim()) return searchIndex(index, query);
    return SUGGESTED.map((id) => index.find((item) => item.id === id)).filter((item): item is (typeof index)[number] => !!item);
  }, [index, query]);
  const grouped = useMemo(
    () => GROUP_ORDER.map((group) => ({ group, items: results.filter((item) => item.group === group) })).filter(({ items }) => items.length),
    [results],
  );
  // Ordre d'affichage (par groupe) : c'est lui que suivent les flèches du clavier.
  const ordered = useMemo(() => grouped.flatMap(({ items }) => items), [grouped]);

  const show = useCallback(() => {
    setOpen(true);
    setQuery("");
    setActive(0);
  }, []);
  const hide = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = !!target?.closest("input, textarea, select, [contenteditable='true']");
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        show();
      } else if (event.key === "/" && !typing) {
        event.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (!open && dialog.open) {
      dialog.close();
    }
    if (!open) document.documentElement.style.overflow = "";
  }, [open]);

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  const go = (item: SearchItem) => {
    hide();
    if (item.external) window.open(item.href, "_blank", "noopener,noreferrer");
    else if (/^(tel|mailto):/.test(item.href)) window.location.href = item.href;
    else router.push(item.href);
  };

  const onInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (ordered.length ? (i + 1) % ordered.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (ordered.length ? (i - 1 + ordered.length) % ordered.length : 0));
    } else if (event.key === "Enter" && ordered[active]) {
      event.preventDefault();
      go(ordered[active]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={show}
        aria-label={t.search.label}
        aria-haspopup="dialog"
        className={`group items-center gap-2 rounded-full border border-white/20 text-mist transition-colors hover:border-gold hover:text-bone ${className}`}
      >
        <Icon name="search" width={18} height={18} />
        <span className="hidden text-xs 2xl:inline">{t.search.open}</span>
        <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-sans text-[0.6rem] text-mist 2xl:inline">{isMac ? "⌘" : "Ctrl"} K</kbd>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={t.search.label}
        onClose={hide}
        onClick={(event) => { if (event.target === dialogRef.current) hide(); }}
        className="site-search m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 text-bone backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        <div className="site-search-panel mx-auto mt-0 flex max-h-[min(42rem,100svh)] w-full max-w-3xl flex-col border-b border-line bg-ink-2 shadow-2xl shadow-black/60 sm:mt-[8vh] sm:border">
          <div className="flex items-center gap-4 border-b border-line px-5 sm:px-7">
            <Icon name="search" width={22} height={22} className="shrink-0 text-gold" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setActive(0); }}
              onKeyDown={onInputKey}
              placeholder={t.search.placeholder}
              aria-label={t.search.label}
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={ordered.length ? `${listId}-${active}` : undefined}
              autoComplete="off"
              spellCheck={false}
              className="h-16 min-w-0 flex-1 bg-transparent font-display text-xl tracking-wide text-bone outline-none placeholder:text-mist/60 sm:h-20 sm:text-2xl [&::-webkit-search-cancel-button]:hidden"
            />
            <button type="button" onClick={hide} aria-label={t.search.close} className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-mist transition-colors hover:border-gold hover:text-bone">
              <Icon name="close" width={16} height={16} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
            <p className="sr-only" aria-live="polite">{query.trim() ? t.search.results(ordered.length) : ""}</p>
            {!query.trim() && <p className="px-3 pb-2 text-xs text-mist">{t.search.suggestions}</p>}
            {query.trim() && ordered.length === 0 ? (
              <p className="px-3 py-10 text-center text-sm text-mist">{t.search.empty(query.trim())}</p>
            ) : (
              <div id={listId} role="listbox" aria-label={t.search.label}>
                {grouped.map(({ group, items }) => (
                  <div key={group} role="group" aria-label={t.search.groups[group]} className="mb-3 last:mb-0">
                    {query.trim() && <p className="px-3 pt-2 pb-1.5 text-xs text-gold-soft">{t.search.groups[group]}</p>}
                    {items.map((item) => {
                      const current = ordered.indexOf(item);
                      const selected = current === active;
                      const content = (
                        <>
                          <span className={`grid size-10 shrink-0 place-items-center rounded-full border transition-colors ${selected ? "border-gold bg-gold text-ink" : "border-line text-gold"}`}>
                            <Icon name={ICONS[item.icon]} width={17} height={17} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.95rem] text-bone">{item.title}</span>
                            {item.subtitle && <span className="block truncate text-xs text-mist">{item.subtitle}</span>}
                          </span>
                          <Icon name="arrow" width={16} height={16} className={`shrink-0 transition ${selected ? "translate-x-0 text-gold opacity-100" : "-translate-x-1 opacity-0"} rtl:-scale-x-100`} />
                        </>
                      );
                      const shared = {
                        id: `${listId}-${current}`,
                        role: "option" as const,
                        "aria-selected": selected,
                        onMouseMove: () => { if (!selected) setActive(current); },
                        className: `flex items-center gap-4 rounded-lg px-3 py-2.5 transition-colors ${selected ? "bg-white/[0.06]" : ""}`,
                      };
                      return item.external || /^(tel|mailto):/.test(item.href) ? (
                        <a key={item.id} href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined} onClick={hide} tabIndex={-1} {...shared}>
                          {content}
                        </a>
                      ) : (
                        <Link key={item.id} href={item.href} onClick={hide} tabIndex={-1} {...shared}>
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-5 border-t border-line px-7 py-3 text-[0.7rem] text-mist sm:flex">
            <span><kbd className="search-kbd">↑</kbd><kbd className="search-kbd">↓</kbd> {t.search.hints.navigate}</span>
            <span><kbd className="search-kbd">↵</kbd> {t.search.hints.open}</span>
            <span><kbd className="search-kbd">Esc</kbd> {t.search.hints.close}</span>
          </div>
        </div>
      </dialog>
    </>
  );
}
