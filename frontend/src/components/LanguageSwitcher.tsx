"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/lib/i18n/actions";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";

/** Sélecteur FR / EN / ع : mémorise la langue (cookie posé par une action serveur) puis recharge le rendu serveur. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    if (next === locale) return;
    // Le nouveau rendu serveur met à jour <html lang dir> et tous les textes.
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  };

  return (
    <div role="group" aria-label={t.common.language} className={`flex items-center border border-white/20 ${pending ? "opacity-60" : ""} ${className}`}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          onClick={() => choose(l)}
          aria-pressed={l === locale}
          title={LOCALE_LABELS[l].name}
          className={`min-w-8 px-2 py-1.5 tracking-[0.08em] transition-colors ${l === "ar" ? "font-[family-name:var(--font-cairo)] text-base leading-none font-semibold" : "font-display text-[0.68rem]"} ${l === locale ? "bg-gold text-ink" : "text-mist hover:text-bone"}`}
        >
          {LOCALE_LABELS[l].short}
        </button>
      ))}
    </div>
  );
}
