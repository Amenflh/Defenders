"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { ACADEMIES, ACADEMY_NAME, ACCENTS, formationHref, type Academy } from "@/lib/academies";
import { ImageUpload } from "../ImageUpload";
import { saveFormation, type FormationFormState } from "./actions";

/** Valeurs texte du formulaire ; les traductions sont nommées « en.name », « ar.name »… */
export type FormationFormValues = Record<string, string>;

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
  trainers,
}: {
  /** null : création. */
  id: number | null;
  initial: FormationFormValues;
  /** Images téléversées, proposées comme visuel principal. */
  images: { url: string; title: string }[];
  trainers: { id: number; name: string }[];
}) {
  const [state, action, pending] = useActionState<FormationFormState, FormData>(saveFormation.bind(null, id), { status: "idle", attempt: 0 });
  const values = (state.status === "error" && state.values) || initial;
  const err = (k: string) => state.errors?.[k]?.[0];
  const statusRef = useRef<HTMLDivElement>(null);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(id !== null);
  const [academy, setAcademy] = useState<Academy>(values.academy === "tsa" ? "tsa" : "fitness");
  const [cover, setCover] = useState(values.coverUrl);
  const galleryRef = useRef<HTMLTextAreaElement>(null);
  const selectedTrainers = new Set(values.trainerIds.split(","));

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
          <Field label="Académie" name="academy" required error={err("academy")}>
            <select id="academy" name="academy" value={academy} onChange={(e) => setAcademy(e.target.value as Academy)} className="input">
              {ACADEMIES.map((a) => <option key={a} value={a}>{ACADEMY_NAME[a]}</option>)}
            </select>
          </Field>
          <Field label="Couleur" name="accent" error={err("accent")}>
            <select id="accent" name="accent" defaultValue={values.accent} className="input">
              {ACCENTS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </Field>
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
          <Field label="Identifiant d'URL" name="slug" required error={err("slug")} hint={`Adresse : ${formationHref({ slug: slug || "…", academy })}`}>
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
          <Field label="Date de la session" name="nextSessionDate" error={err("nextSessionDate")} hint="Date unique affichée dans le planning">
            <input id="nextSessionDate" name="nextSessionDate" type="date" defaultValue={values.nextSessionDate} className="input" />
          </Field>
          <Field label="Tarif (DT)" name="priceTnd" error={err("priceTnd")} hint="Vide : « Nous consulter »">
            <input id="priceTnd" name="priceTnd" inputMode="decimal" defaultValue={values.priceTnd} className="input" />
          </Field>
          <Field label="Lieu" name="location" error={err("location")} hint="Ex. Hammamet">
            <input id="location" name="location" defaultValue={values.location} maxLength={120} className="input" />
          </Field>
          <Field label="Téléphone de renseignement" name="contactPhone" error={err("contactPhone")} hint="Facultatif">
            <input id="contactPhone" name="contactPhone" type="tel" defaultValue={values.contactPhone} maxLength={30} className="input" />
          </Field>
          <Field label="Publication ou programme (lien)" name="sourceUrl" error={err("sourceUrl")} hint="Facebook, PDF…">
            <input id="sourceUrl" name="sourceUrl" defaultValue={values.sourceUrl} maxLength={1000} className="input" />
          </Field>
        </div>
        <Field label="Informations pratiques" name="practical" error={err("practical")} hint="Certificats, hébergement, modalités… (1500 caractères max.)">
          <textarea id="practical" name="practical" defaultValue={values.practical} maxLength={1500} rows={4} className="input" />
        </Field>
      </Section>

      <Section title="Images et vidéos">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Visuel principal" name="coverUrl" error={err("coverUrl")} hint="Choisissez une image des Médias ou importez-en une">
            <div className="space-y-2">
              <select id="coverUrl" name="coverUrl" value={cover} onChange={(e) => setCover(e.target.value)} className="input">
                <option value="">Visuel par défaut</option>
                {cover && !images.some((i) => i.url === cover) && <option value={cover}>{cover}</option>}
                {images.map((i) => (
                  <option key={i.url} value={i.url}>{i.title || i.url}</option>
                ))}
              </select>
              <ImageUpload label="Importer une image" url={cover} onUploaded={setCover} />
              <label className="flex items-center gap-3 text-sm text-mist">
                <input type="checkbox" name="coverIsPoster" defaultChecked={values.coverIsPoster === "on"} className="size-4 accent-[var(--color-gold)]" />
                C&apos;est une affiche : la montrer en entier
              </label>
            </div>
          </Field>
          <Field label="Galerie de la formation" name="galleryUrls" error={err("galleryUrls")} hint="Une adresse d'image par ligne. Vide : galerie de l'académie">
            <div className="space-y-2">
              <textarea ref={galleryRef} id="galleryUrls" name="galleryUrls" defaultValue={values.galleryUrls} rows={6} className="input font-mono text-sm" />
              <ImageUpload label="Ajouter une image à la galerie" onUploaded={(url) => {
                if (galleryRef.current) galleryRef.current.value = [galleryRef.current.value.trim(), url].filter(Boolean).join("\n");
              }} />
            </div>
          </Field>
        </div>
        <Field label="Vidéos" name="videos" error={err("videos")} hint="Une par ligne : lien Facebook, Instagram, YouTube ou fichier | titre | portrait, square ou landscape. La première s'affiche sur la carte.">
          <textarea id="videos" name="videos" defaultValue={values.videos} rows={4} className="input font-mono text-sm" />
        </Field>
        {trainers.length > 0 && (
          <fieldset>
            <legend className="mb-3 text-sm font-medium">Formateurs</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {trainers.map((trainer) => (
                <label key={trainer.id} className="flex items-center gap-2 text-sm text-mist">
                  <input type="checkbox" name="trainerIds" value={trainer.id} defaultChecked={selectedTrainers.has(String(trainer.id))} className="size-4 accent-[var(--color-gold)]" /> {trainer.name}
                </label>
              ))}
            </div>
          </fieldset>
        )}
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

      <TranslationFields lang="en" title="Traduction anglaise" values={values} />
      <TranslationFields lang="ar" title="Traduction arabe" values={values} />

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-line bg-ink/95 px-4 py-4 backdrop-blur">
        <button type="submit" disabled={pending} className="btn btn-primary disabled:opacity-60">
          {pending ? "Enregistrement…" : id ? "Enregistrer les modifications" : "Créer la formation"}
        </button>
        <Link href="/admin/formations" className="btn btn-ghost">Retour à la liste</Link>
        {id && values.status === "published" && (
          <Link href={formationHref({ slug: initial.slug, academy: initial.academy as Academy })} target="_blank" className="ml-auto text-sm text-mist underline hover:text-bone">
            Voir la page publique
          </Link>
        )}
      </div>
    </form>
  );
}

