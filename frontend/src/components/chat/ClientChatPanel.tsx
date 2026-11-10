"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getMyThreadAction, sendMyMessageAction } from "@/app/(site)/chat-actions";
import { Icon } from "@/components/Icon";
import { site } from "@/lib/site";
import { useI18n } from "@/lib/i18n/client";
import { ChatThread } from "./ChatThread";

/** Événement global pour ouvrir la discussion depuis n'importe quel bouton du site. */
export const OPEN_CHAT_EVENT = "dfa:open-chat";
export const openChat = () => window.dispatchEvent(new Event(OPEN_CHAT_EVENT));

export type ChatViewer = { role: "guest" } | { role: "client"; firstName: string } | { role: "admin" };

/**
 * Fenêtre de discussion avec l'équipe : plein écran sur mobile, panneau flottant sur ordinateur.
 * Un visiteur non connecté est invité à se connecter (la discussion est liée à son compte).
 */
export function ClientChatPanel({ viewer, onClose, onActivity }: { viewer: ChatViewer; onClose: () => void; onActivity?: () => void }) {
  const pathname = usePathname();
  const back = encodeURIComponent(`${pathname}?chat=1`);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const { locale, t } = useI18n();
  const c = t.pages.chat;
  const hello = { fr: "Bonjour", en: "Hello", ar: "مرحبًا" }[locale];
  return (
    <section
      role="dialog"
      aria-label={c.title}
      className="fixed inset-0 z-40 flex flex-col bg-ink-2 shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[fade-in_0.2s_ease] sm:inset-auto sm:end-6 sm:bottom-24 sm:h-[min(560px,calc(100dvh-8rem))] sm:w-[380px] sm:border sm:border-line"
    >
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative grid size-9 shrink-0 place-items-center bg-gold text-ink">
            <Icon name="chat" width={18} height={18} />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm tracking-[0.08em] text-bone uppercase">{c.title}</p>
            <p className="truncate text-xs text-mist">{c.subtitle}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={c.close} className="grid size-9 place-items-center border border-line text-mist hover:border-gold hover:text-bone">
          <Icon name="close" width={18} height={18} />
        </button>
      </header>

      {viewer.role === "client" ? (
        <ChatThread
          load={getMyThreadAction}
          send={sendMyMessageAction}
          viewer="client"
          autoFocus
          onActivity={onActivity}
          className="flex-1"
          placeholder={c.placeholder}
          empty={
            <>
              <p className="font-display text-lg tracking-wide text-bone uppercase">{hello} {viewer.firstName} 👋</p>
              <p className="mx-auto mt-2 max-w-[18rem]">
                {c.empty}
              </p>
            </>
          }
        />
      ) : viewer.role === "admin" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-sm text-mist">
          <p>{c.adminText}</p>
          <Link href="/admin?tab=messages" className="btn btn-primary">{c.openMessages}</Link>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-5 p-6 text-center">
          <p className="font-display text-xl tracking-wide text-bone uppercase">{c.guestTitle}</p>
          <p className="text-sm leading-relaxed text-mist">
            {c.guestText}
          </p>
          <div className="grid gap-2">
            <Link href={`/login?next=${back}`} className="btn btn-primary justify-center">{c.login}</Link>
            <Link href={`/register?next=${back}`} className="btn btn-ghost justify-center">{c.signup}</Link>
          </div>
          <a href={site.whatsapp.href} target="_blank" rel="noreferrer" className="text-sm text-mist underline-offset-4 hover:text-gold hover:underline">
            {c.whatsapp}
          </a>
        </div>
      )}
    </section>
  );
}
