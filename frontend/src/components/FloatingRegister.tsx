"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { subscribeToScroll } from "@/lib/scroll-subscription";
import { Icon } from "./Icon";

/**
 * Bouton flottant d'inscription, en face du bouton WhatsApp : pastille beige pulsante
 * avec un reflet animé, et le libellé « Inscrivez-vous » sur les écrans larges.
 */
export function FloatingRegister() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return subscribeToScroll(() => {
      const next = window.scrollY > 240;
      setVisible((current) => current === next ? current : next);
    });
  }, []);

  // Inutile sur la page d'inscription elle-même.
  if (pathname.startsWith("/contact")) return null;

  return (
    <Link
      href="/contact"
      aria-label={t.floating.registerAria}
      className={`fab-pulse group fixed start-4 bottom-4 z-30 flex items-center gap-3 overflow-hidden rounded-full bg-beige p-2 text-[#0b0b0c] shadow-[0_12px_32px_rgba(0,0,0,0.45)] transition-all duration-500 animate-[register-pulse_2.4s_ease-out_infinite] hover:scale-105 sm:start-6 sm:bottom-6 sm:pe-5 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-[#0b0b0c] text-beige">
        <Icon name="user" width={20} height={20} />
        <span className="absolute -end-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-beige text-[11px] leading-none font-bold text-[#0b0b0c]">+</span>
      </span>
      <span className="hidden flex-col leading-tight sm:flex">
        <span className="font-display text-sm font-semibold tracking-[0.12em] uppercase">{t.floating.register}</span>
        <span className="text-[0.65rem] tracking-[0.08em] text-[#0b0b0c]/70 uppercase">{t.floating.registerHint}</span>
      </span>
      {/* Reflet qui balaie le bouton */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-0 w-1/3 bg-white/40 blur-sm animate-[register-shine_3.2s_ease-in-out_infinite]" />
    </Link>
  );
}
