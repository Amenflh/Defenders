"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { MEDIA_CATEGORIES } from "@/lib/academies";
import { CONTACT_FIELDS, contactsFrom } from "@/lib/contacts";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { FromPreview } from "@/lib/preview/config";
import type { Draft } from "@/lib/preview/draft";
import { stripRefs } from "@/lib/preview/markers";
import { HOMEPAGE_SECTIONS, moveSection, normalizeHomepageSections, type HomepageSection } from "../home-sections";
import { ImageUpload } from "../ImageUpload";
import { LivePreview } from "../LivePreview";
import { addMediaLink } from "../medias/actions";
import { publishDraftAction } from "./actions";

export type EditorItem = { id: number; translations?: Record<string, Record<string, unknown>> } & Record<string, unknown>;
export type EditorData = {
  formations: EditorItem[];
  history: EditorItem[];
  trainers: EditorItem[];
  cms: EditorItem[];
  media: EditorItem[];
  settings: Record<string, unknown>;
  texts: Partial<Record<Locale, Record<string, string>>>;
};
type Kind = "formations" | "history" | "trainers" | "cms" | "media";
type Selection = { ref: string; kind: "text" | "image" };
/** Une modification en attente : sa version en ligne et sa version proposée. */
type Edit = { ref: string; locale: Locale; label: string; before: string; after: string };

const KINDS: Record<string, Kind> = { f: "formations", h: "history", r: "trainers", c: "cms", m: "media" };
const IMAGE_FIELD: Record<Kind, string> = { formations: "coverUrl", history: "", trainers: "photoUrl", cms: "imageUrl", media: "url" };
const KIND_LABEL: Record<Kind, string> = { formations: "Formation", history: "Historique", trainers: "Formateur", cms: "Contenu", media: "Média" };
const FIELD_LABEL: Record<string, string> = {
  name: "Nom", headline: "Accroche", summary: "Résumé", durationLabel: "Durée", location: "Lieu", practical: "Informations pratiques", intro: "Présentation",
  objectives: "Objectif", prerequisites: "Prérequis", audience: "Public", careers: "Débouché", modules: "Module", facts: "Chiffre clé", title: "Titre",
  text: "Texte", label: "Libellé", value: "Valeur", subtitle: "Sous-titre", body: "Texte", description: "Description", place: "Lieu", bio: "Présentation", photoUrl: "Photo",
  coverUrl: "Visuel", imageUrl: "Image", url: "Image",
};
const SETTING_LABEL: Record<string, string> = {
  ...Object.fromEntries(CONTACT_FIELDS.map(({ key, label }) => [key, label])),
  approval: "Numéro d'agrément", certificationLabel: "Texte de certification", heroLead: "Accroche avant les formations", heroDescription: "Description principale",
  footerTagline: "Description du pied de page", mentions: "Mentions légales", privacy: "Confidentialité", cookies: "Cookies", homepageSections: "Zones de l'accueil",
};
const FULL_FORM: Record<Kind, (item: EditorItem) => string> = {
  formations: (f) => `/admin/formations/${f.id}`,
  history: () => "/admin/historique",
  trainers: () => "/admin/equipe",
  cms: (c) => `/admin?tab=${c.section === "partners" ? "partenaires" : "contenus"}`,
  media: () => "/admin/medias",
};

type Path = (string | number)[];
const toPath = (keys: string[]): Path => keys.map((k) => (/^\d+$/.test(k) ? Number(k) : k));
const getIn = (source: unknown, path: Path): unknown => path.reduce<unknown>((value, key) => (value && typeof value === "object" ? (value as Record<string | number, unknown>)[key] : undefined), source);
function setIn(source: unknown, path: Path, value: unknown): unknown {
  if (path.length === 0) return value;
  const [key, ...rest] = path;
  const copy: Record<string | number, unknown> | unknown[] = Array.isArray(source) ? [...source] : typeof key === "number" && !source ? [] : { ...(source as object | undefined) };
  (copy as Record<string | number, unknown>)[key] = setIn((copy as Record<string | number, unknown>)[key], rest, value);
  return copy;
}
const text = (value: unknown) => (value === null || value === undefined ? "" : String(value));

