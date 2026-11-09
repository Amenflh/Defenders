"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatThread } from "@/components/chat/ChatThread";
import { Icon } from "@/components/Icon";
import type { ConversationSummary } from "@/lib/chat";
import { whatsappHref } from "@/lib/contact-links";
import { getConversationAction, listConversationsAction, replyAction } from "./chat-actions";

const LIST_POLL_MS = 10_000;
const timeFmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Tunis" });
const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "Africa/Tunis" });
const tunisDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Tunis" });

function when(iso: string) {
  const date = new Date(iso);
  return tunisDay.format(date) === tunisDay.format(new Date()) ? timeFmt.format(date) : dateFmt.format(date);
}

const initials = (name: string) => name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";

/** Messagerie de l'équipe : liste des conversations clients à gauche, fil sélectionné à droite. */
export function ChatInbox({ onUnreadChange }: { onUnreadChange?: (unread: number) => void }) {
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const refresh = useCallback(async () => {
    const data = await listConversationsAction().catch(() => null);
    if (!data) {
      setFailed(true);
      return;
    }
    setFailed(false);
    setConversations(data.conversations);
    onUnreadChange?.(data.unread);
  }, [onUnreadChange]);

  useEffect(() => {
    // Premier chargement en différé : pas de setState synchrone dans l'effet.
    const first = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => document.visibilityState === "visible" && void refresh(), LIST_POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [refresh]);

  const selected = conversations?.find((c) => c.id === selectedId) ?? null;
  const load = useCallback((after?: number) => getConversationAction(selectedId ?? 0, after), [selectedId]);
  const send = useCallback((body: string) => replyAction(selectedId ?? 0, body), [selectedId]);

  const open = (id: number) => {
    setSelectedId(id);
    // L'ouverture marque la conversation comme lue : mise à jour immédiate de la liste et du badge.
    if (!conversations) return;
    const next = conversations.map((c) => (c.id === id ? { ...c, unread: 0 } : c));
    setConversations(next);
    onUnreadChange?.(next.reduce((n, c) => n + c.unread, 0));
  };

  const q = query.trim().toLowerCase();
  const visible = (conversations ?? []).filter((c) => !q || `${c.user.name} ${c.user.email} ${c.user.phone}`.toLowerCase().includes(q));
  const totalUnread = (conversations ?? []).reduce((n, c) => n + c.unread, 0);
  const wa = selected ? whatsappHref(selected.user.phone) : null;

  return (
    <section aria-label="Messages des clients">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-gold">Relation client</p>
          <h1 className="mt-2 font-display text-3xl uppercase text-bone">Messages</h1>
          <p className="mt-1 text-sm text-mist">
            {totalUnread ? `${totalUnread} message${totalUnread > 1 ? "s" : ""} non lu${totalUnread > 1 ? "s" : ""}` : "Tous les messages sont lus"} · mis à jour automatiquement
          </p>
        </div>
      </div>

      <div className="grid h-[min(680px,calc(100dvh-14rem))] min-h-[420px] border border-line bg-ink-2 lg:grid-cols-[320px_1fr]">
        {/* Liste des conversations (masquée sur mobile quand un fil est ouvert) */}
        <div className={`min-h-0 flex-col border-line lg:flex lg:border-r ${selected ? "hidden" : "flex"}`}>
          <div className="border-b border-line p-3">
            <label htmlFor="chat-search" className="sr-only">Rechercher un client</label>
            <input
              id="chat-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un client…"
              className="w-full border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-mist/60 focus:border-gold focus:outline-none"
            />
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto">
            {conversations === null && !failed && <li className="p-6 text-center text-sm text-mist">Chargement…</li>}
            {failed && conversations === null && <li className="p-6 text-center text-sm text-red-300">Impossible de charger les messages.</li>}
            {conversations?.length === 0 && (
              <li className="p-6 text-center text-sm text-mist">
                Aucun message pour l&apos;instant. Les clients connectés peuvent vous écrire depuis le bouton de contact du site ou leur espace.
              </li>
            )}
            {visible.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => open(c.id)}
                  aria-current={c.id === selectedId ? "true" : undefined}
                  className={`flex w-full items-start gap-3 border-b border-line px-3 py-3 text-left transition-colors ${c.id === selectedId ? "bg-gold/10" : "hover:bg-ink-3"}`}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-ink text-xs font-bold text-gold">{initials(c.user.name)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-sm ${c.unread ? "font-semibold text-bone" : "text-bone/90"}`}>{c.user.name}</span>
                      <span className="shrink-0 text-[0.65rem] text-mist">{when(c.lastMessageAt)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className={`truncate text-xs ${c.unread ? "text-bone" : "text-mist"}`}>
                        {c.lastMessage ? `${c.lastMessage.sender === "admin" ? "Vous : " : ""}${c.lastMessage.body}` : "—"}
                      </span>
                      {c.unread > 0 && (
                        <span className="grid min-h-5 min-w-5 shrink-0 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink" aria-label={`${c.unread} non lu(s)`}>
                          {c.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Fil sélectionné */}
        <div className={`min-h-0 flex-col ${selected ? "flex" : "hidden lg:flex"}`}>
          {selected ? (
            <>
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <button type="button" onClick={() => setSelectedId(null)} aria-label="Retour à la liste" className="grid size-9 place-items-center border border-line text-mist hover:text-bone lg:hidden">
                    <Icon name="arrow" width={16} height={16} className="rotate-180" />
                  </button>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-bone">{selected.user.name}</p>
                    <p className="truncate text-xs text-mist">{selected.user.email}{selected.user.phone ? ` · ${selected.user.phone}` : ""}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {wa && <a href={wa} target="_blank" rel="noreferrer" className="border border-[#1fa855]/60 px-3 py-1.5 text-xs uppercase tracking-wider text-[#4ade80] hover:bg-[#1fa855]/10">WhatsApp</a>}
                  {selected.user.phone && <a href={`tel:${selected.user.phone.replace(/[^+\d]/g, "")}`} className="border border-line px-3 py-1.5 text-xs uppercase tracking-wider text-mist hover:border-gold hover:text-gold">Appeler</a>}
                  <a href={`mailto:${selected.user.email}`} className="border border-line px-3 py-1.5 text-xs uppercase tracking-wider text-mist hover:border-gold hover:text-gold">E-mail</a>
                </div>
              </header>
              <ChatThread key={selected.id} load={load} send={send} viewer="admin" autoFocus onActivity={refresh} className="flex-1" placeholder={`Répondre à ${selected.user.name.split(" ")[0]}…`} />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-sm text-mist">
              <Icon name="chat" width={32} height={32} className="text-gold" />
              <p>Choisissez une conversation pour lire et répondre.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
