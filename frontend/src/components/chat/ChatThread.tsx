"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon";
import { MAX_CHAT_MESSAGE, type ChatMessage, type ChatSender, type SendResult, type ThreadResult } from "@/lib/chat";

const timeFmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Tunis" });
const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Tunis" });
const dayKey = (iso: string) => dayFmt.format(new Date(iso));

/** Ajoute des messages sans doublon (un message envoyé peut aussi revenir par le rafraîchissement). */
function merge(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  if (!incoming.length) return current;
  const ids = new Set(current.map((m) => m.id));
  const added = incoming.filter((m) => !ids.has(m.id));
  return added.length ? [...current, ...added].sort((a, b) => a.id - b.id) : current;
}

type Props = {
  /** Charge le fil (seulement les messages d'id > after si fourni). */
  load: (after?: number) => Promise<ThreadResult>;
  send: (body: string) => Promise<SendResult>;
  /** Qui regarde : ses messages sont à droite. */
  viewer: ChatSender;
  /** Intervalle de rafraîchissement (ms), seulement quand l'onglet est visible. */
  pollMs?: number;
  empty?: React.ReactNode;
  placeholder?: string;
  /** Appelé après chaque nouveau message (envoyé ou reçu) : rafraîchir une liste, un badge… */
  onActivity?: () => void;
  autoFocus?: boolean;
  className?: string;
};

/**
 * Fil de discussion avec rafraîchissement périodique (pas de WebSocket : un simple appel toutes les
 * quelques secondes suffit au volume d'une académie, et passe par n'importe quel hébergement).
 */
export function ChatThread({ load, send, viewer, pollMs = 4000, empty, placeholder = "Votre message…", onActivity, autoFocus, className = "" }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [readAt, setReadAt] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const inputId = useId();
  const lastId = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const textarea = useRef<HTMLTextAreaElement>(null);
  // Ref : une nouvelle fonction à chaque rendu du parent ne doit pas relancer le chargement.
  const activity = useRef(onActivity);
  useEffect(() => {
    activity.current = onActivity;
  }, [onActivity]);

  const apply = useCallback((result: ThreadResult, initial = false) => {
    if (!result.ok) {
      if (initial) setStatus("error");
      return;
    }
    setStatus("ready");
    setReadAt(result.readAt);
    if (result.messages.length) {
      lastId.current = Math.max(lastId.current, ...result.messages.map((m) => m.id));
      setMessages((current) => merge(current, result.messages));
      if (!initial) activity.current?.();
    }
  }, []);

  // Chargement initial puis rafraîchissement périodique (suspendu quand l'onglet est caché).
  useEffect(() => {
    let cancelled = false;
    load().then((r) => !cancelled && apply(r, true)).catch(() => !cancelled && setStatus("error"));
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      load(lastId.current || undefined).then((r) => !cancelled && apply(r)).catch(() => undefined);
    }, pollMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [load, apply, pollMs]);

  // Reste collé en bas si on y était déjà (ne fait pas sauter la lecture d'anciens messages).
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (autoFocus && status === "ready") textarea.current?.focus();
  }, [autoFocus, status]);

  async function submit() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    const result = await send(body).catch(() => ({ ok: false as const, error: "Message non envoyé. Réessayez." }));
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    stickToBottom.current = true;
    lastId.current = Math.max(lastId.current, result.message.id);
    setMessages((current) => merge(current, [result.message]));
    setDraft("");
    activity.current?.();
    textarea.current?.focus();
  }

  const lastOwn = [...messages].reverse().find((m) => m.sender === viewer);
  const lastOwnRead = !!(lastOwn && readAt && Date.parse(readAt) >= Date.parse(lastOwn.createdAt));

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
        }}
        role="log"
        aria-live="polite"
        aria-label="Messages"
        className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-4 py-5"
      >
        {status === "loading" && <p className="py-10 text-center text-sm text-mist">Chargement…</p>}
        {status === "error" && <p className="py-10 text-center text-sm text-red-300">Impossible de charger la discussion pour le moment.</p>}
        {status === "ready" && messages.length === 0 && <div className="py-8 text-center text-sm text-mist">{empty ?? "Aucun message pour l'instant."}</div>}
        {messages.map((m, i) => {
          const own = m.sender === viewer;
          const newDay = i === 0 || dayKey(messages[i - 1].createdAt) !== dayKey(m.createdAt);
          return (
            <div key={m.id}>
              {newDay && (
                <p className="my-4 text-center text-[0.65rem] tracking-[0.16em] text-mist/80 uppercase">{dayKey(m.createdAt)}</p>
              )}
              <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3.5 py-2 text-sm leading-relaxed ${own ? "bg-gold text-ink" : "border border-line bg-ink-3 text-bone"}`}>
                  <p className="break-words whitespace-pre-wrap">{m.body}</p>
                  <p className={`mt-1 text-right text-[0.65rem] ${own ? "text-ink/70" : "text-mist"}`}>
                    {timeFmt.format(new Date(m.createdAt))}
                    {m === lastOwn && <span> · {lastOwnRead ? "Lu" : "Envoyé"}</span>}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="border-t border-line bg-ink-2 p-3"
      >
        {error && <p role="alert" className="mb-2 text-xs text-red-300">{error}</p>}
        <div className="flex items-end gap-2">
          <label htmlFor={inputId} className="sr-only">Votre message</label>
          <textarea
            id={inputId}
            ref={textarea}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Entrée envoie, Maj+Entrée va à la ligne.
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void submit();
              }
            }}
            rows={1}
            maxLength={MAX_CHAT_MESSAGE}
            placeholder={placeholder}
            disabled={status !== "ready"}
            className="max-h-32 min-h-11 flex-1 resize-none border border-line bg-ink px-3 py-2.5 text-sm text-bone [field-sizing:content] placeholder:text-mist/60 focus:border-gold focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending || status !== "ready"}
            aria-label="Envoyer le message"
            className="grid size-11 shrink-0 place-items-center bg-gold text-ink transition-opacity disabled:opacity-40"
          >
            <Icon name="arrow" width={18} height={18} />
          </button>
        </div>
        {draft.length > MAX_CHAT_MESSAGE - 200 && (
          <p className="mt-1 text-right text-[0.65rem] text-mist">{draft.length} / {MAX_CHAT_MESSAGE}</p>
        )}
      </form>
    </div>
  );
}
