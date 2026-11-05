"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveFormation, type FormationFormState } from "./actions";

export type FormationFormValues = Record<
  | "name" | "slug" | "headline" | "summary" | "status" | "level" | "durationLabel" | "priceTnd" | "position" | "coverUrl"
  | "intro" | "objectives" | "prerequisites" | "audience" | "careers" | "modules" | "facts",
  string
>;

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon (invisible sur le site)" },
  { value: "published", label: "Publiée" },
  { value: "archived", label: "Archivée" },
];

const LEVEL_OPTIONS = [
  { value: "", label: "Non précisé" },
  { value: "tous_niveaux", label: "Tous niveaux" },
  { value: "debutant", label: "Débutant" },
  { value: "intermediaire", label: "Intermédiaire" },
  { value: "avance", label: "Avancé" },
];

/** « Préparation physique » → « preparation-physique ». */
const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export function FormationForm({
  id,
  initial,
  images,
}: {
  /** null : création. */
  id: number | null;
  initial: FormationFormValues;
  /** Images téléversées, proposées comme visuel principal. */
  images: { url: string; title: string }[];
}) {
  const [state, action, pending] = useActionState<FormationFormState, FormData>(saveFormation.bind(null, id), { status: "idle", attempt: 0 });
  const values = (state.status === "error" && state.values) || initial;
  const err = (k: string) => state.errors?.[k]?.[0];
  const statusRef = useRef<HTMLDivElement>(null);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(id !== null);

  useEffect(() => {
    if (state.status !== "idle") statusRef.current?.focus();
  }, [state]);

  return (
    <form key={state.attempt} action={action} noValidate className="space-y-10" aria-busy={pending}>
      <div ref={statusRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {state.status === "error" && (
          <div role="alert" className="border border-red-400/50 bg-red-500/10 p-4 text-sm text-red-200">
            {state.message}
            {err("_form") && <span className="mt-1 block">{err("_form")}</span>}
          </div>
        )}
        {state.status === "success" && <div className="border border-football/50 bg-football/10 p-4 text-sm text-bone">{state.message}</div>}
      </div>

      <Section title="Identité">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom" name="name" required error={err("name")}>
            <input
              id="name"
              name="name"
              defaultValue={values.name}
              maxLength={80}
              required
              onChange={(e) => !slugTouched && setSlug(slugify(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Identifiant d'URL" name="slug" required error={err("slug")} hint={`Adresse : /formations/${slug || "…"}`}>
            <input
              id="slug"
              name="slug"
              value={slug}
              maxLength={60}
              required
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              className="input font-mono"
            />
          </Field>
        </div>
        <Field label="Accroche" name="headline" error={err("headline")} hint="Phrase affichée sous le nom (160 caractères max.)">
          <input id="headline" name="headline" defaultValue={values.headline} maxLength={160} className="input" />
        </Field>
        <Field label="Résumé" name="summary" error={err("summary")} hint="Affiché sur les cartes et en haut de la page (600 caractères max.)">
          <textarea id="summary" name="summary" defaultValue={values.summary} maxLength={600} rows={3} className="input" />
        </Field>
      </Section>

      <Section title="Publication et infos pratiques">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Statut" name="status" error={err("status")}>
            <select id="status" name="status" defaultValue={values.status} className="input">
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Niveau" name="level" error={err("level")}>
            <select id="level" name="level" defaultValue={values.level} className="input">
              {LEVEL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Ordre d'affichage" name="position" error={err("position")} hint="Plus petit = affiché en premier">
            <input id="position" name="position" type="number" min={0} max={9999} defaultValue={values.position} className="input" />
          </Field>
          <Field label="Durée" name="durationLabel" error={err("durationLabel")} hint="Ex. 4 jours intensifs">
            <input id="durationLabel" name="durationLabel" defaultValue={values.durationLabel} maxLength={60} className="input" />
          </Field>
          <Field label="Tarif (DT)" name="priceTnd" error={err("priceTnd")} hint="Vide : « Nous consulter »">
            <input id="priceTnd" name="priceTnd" inputMode="decimal" defaultValue={values.priceTnd} className="input" />
          </Field>
          <Field label="Visuel principal" name="coverUrl" error={err("coverUrl")} hint="Images envoyées dans l'onglet Médias">
            <select id="coverUrl" name="coverUrl" defaultValue={values.coverUrl} className="input">
              <option value="">Visuel par défaut</option>
              {values.coverUrl && !images.some((i) => i.url === values.coverUrl) && <option value={values.coverUrl}>{values.coverUrl}</option>}
              {images.map((i) => (
                <option key={i.url} value={i.url}>{i.title || i.url}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Contenu de la page">
        <Field label="Présentation" name="intro" error={err("intro")} hint="Un paragraphe par bloc : laissez une ligne vide entre deux paragraphes">
          <textarea id="intro" name="intro" defaultValue={values.intro} rows={6} className="input" />
        </Field>
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Objectifs" name="objectives" error={err("objectives")} hint="Un objectif par ligne">
            <textarea id="objectives" name="objectives" defaultValue={values.objectives} rows={6} className="input" />
          </Field>
          <Field label="Prérequis" name="prerequisites" error={err("prerequisites")} hint="Un prérequis par ligne (facultatif)">
            <textarea id="prerequisites" name="prerequisites" defaultValue={values.prerequisites} rows={6} className="input" />
          </Field>
          <Field label="Public concerné" name="audience" error={err("audience")} hint="Un profil par ligne">
            <textarea id="audience" name="audience" defaultValue={values.audience} rows={4} className="input" />
          </Field>
          <Field label="Débouchés" name="careers" error={err("careers")} hint="Un débouché par ligne">
            <textarea id="careers" name="careers" defaultValue={values.careers} rows={4} className="input" />
          </Field>
        </div>
        <Field label="Programme (modules)" name="modules" error={err("modules")} hint="Un module par ligne : Titre | description">
          <textarea id="modules" name="modules" defaultValue={values.modules} rows={7} className="input font-mono text-sm" />
        </Field>
        <Field label="Chiffres clés" name="facts" error={err("facts")} hint="3 maximum affichés, un par ligne : Libellé | valeur (ex. Durée | 4 jours). Vide : durée, niveau et tarif">
          <textarea id="facts" name="facts" defaultValue={values.facts} rows={3} className="input font-mono text-sm" />
        </Field>
      </Section>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-ink/95 px-4 py-4 backdrop-blur">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Enregistrement…" : id ? "Enregistrer les modifications" : "Créer la formation"}
        </button>
        <Link href="/admin/formations" className="btn btn-ghost">Retour à la liste</Link>
        {id && values.status === "published" && (
          <Link href={`/formations/${initial.slug}`} target="_blank" className="ml-auto text-sm text-mist underline hover:text-bone">
            Voir la page publique
          </Link>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5 border border-line bg-ink-2 p-6">
      <legend className="px-2 font-display text-lg tracking-[0.12em] uppercase">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, name, hint, error, required, children }: { label: string; name: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-mist">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
