"use client";

import { useMemo, useState, useTransition } from "react";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { flattenTexts } from "@/lib/i18n/overrides";
import { saveTextsAction } from "../entries-actions";

type Values = Record<Locale, Record<string, string>>;

/** Rubriques proposées (début du chemin → nom lisible). */
const GROUPS: { prefix: string; label: string }[] = [
  { prefix: "home.", label: "Accueil" },
  { prefix: "branches.", label: "Accueil · Les académies" },
  { prefix: "highlights.", label: "Accueil · Ce qui nous distingue" },
  { prefix: "pages.fitnessAcademy.", label: "Page Fitness Academy" },
  { prefix: "pages.akAcademy.", label: "Page Tunisian Security Academy" },
  { prefix: "pages.security.", label: "Services et devis sécurité" },
  { prefix: "divisions.", label: "Galeries et témoignages des académies" },
  { prefix: "pages.formationsList.", label: "Page Nos formations" },
  { prefix: "pages.formation.", label: "Fiche formation" },
  { prefix: "history.", label: "Page Historique" },
  { prefix: "planning.", label: "Page Planning" },
  { prefix: "contact.", label: "Page Contact" },
  { prefix: "form.", label: "Formulaire d'inscription" },
  { prefix: "pages.quiz.", label: "Quiz d'orientation" },
  { prefix: "internalRules.", label: "Règlement intérieur" },
  { prefix: "nav.", label: "Menu" },
  { prefix: "common.", label: "Boutons et textes communs" },
  { prefix: "", label: "Tous les textes" },
];
const PAGE = 40;

export function TextsEditor({ initial }: { initial: Partial<Values> }) {
  const [values, setValues] = useState<Values>({ fr: initial.fr ?? {}, en: initial.en ?? {}, ar: initial.ar ?? {} });
  const [group, setGroup] = useState(GROUPS[0].prefix);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  const defaults = useMemo(
    () => Object.fromEntries(LOCALES.map((l) => [l, new Map(flattenTexts(dictionaries[l]).map(({ path, text }) => [path, text]))])) as Record<Locale, Map<string, string>>,
    [],
  );
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...defaults.fr.keys()].filter((path) => {
      if (needle) return LOCALES.some((l) => (values[l][path] ?? defaults[l].get(path) ?? "").toLowerCase().includes(needle));
      return path.startsWith(group);
    });
  }, [defaults, group, query, values]);

  const set = (locale: Locale, path: string, text: string) => {
    setMessage(null);
    setValues((old) => {
      const next = { ...old[locale] };
      // Vide ou identique au texte d'origine : plus de personnalisation.
      if (!text.trim() || text === defaults[locale].get(path)) delete next[path];
      else next[path] = text;
      return { ...old, [locale]: next };
    });
  };
  const changed = LOCALES.reduce((n, l) => n + Object.keys(values[l]).length, 0);

  return (
    <div>
      <div className="sticky top-20 z-20 -mx-4 mb-6 flex flex-wrap items-end gap-3 border-b border-line bg-ink/95 px-4 py-4 backdrop-blur">
        <label className="min-w-52 flex-1 text-xs text-mist">Rechercher un texte
          <input value={query} onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }} placeholder="Ex. encadrement unique" className="input mt-1 !py-2.5 text-sm" />
        </label>
        <label className="min-w-52 flex-1 text-xs text-mist">Rubrique
          <select value={group} disabled={!!query.trim()} onChange={(e) => { setGroup(e.target.value); setLimit(PAGE); }} className="input mt-1 !py-2.5 text-sm">
            {GROUPS.map((g) => <option key={g.label} value={g.prefix}>{g.label}</option>)}
          </select>
        </label>
        <button type="button" disabled={pending} onClick={() => startTransition(async () => {
          const result = await saveTextsAction(values);
          setMessage(result.ok ? { text: "Textes enregistrés : visibles immédiatement.", error: false } : { text: result.message ?? "Échec.", error: true });
        })} className="btn btn-primary disabled:opacity-50">{pending ? "Enregistrement…" : "Enregistrer"}</button>
        <p className="w-full text-xs text-mist">
          {matches.length} texte(s) · {changed} personnalisé(s). Videz un champ pour revenir au texte d&apos;origine.
          {message && <span role={message.error ? "alert" : "status"} className={`ms-3 ${message.error ? "text-red-300" : "text-gold"}`}>{message.text}</span>}
        </p>
      </div>

      <ul className="space-y-4">
        {matches.slice(0, limit).map((path) => (
          <li key={path} className="border border-line bg-ink-2 p-4">
            <p className="mb-3 font-mono text-[0.7rem] break-all text-mist">{path}</p>
            <div className="grid gap-3 lg:grid-cols-3">
              {LOCALES.map((l) => {
                const original = defaults[l].get(path) ?? "";
                return (
                  <label key={l} className="text-xs text-mist">{LOCALE_LABELS[l].name}{values[l][path] !== undefined && <span className="ms-2 text-gold">modifié</span>}
                    <textarea dir={l === "ar" ? "rtl" : "ltr"} rows={Math.min(8, Math.max(2, Math.ceil(original.length / 55)))} value={values[l][path] ?? original} onChange={(e) => set(l, path, e.target.value)} onBlur={(e) => !e.target.value.trim() && set(l, path, "")} className="input mt-1 !py-2 text-sm" />
                  </label>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
      {matches.length > limit && <button type="button" onClick={() => setLimit((n) => n + PAGE)} className="btn btn-ghost mt-6">Afficher plus ({matches.length - limit})</button>}
    </div>
  );
}
