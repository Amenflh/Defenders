"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { useI18n } from "@/lib/i18n/client";
import { site } from "@/lib/site";

type Turn = { role: "user" | "assistant"; content: string; error?: boolean };

const MAX_CHARS = 1200;

/** Lien sûr uniquement : chemin interne, https, téléphone ou e-mail. */
function safeHref(href: string) {
  return /^(\/(?!\/)|https:\/\/|tel:|mailto:)/.test(href) ? href : null;
}

/** **gras** et [texte](lien) dans une ligne, sans HTML injecté. */
function inline(text: string, onNavigate: () => void): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1]) {
      parts.push(<strong key={match.index} className="font-semibold text-bone">{match[1]}</strong>);
    } else {
      const href = safeHref(match[3]);
      const className = "text-gold underline underline-offset-4 hover:text-gold-soft";
      if (!href) parts.push(match[2]);
      else if (href.startsWith("/")) parts.push(<Link key={match.index} href={href} onClick={onNavigate} className={className}>{match[2]}</Link>);
      else parts.push(<a key={match.index} href={href} {...(href.startsWith("https") ? { target: "_blank", rel: "noreferrer" } : {})} className={className}>{match[2]}</a>);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Sépare la réponse de ses questions de relance (« [[suggest:Q1|Q2]] », ajouté par le serveur). */
function splitFollowUps(content: string): { body: string; followUps: string[] } {
  const match = content.match(/\n*\[\[suggest:([^\]]*)\]\]\s*$/);
  if (!match) return { body: content, followUps: [] };
  return { body: content.slice(0, match.index).trimEnd(), followUps: match[1].split("|").map((q) => q.trim()).filter(Boolean) };
}

/** Paragraphes et listes « - » de la réponse. */
function Answer({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc space-y-1 ps-5 marker:text-gold">
        {list.map((item, i) => <li key={i}>{inline(item, onNavigate)}</li>)}
      </ul>,
    );
    list = [];
  };
  for (const line of text.split("\n")) {
    const item = line.match(/^\s*[-*•]\s+(.*)$/);
    if (item) list.push(item[1]);
    else {
      flush();
      if (line.trim()) blocks.push(<p key={`p-${blocks.length}`}>{inline(line, onNavigate)}</p>);
    }
  }
  flush();
  return <div className="space-y-2">{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</div>;
}

/**
 * Assistant de recherche : pose une question en langage naturel, la réponse est extraite
 * des contenus du site (formations, tarifs, dates, contacts) avec des liens vers les pages.
 */
export function AssistantPanel({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const a = t.assistant;
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      abortRef.current?.abort();
    };
  }, [onClose]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [turns]);

  const update = (content: string, error = false) =>
    setTurns((list) => [...list.slice(0, -1), { role: "assistant", content, error }]);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    if (text.length > MAX_CHARS) {
      setTurns((list) => [...list, { role: "assistant", content: a.tooLong, error: true }]);
      return;
    }
    const history = [...turns.filter((turn) => !turn.error), { role: "user" as const, content: text }];
    setTurns([...turns, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      if (!res.ok) {
        update(res.status === 429 ? a.rateLimited : a.error, true);
        return;
      }
      const answer = (await res.text()).trim();
      update(answer || a.error, !answer);
    } catch (error) {
      if ((error as Error).name !== "AbortError") update(a.error, true);
    } finally {
      // Arrêt avant le premier mot : pas de bulle vide.
      setTurns((list) => (list.at(-1)?.role === "assistant" && !list.at(-1)?.content ? list.slice(0, -1) : list));
      setBusy(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    ask(input);
  };

  return (
    <section
      role="dialog"
      aria-label={a.title}
      className="fixed inset-0 z-40 flex flex-col bg-ink-2 shadow-[0_24px_64px_rgba(0,0,0,0.6)] animate-[fade-in_0.2s_ease] sm:inset-auto sm:end-6 sm:bottom-24 sm:h-[min(600px,calc(100dvh-8rem))] sm:w-[400px] sm:border sm:border-line"
    >
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center bg-gold text-ink">
            <Icon name="search" width={18} height={18} />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm tracking-[0.08em] text-bone uppercase">{a.title}</p>
            <p className="truncate text-xs text-mist">{a.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {turns.length > 0 && (
            <button
              type="button"
              onClick={() => { abortRef.current?.abort(); setTurns([]); }}
              className="border border-line px-2.5 py-1.5 text-[0.7rem] text-mist hover:border-gold hover:text-bone"
            >
              {a.reset}
            </button>
          )}
          <button type="button" onClick={onClose} aria-label={a.close} className="grid size-9 place-items-center border border-line text-mist hover:border-gold hover:text-bone">
            <Icon name="close" width={18} height={18} />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 text-sm leading-relaxed" aria-live="polite">
        {turns.length === 0 ? (
          <div className="space-y-4">
            <p className="text-mist">{a.intro}</p>
            <div className="flex flex-wrap gap-2">
              {a.suggestions.map((s) => (
                <button key={s} type="button" onClick={() => ask(s)} className="border border-line px-3 py-1.5 text-start text-xs text-bone transition-colors hover:border-gold hover:text-gold">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          turns.map((turn, i) => {
            if (turn.role === "user") {
              return <p key={i} className="ms-auto max-w-[85%] bg-gold/15 px-3.5 py-2.5 whitespace-pre-wrap text-bone">{turn.content}</p>;
            }
            const { body, followUps } = splitFollowUps(turn.content);
            const latest = i === turns.length - 1;
            return (
              <div key={i} className="space-y-2">
                <div className={`max-w-[92%] border px-3.5 py-2.5 ${turn.error ? "border-red-400/40 text-mist" : "border-line text-mist"}`}>
                  {body ? <Answer text={body} onNavigate={onClose} /> : <p className="animate-pulse">{a.thinking}</p>}
                  {turn.error && (
                    <a href={site.whatsapp.href} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-gold underline underline-offset-4">
                      {a.contactTeam}
                    </a>
                  )}
                </div>
                {/* Questions de relance : seulement sous la dernière réponse, pour continuer la conversation en un clic. */}
                {latest && !busy && followUps.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {followUps.map((q) => (
                      <button key={q} type="button" onClick={() => ask(q)} className="border border-line px-3 py-1.5 text-start text-xs text-bone transition-colors hover:border-gold hover:text-gold">
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={submit} className="border-t border-line p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
            rows={1}
            maxLength={MAX_CHARS}
            placeholder={a.placeholder}
            aria-label={a.placeholder}
            className="max-h-32 min-h-11 flex-1 resize-none border border-line bg-ink px-3 py-2.5 text-sm text-bone outline-none placeholder:text-mist/60 focus:border-gold"
          />
          {busy ? (
            <button type="button" onClick={() => abortRef.current?.abort()} className="grid h-11 shrink-0 place-items-center border border-line px-3 text-xs text-mist hover:border-gold hover:text-bone">
              {a.stop}
            </button>
          ) : (
            <button type="submit" disabled={!input.trim()} aria-label={a.send} className="grid size-11 shrink-0 place-items-center bg-gold text-ink transition-opacity disabled:opacity-40">
              <Icon name="arrow" width={18} height={18} className="rtl:-scale-x-100" />
            </button>
          )}
        </div>
        <p className="mt-2 text-[0.65rem] text-mist/80">{a.disclaimer}</p>
      </form>
    </section>
  );
}