export function VisualEditor({ pages, data }: { pages: { path: string; label: string }[]; data: EditorData }) {
  const router = useRouter();
  const [path, setPath] = useState("/");
  const [locale, setLocale] = useState<Locale>("fr");
  const [editMode, setEditMode] = useState(true);
  const [draft, setDraft] = useState<Draft>({});
  const [edits, setEdits] = useState<Record<string, Edit>>({});
  const [selection, setSelection] = useState<Selection | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const panel = useRef<HTMLDivElement>(null);
  const contacts = useMemo(() => contactsFrom(data.settings), [data.settings]);
  const editList = Object.values(edits);

  // Quitter la page avec des modifications non publiées : le navigateur demande confirmation.
  useEffect(() => {
    if (editList.length === 0) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editList.length]);

  const item = (kind: Kind, id: string): EditorItem | undefined => data[kind].find((entry) => String(entry.id) === id);

  /** Réglage affiché sur le site quand rien n'est encore enregistré. */
  const settingFallback = (key: string): string => ({
    phone: contacts.phone.label, phone2: contacts.phone2.label, email: contacts.email.label, securityEmail: contacts.securityEmail.label, approval: contacts.approval,
    address: contacts.address.lines.join(", "), tsaPhone: contacts.tunisianSecurityAcademy.phone.label, tsaPhone2: contacts.tunisianSecurityAcademy.trainingPhone.label,
    tsaEmail: contacts.tunisianSecurityAcademy.email.label, tsaAddress: contacts.tunisianSecurityAcademy.address.join(", "),
  } as Record<string, string>)[key] ?? "";

  /** Valeur actuelle (brouillon compris, ou en ligne seulement). */
  function valueOf(ref: string, lang: Locale, source: Draft = draft): string {
    const [type, ...keys] = ref.split(".");
    if (type === "t") {
      const key = keys.join(".");
      return (source.texts ?? data.texts)[lang]?.[key] ?? text(getIn(dictionaries[lang], toPath(keys)));
    }
    if (type === "s") return text(source.settings?.[keys[0]] ?? data.settings[keys[0]]) || settingFallback(keys[0]);
    const kind = KINDS[type];
    const base = kind && item(kind, keys[0]);
    if (!base) return "";
    const merged = { ...base, ...source[kind]?.[keys[0]] };
    const field = toPath(keys.slice(1));
    return text(getIn(lang === "fr" ? merged : merged.translations?.[lang], field));
  }

  function labelOf(ref: string): string {
    const [type, ...keys] = ref.split(".");
    if (type === "t") return "Texte de la page";
    if (type === "s") return SETTING_LABEL[keys[0]] ?? "Réglage";
    const kind = KINDS[type];
    const base = kind && item(kind, keys[0]);
    const names = keys.slice(1).map((k) => (/^\d+$/.test(k) ? `n° ${Number(k) + 1}` : FIELD_LABEL[k] ?? k)).join(" ");
    return base ? `${KIND_LABEL[kind]} « ${text(base.name ?? base.title) || `n° ${base.id}`} » · ${names}` : names;
  }

  function change(ref: string, lang: Locale, value: unknown) {
    setMessage(null);
    const [type, ...keys] = ref.split(".");
    const before = valueOf(ref, lang, {});
    setDraft((old) => {
      if (type === "t") {
        const key = keys.join(".");
        const texts = { fr: {}, en: {}, ar: {}, ...data.texts, ...old.texts } as Record<Locale, Record<string, string>>;
        const next = { ...texts[lang] };
        // Vide ou identique au texte d'origine : plus de personnalisation.
        if (!text(value).trim() || value === text(getIn(dictionaries[lang], toPath(keys)))) delete next[key];
        else next[key] = text(value);
        return { ...old, texts: { ...texts, [lang]: next } };
      }
      if (type === "s") return { ...old, settings: { ...old.settings, [keys[0]]: value } };
      const kind = KINDS[type];
      const base = item(kind, keys[0]);
      if (!base) return old;
      const patch = old[kind]?.[keys[0]] ?? {};
      const merged = { ...base, ...patch } as EditorItem;
      const [field, ...rest] = toPath(keys.slice(1));
      let nextPatch: Record<string, unknown>;
      if (lang === "fr") nextPatch = { ...patch, [field]: setIn(merged[field as string], rest, value) };
      else {
        const translation = merged.translations?.[lang] ?? {};
        // Liste pas encore traduite : on part de la version française pour garder les autres lignes.
        const source = rest.length && !Array.isArray(translation[field as string]) ? merged[field as string] : translation[field as string];
        nextPatch = { ...patch, translations: { ...merged.translations, [lang]: { ...translation, [field]: setIn(source, rest, value) } } };
      }
      return { ...old, [kind]: { ...old[kind], [keys[0]]: nextPatch } };
    });
    setEdits((old) => {
      const id = `${lang}|${ref}`;
      const next = { ...old };
      const original = old[id]?.before ?? before;
      if (text(value) === original) delete next[id];
      else next[id] = { ref, locale: lang, label: labelOf(ref), before: original, after: text(value) };
      return next;
    });
  }

  function removeItem(ref: string) {
    const [type, id] = ref.split(".");
    const kind = KINDS[type];
    setDraft((old) => ({ ...old, [kind]: { ...old[kind], [id]: { ...old[kind]?.[id], deleted: true } } }));
    setEdits((old) => ({ ...old, [`fr|${type}.${id}.deleted`]: { ref: `${type}.${id}.deleted`, locale: "fr", label: `${KIND_LABEL[kind]} retiré`, before: text(item(kind, id)?.title ?? item(kind, id)?.name) || "—", after: "(retiré)" } }));
    setSelection(null);
  }

  function undo(edit: Edit) {
    const [type, id, field] = edit.ref.split(".");
    if (field === "deleted" || edit.ref === "s.homepageSections") {
      setDraft((old) => {
        if (edit.ref === "s.homepageSections") {
          const settings = { ...old.settings };
          delete settings.homepageSections;
          return { ...old, settings };
        }
        const kind = KINDS[type];
        const patch = { ...old[kind]?.[id] };
        delete patch.deleted;
        return { ...old, [kind]: { ...old[kind], [id]: patch } };
      });
    } else change(edit.ref, edit.locale, edit.before);
    setEdits((old) => {
      const next = { ...old };
      delete next[`${edit.locale}|${edit.ref}`];
      return next;
    });
  }

  const reset = () => {
    setDraft({});
    setEdits({});
    setSelection(null);
  };

  const publish = () => startTransition(async () => {
    const result = await publishDraftAction(draft);
    setMessage(result.ok ? { text: "Publié : le site est à jour.", error: false } : { text: result.errors.join(" · "), error: true });
    if (result.ok) reset();
    router.refresh();
  });

  const onSelect = (found: Extract<FromPreview, { type: "dfa:select" }>) => {
    setSelection({ ref: found.ref, kind: found.kind });
    setMessage(null);
    // Petit écran : le champ est sous l'aperçu.
    window.setTimeout(() => {
      if (window.innerWidth < 1280) panel.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      panel.current?.querySelector<HTMLElement>("textarea, input:not([type=file])")?.focus({ preventScroll: true });
    }, 60);
  };

  const sections = normalizeHomepageSections(draft.settings?.homepageSections ?? data.settings.homepageSections);
  const setSections = (next: HomepageSection[]) => {
    setMessage(null);
    setDraft((old) => ({ ...old, settings: { ...old.settings, homepageSections: next } }));
    setEdits((old) => ({ ...old, "fr|s.homepageSections": { ref: "s.homepageSections", locale: "fr", label: "Zones de l'accueil", before: "Ordre actuel", after: "Nouvel ordre ou visibilité" } }));
  };

  const [selectedType, selectedId] = selection?.ref.split(".") ?? [];
  const selectedKind = selectedType ? KINDS[selectedType] : undefined;
  const selectedItem = selectedKind && item(selectedKind, selectedId);
  const imageField = selection?.kind === "image" && selectedKind ? IMAGE_FIELD[selectedKind] : "";
  const imageRef = imageField ? `${selectedType}.${selectedId}.${imageField}` : null;
  // Réglages et images : une seule version, quelle que soit la langue.
  const lang: Locale = selectedType === "s" ? "fr" : locale;
  const inputClass = "input !py-2.5 text-sm";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-gold">Contenu du site</p>
          <h1 className="mt-2 font-display text-2xl uppercase text-bone">Éditeur visuel</h1>
          <p className="mt-1 max-w-2xl text-sm text-mist">Cliquez sur un texte ou une image du site, modifiez-le et voyez le résultat aussitôt. Rien n&apos;est en ligne avant « Publier ».</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {message && <span role={message.error ? "alert" : "status"} className={`text-xs ${message.error ? "text-red-300" : "text-emerald-500"}`}>{message.text}</span>}
          <button type="button" disabled={pending || editList.length === 0} onClick={() => window.confirm("Annuler toutes les modifications non publiées ?") && reset()} className="btn btn-ghost !px-4 !py-3 disabled:opacity-40">Tout annuler</button>
          <button type="button" disabled={pending || editList.length === 0} onClick={publish} className="btn btn-primary !px-5 !py-3 disabled:opacity-40">{pending ? "Publication…" : `Publier${editList.length ? ` (${editList.length})` : ""}`}</button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="flex max-w-full min-w-0 items-center gap-2 text-xs text-mist">Page
          <select value={path} onChange={(e) => { setPath(e.target.value); setSelection(null); }} className="input !w-auto min-w-0 flex-1 !py-2 text-sm">
            {pages.map((page) => <option key={page.path} value={page.path}>{page.label}</option>)}
          </select>
        </label>
        <div role="group" aria-label="Mode" className="flex gap-1">
          {([[true, "Modifier"], [false, "Naviguer"]] as const).map(([value, label]) => (
            <button key={label} type="button" aria-pressed={editMode === value} onClick={() => setEditMode(value)} className={`border px-3 py-2 text-xs uppercase tracking-wider ${editMode === value ? "border-gold bg-gold text-ink" : "border-line text-mist hover:text-bone"}`}>{label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <LivePreview path={path} draft={draft} locale={locale} onLocale={setLocale} edit={editMode} onSelect={onSelect} focus={selection?.ref} height="74vh" className="xl:sticky xl:top-24 xl:self-start" />

        <div ref={panel} className="min-w-0 scroll-mt-24 space-y-5">
          <section className="border border-line bg-ink-2 p-4">
            {!selection ? (
              <p className="text-sm text-mist">Cliquez sur un texte ou une image dans l&apos;aperçu. Le contour orange montre ce qui est modifiable.</p>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-gold">{labelOf(imageRef ?? selection.ref)}</p>
                {imageRef ? (
                  <>
                    <ImageUpload label="Remplacer l'image" url={valueOf(imageRef, "fr")} onUploaded={(url) => change(imageRef, "fr", url)} />
                    <label className="block text-xs text-mist">Adresse de l&apos;image
                      <input value={valueOf(imageRef, "fr")} onChange={(e) => change(imageRef, "fr", e.target.value)} className={`${inputClass} mt-1`} />
                    </label>
                    {selectedKind === "media" && (
                      <>
                        <label className="block text-xs text-mist">Description
                          <input value={valueOf(`m.${selectedId}.title`, "fr")} onChange={(e) => change(`m.${selectedId}.title`, "fr", e.target.value)} className={`${inputClass} mt-1`} />
                        </label>
                        <AddPhoto category={text(selectedItem?.category)} academy={text(selectedItem?.academy)} onAdded={() => router.refresh()} />
                        <button type="button" onClick={() => removeItem(selection.ref)} className="text-xs text-red-300 underline">Retirer cette image</button>
                      </>
                    )}
                  </>
                ) : (
                  <TextField
                    key={`${lang}|${selection.ref}`}
                    value={valueOf(selection.ref, lang)}
                    original={valueOf(selection.ref, lang, {})}
                    fallback={lang === "fr" ? "" : valueOf(selection.ref, "fr")}
                    locale={lang}
                    onChange={(value) => change(selection.ref, lang, value)}
                  />
                )}
                {selectedType === "s" && locale !== "fr" && <p className="text-xs text-mist">Ce réglage est commun aux trois langues.</p>}
                {selectedItem && selectedKind && (
                  <Link href={FULL_FORM[selectedKind](selectedItem)} className="block text-xs text-mist underline hover:text-bone">Ouvrir la fiche complète (vidéos, ordre, suppression…)</Link>
                )}
              </div>
            )}
          </section>

          {path === "/" && (
            <details className="border border-line bg-ink-2 p-4">
              <summary className="cursor-pointer font-display text-base uppercase text-bone">Zones de l&apos;accueil</summary>
              <ol className="mt-3 space-y-1.5">
                {sections.map((section, index) => (
                  <li key={section.id} className="flex items-center gap-2 border border-line bg-ink px-2 py-1.5">
                    <label className="flex min-w-0 flex-1 items-center gap-2 text-xs text-bone">
                      <input type="checkbox" checked={section.enabled} onChange={(e) => setSections(sections.map((s) => (s.id === section.id ? { ...s, enabled: e.target.checked } : s)))} className="size-4 accent-[var(--color-gold)]" />
                      <span className={section.enabled ? "" : "line-through opacity-60"}>{HOMEPAGE_SECTIONS.find((s) => s.id === section.id)?.label}</span>
                    </label>
                    <button type="button" aria-label="Monter la zone" disabled={index === 0} onClick={() => setSections(moveSection(sections, index, -1))} className="grid size-7 place-items-center border border-line text-xs disabled:opacity-30">↑</button>
                    <button type="button" aria-label="Descendre la zone" disabled={index === sections.length - 1} onClick={() => setSections(moveSection(sections, index, 1))} className="grid size-7 place-items-center border border-line text-xs disabled:opacity-30">↓</button>
                  </li>
                ))}
              </ol>
            </details>
          )}

          <section className="border border-line bg-ink-2 p-4">
            <h2 className="font-display text-base uppercase text-bone">Modifications à publier ({editList.length})</h2>
            {editList.length === 0 && <p className="mt-2 text-xs text-mist">Aucune pour le moment.</p>}
            <ul className="mt-3 space-y-3">
              {editList.map((edit) => (
                <li key={`${edit.locale}|${edit.ref}`} className="border-s-2 border-gold ps-3 text-xs">
                  <p className="text-mist">{edit.label} · {LOCALE_LABELS[edit.locale].short}</p>
                  <p className="mt-1 line-clamp-2 break-words text-mist line-through" dir="auto">{edit.before || "(vide)"}</p>
                  <p className="line-clamp-3 break-words text-bone" dir="auto">{edit.after || "(vide)"}</p>
                  <div className="mt-1.5 flex gap-4">
                    {!/deleted$|homepageSections$/.test(edit.ref) && <button type="button" onClick={() => { setLocale(edit.locale); setSelection({ ref: edit.ref, kind: /Url$|\.url$/.test(edit.ref) ? "image" : "text" }); }} className="text-gold underline">Modifier</button>}
                    <button type="button" onClick={() => undo(edit)} className="text-red-300 underline">Annuler</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-line bg-ink-2 p-4 text-xs text-mist">
            <h2 className="font-display text-base uppercase text-bone">Ajouter</h2>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
              {[["/admin/formations/nouvelle", "Une formation"], ["/admin/historique", "Un historique"], ["/admin/equipe", "Un formateur"], ["/admin/medias", "Une photo ou vidéo"], ["/admin?tab=contenus", "FAQ, témoignage"], ["/admin?tab=partenaires", "Un partenaire"]].map(([href, label]) => (
                <li key={href}><Link href={href} className="underline hover:text-bone">{label}</Link></li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Champ du texte choisi, avec sa version en ligne. */
function TextField({ value, original, fallback, locale, onChange }: { value: string; original: string; fallback: string; locale: Locale; onChange: (value: string) => void }) {
  const shown = stripRefs(value);
  const rows = Math.min(12, Math.max(2, Math.ceil(Math.max(shown.length, fallback.length) / 38)));
  return (
    <div className="space-y-2">
      <label className="block text-xs text-mist">{LOCALE_LABELS[locale].name}
        <textarea value={shown} rows={rows} dir={locale === "ar" ? "rtl" : "ltr"} placeholder={fallback || undefined} onChange={(e) => onChange(e.target.value)} className="input mt-1 !py-2.5 text-sm" />
      </label>
      {value !== original && (
        <div className="border border-line bg-ink p-2.5 text-xs text-mist">
          <p className="mb-1 text-[0.65rem] tracking-wider uppercase">Version en ligne</p>
          <p dir="auto" className="break-words">{original || "(vide)"}</p>
          <button type="button" onClick={() => onChange(original)} className="mt-2 text-gold underline">Revenir à cette version</button>
        </div>
      )}
    </div>
  );
}

/** Ajoute une photo au même emplacement que l'image choisie (enregistrée tout de suite). */
function AddPhoto({ category, academy, onAdded }: { category: string; academy: string; onAdded: () => void }) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const place = MEDIA_CATEGORIES.find((c) => c.value === category)?.label ?? "même emplacement";
  return (
    <div className="border-t border-line pt-3">
      <ImageUpload label={pending ? "Ajout…" : "Ajouter une photo ici"} onUploaded={(url) => startTransition(async () => {
        const form = new FormData();
        for (const [key, value] of Object.entries({ type: "image", url, title: "", category, academy })) form.set(key, value);
        const result = await addMediaLink(form);
        setMessage(result.ok ? `Photo ajoutée (${place}).` : result.message ?? "Échec.");
        onAdded();
      })} />
      {message && <p role="status" className="mt-1 text-xs text-mist">{message}</p>}
    </div>
  );
}
