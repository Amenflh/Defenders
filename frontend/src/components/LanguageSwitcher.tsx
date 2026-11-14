"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { setLocaleAction } from "@/lib/i18n/actions";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";

/** Sélecteur FR / EN / ع : mémorise la langue (cookie posé par une action serveur) puis recharge le rendu serveur. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const choose = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    // Le nouveau rendu serveur met à jour <html lang dir> et tous les textes.
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  };

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${pending ? "opacity-60" : ""} ${className}`}>
      <button
        type="button"
        lang={locale}
        aria-label={`${t.common.language}: ${LOCALE_LABELS[locale].name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        disabled={pending}
        className="min-w-12 border border-white/20 px-2.5 py-1.5 font-display text-[0.68rem] tracking-[0.08em] text-bone transition-colors hover:border-gold hover:text-gold"
      >
        {LOCALE_LABELS[locale].short}
      </button>
      {open && (
        <div role="menu" aria-label={t.common.language} className="absolute end-0 top-full z-50 mt-2 min-w-36 border border-line bg-ink-2 p-1 shadow-xl">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              role="menuitemradio"
              aria-checked={l === locale}
              onClick={() => choose(l)}
              className={`flex w-full items-center justify-between gap-4 px-3 py-2 text-start text-sm transition-colors ${l === locale ? "bg-gold text-ink" : "text-mist hover:bg-ink-3 hover:text-bone"}`}
            >
              <span>{LOCALE_LABELS[l].name}</span>
              <span className={l === "ar" ? "font-[family-name:var(--font-cairo)]" : "font-display"}>{LOCALE_LABELS[l].short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
