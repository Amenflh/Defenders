"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import { dirFor } from "@/lib/i18n/config";
import { internalRules } from "@/lib/internal-rules";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

/**
 * Lecture obligatoire du règlement intérieur avant une inscription :
 * 1. le candidat fait défiler le règlement jusqu'en bas ;
 * 2. il clique sur « Je confirme avoir lu le règlement » ;
 * 3. la case d'acceptation (envoyée sous le nom `rulesAccepted`) devient cochable.
 */
export function RulesAgreement({ defaultAccepted = false, error }: { defaultAccepted?: boolean; error?: string }) {
  const { locale, t } = useI18n();
  const r = t.form.rules;
  const rules = internalRules[locale];
  const boxRef = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(defaultAccepted);
  const [confirmed, setConfirmed] = useState(defaultAccepted);
  const [accepted, setAccepted] = useState(defaultAccepted);

  const checkEnd = () => {
    const el = boxRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 12) setReachedEnd(true);
  };
  // Écran assez grand pour tout afficher sans défilement : la lecture est considérée comme atteinte.
  useEffect(checkEnd, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-mist">{r.intro}</p>

      <div className="border border-line bg-ink">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <p className="font-display text-sm tracking-[0.08em] uppercase">{r.title}</p>
          <a href={site.documents.rules} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 text-xs text-gold hover:text-gold-soft">
            <Icon name="file" width={14} height={14} /> {r.download}
          </a>
        </div>
        <div
          ref={boxRef}
          onScroll={checkEnd}
          tabIndex={0}
          role="document"
          aria-label={r.title}
          dir={dirFor(locale)}
          lang={locale}
          className={`max-h-72 overflow-y-auto px-5 py-4 text-sm leading-loose text-bone/90 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold ${locale === "ar" ? "text-right font-[family-name:var(--font-cairo)]" : "text-left"}`}
        >
          <p className="mb-4 text-center font-semibold">{rules.title}</p>
          <ol className="space-y-3">
            {rules.clauses.map((clause, index) => (
              <li key={index}>
                <span className="font-semibold text-gold underline underline-offset-4">{rules.chapterLabel} {index + 1}:</span> {clause}
              </li>
            ))}
          </ol>
          <p className="mt-6 border-t border-line pt-4 text-center text-xs text-mist" dir="ltr">
            Defenders Security Protection · Defenders Fitness Academy · Tunisian Security Academy — Agrément n° 21-340-24
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!reachedEnd || confirmed}
          onClick={() => setConfirmed(true)}
          className="btn btn-primary !px-4 !py-2.5 !text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="check" width={16} height={16} /> {confirmed ? r.confirmed : r.confirm}
        </button>
        {!reachedEnd && <p className="text-xs text-mist">{r.scrollHint}</p>}
      </div>

      <label className={`flex items-start gap-3 text-sm ${confirmed ? "text-mist" : "cursor-not-allowed text-mist/50"}`}>
        <input
          type="checkbox"
          name="rulesAccepted"
          disabled={!confirmed}
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 size-4 accent-[var(--color-gold)]"
        />
        {r.checkbox}
      </label>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