const TRANSLATED: [string, string, number][] = [
  ["name", "Nom", 1], ["headline", "Accroche", 1], ["summary", "Résumé", 3], ["durationLabel", "Durée", 1], ["location", "Lieu", 1], ["practical", "Informations pratiques", 4],
  ["intro", "Présentation", 5], ["objectives", "Objectifs (un par ligne)", 5], ["prerequisites", "Prérequis (un par ligne)", 3], ["audience", "Public (un par ligne)", 3],
  ["careers", "Débouchés (un par ligne)", 3], ["modules", "Programme : Titre | description", 5], ["facts", "Chiffres clés : Libellé | valeur", 3],
];

/** Textes d'une autre langue : un champ vide s'affiche en français. */
function TranslationFields({ lang, title, values }: { lang: "en" | "ar"; title: string; values: FormationFormValues }) {
  return (
    <details className="border border-line bg-ink-2 p-6">
      <summary className="cursor-pointer font-display text-lg tracking-[0.12em] uppercase">{title}</summary>
      <p className="mt-2 text-xs text-mist">Un champ laissé vide s&apos;affiche en français.</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {TRANSLATED.map(([name, label, rows]) => {
          const key = `${lang}.${name}`;
          return (
            <Field key={key} label={label} name={key}>
              {rows === 1
                ? <input id={key} name={key} dir={lang === "ar" ? "rtl" : "ltr"} defaultValue={values[key] ?? ""} className="input" />
                : <textarea id={key} name={key} dir={lang === "ar" ? "rtl" : "ltr"} rows={rows} defaultValue={values[key] ?? ""} className="input" />}
            </Field>
          );
        })}
      </div>
    </details>
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
