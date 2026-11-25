"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteEntryAction, saveEntryAction, type EntryEndpoint } from "./entries-actions";
import { ImageUpload } from "./ImageUpload";

/** Champ d'un formulaire de contenu. `translatable` : saisi aussi en anglais et en arabe. */
export type EntryField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "date" | "checkbox" | "image" | "lines" | "videos" | "links";
  hint?: string;
  required?: boolean;
  translatable?: boolean;
  options?: { value: string; label: string }[];
  /** Valeur d'un nouvel élément. */
  initial?: string | boolean;
  /** Champ numérique facultatif : vide = null (sinon 0). */
  nullable?: boolean;
};

export type Entry = { id: number } & Record<string, unknown>;
type Lang = "fr" | "en" | "ar";
type Draft = Record<string, string | boolean>;

const LANGS: { value: Lang; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];
const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));
const key = (lang: Lang, name: string) => (lang === "fr" ? name : `${lang}.${name}`);
const splitLines = (v: string) => v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const parts = (line: string) => line.split("|").map((p) => p.trim());

function toText(field: EntryField, value: unknown): string | boolean {
  if (field.type === "checkbox") return value === undefined ? field.initial === true : Boolean(value);
  if (field.type === "lines") return ((value as string[] | undefined) ?? []).join("\n");
  if (field.type === "videos") return ((value as { url: string; title: string; layout: string }[] | undefined) ?? []).map((v) => [v.url, v.title, v.layout].join(" | ")).join("\n");
  if (field.type === "links") return ((value as { url: string; label: string }[] | undefined) ?? []).map((v) => (v.label ? `${v.url} | ${v.label}` : v.url)).join("\n");
  return value === undefined ? str(field.initial) : str(value);
}

function fromText(field: EntryField, raw: string | boolean): unknown {
  const text = String(raw).trim();
  switch (field.type) {
    case "checkbox": return Boolean(raw);
    case "number": return text === "" ? (field.nullable ? null : 0) : Number(text);
    case "lines": return splitLines(text);
    case "videos": return splitLines(text).map((line) => {
      const [url, title = "", layout = ""] = parts(line);
      return { url, title, layout: ["portrait", "square", "landscape"].includes(layout) ? layout : "portrait" };
    });
    case "links": return splitLines(text).map((line) => {
      const [url, label = ""] = parts(line);
      return { url, label };
    });
    case "select": return text === "" ? null : text;
    default: return text;
  }
}

function draftOf(fields: EntryField[], entry?: Entry): Draft {
  const draft: Draft = {};
  const translations = (entry?.translations ?? {}) as Partial<Record<Lang, Record<string, unknown>>>;
  for (const field of fields) {
    draft[field.name] = toText(field, entry?.[field.name]);
    if (field.translatable) for (const lang of ["en", "ar"] as const) draft[key(lang, field.name)] = str(translations[lang]?.[field.name]);
  }
  return draft;
}

/** Liste + formulaire (ajout, modification, suppression) d'un type de contenu, en trois langues. */
export function EntryManager({ endpoint, entries, fields, titleField, badges = [], fixed = {}, itemName, empty }: {
  endpoint: EntryEndpoint;
  entries: Entry[];
  fields: EntryField[];
  titleField: string;
  /** Champs résumés sur chaque ligne de la liste. */
  badges?: string[];
  /** Valeurs ajoutées à la création (ex. section). */
  fixed?: Record<string, unknown>;
  itemName: string;
  empty: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft>(() => draftOf(fields));
  const [lang, setLang] = useState<Lang>("fr");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const translatable = fields.filter((field) => field.translatable);
  const set = (name: string, value: string | boolean) => { setMessage(null); setDraft((old) => ({ ...old, [name]: value })); };

  const open = (entry?: Entry) => {
    setEditing(entry?.id ?? null);
    setDraft(draftOf(fields, entry));
    setLang("fr");
    setMessage(null);
    if (entry) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const save = () => startTransition(async () => {
    const body: Record<string, unknown> = editing ? {} : { ...fixed };
    for (const field of fields) body[field.name] = fromText(field, draft[field.name]);
    if (translatable.length) {
      body.translations = Object.fromEntries((["en", "ar"] as const).map((l) => [
        l,
        Object.fromEntries(translatable.map((field) => [field.name, String(draft[key(l, field.name)] ?? "").trim()]).filter(([, value]) => value)),
      ]));
    }
    const result = await saveEntryAction(endpoint, editing, body);
    if (!result.ok) return setMessage({ text: result.message ?? "Enregistrement impossible.", error: true });
    open();
    setMessage({ text: "Enregistré : visible immédiatement sur le site.", error: false });
    router.refresh();
  });

  const remove = (entry: Entry) => {
    if (!window.confirm(`Supprimer définitivement « ${str(entry[titleField])} » ?`)) return;
    startTransition(async () => {
      const result = await deleteEntryAction(endpoint, entry.id);
      if (editing === entry.id) open();
      setMessage(result.ok ? { text: "Élément supprimé.", error: false } : { text: result.message ?? "Suppression impossible.", error: true });
      router.refresh();
    });
  };

  const input = (field: EntryField) => {
    const name = key(lang, field.name);
    const value = draft[name];
    const shared = { id: `${endpoint}-${name}`, className: "input !py-2.5 text-sm", dir: lang === "ar" && field.translatable ? "rtl" : undefined } as const;
    if (field.type === "textarea" || field.type === "lines" || field.type === "videos" || field.type === "links") {
      return <textarea {...shared} rows={field.type === "textarea" ? 6 : 3} value={String(value ?? "")} placeholder={lang !== "fr" ? String(draft[field.name] ?? "") : undefined} onChange={(e) => set(name, e.target.value)} />;
    }
    if (field.type === "select") {
      return (
        <select {...shared} value={String(value ?? "")} onChange={(e) => set(name, e.target.value)}>
          {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      );
    }
    if (field.type === "image") {
      return (
        <div className="space-y-2">
          <ImageUpload label="Choisir une image" url={String(value ?? "")} onUploaded={(url) => set(name, url)} />
          <input {...shared} value={String(value ?? "")} placeholder="/pics/… ou https://…" onChange={(e) => set(name, e.target.value)} />
        </div>
      );
    }
    return <input {...shared} type={field.type} min={field.type === "number" ? 0 : undefined} value={String(value ?? "")} placeholder={lang !== "fr" ? String(draft[field.name] ?? "") : undefined} onChange={(e) => set(name, e.target.value)} />;
  };

  const shown = lang === "fr" ? fields : translatable;
  const missingTitle = !String(draft[titleField] ?? "").trim();

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(22rem,0.9fr)_1.1fr]">
      <form ref={formRef} onSubmit={(e) => { e.preventDefault(); save(); }} className="h-fit scroll-mt-24 space-y-4 border border-line bg-ink-2 p-5" aria-busy={pending}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl uppercase">{editing ? "Modifier" : "Ajouter"} · {itemName}</h3>
          {editing && <button type="button" onClick={() => open()} className="text-xs text-mist underline hover:text-bone">Annuler</button>}
        </div>
        {translatable.length > 0 && (
          <div role="group" aria-label="Langue" className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button key={l.value} type="button" aria-pressed={lang === l.value} onClick={() => setLang(l.value)} className={`border px-3 py-1.5 text-xs ${lang === l.value ? "border-gold bg-gold text-ink" : "border-line text-mist hover:text-bone"}`}>{l.label}</button>
            ))}
          </div>
        )}
        {lang !== "fr" && <p className="text-xs text-mist">Un champ laissé vide s&apos;affiche en français.</p>}
        {shown.map((field) => field.type === "checkbox" ? (
          <label key={field.name} className="flex items-center gap-3 text-sm text-mist">
            <input type="checkbox" checked={Boolean(draft[field.name])} onChange={(e) => set(field.name, e.target.checked)} className="size-4 accent-[var(--color-gold)]" /> {field.label}
          </label>
        ) : (
          <div key={field.name} className="space-y-1.5">
            <label htmlFor={`${endpoint}-${key(lang, field.name)}`} className="block text-xs text-mist">{field.label} {field.required && <span className="text-gold">*</span>}</label>
            {input(field)}
            {field.hint && <p className="text-[0.7rem] text-mist/80">{field.hint}</p>}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending || missingTitle} className="btn btn-primary disabled:opacity-50">{pending ? "Enregistrement…" : editing ? "Enregistrer" : "Ajouter"}</button>
          {message && <span role={message.error ? "alert" : "status"} className={`text-xs ${message.error ? "text-red-300" : "text-gold"}`}>{message.text}</span>}
        </div>
      </form>

      <ul className="content-start space-y-3">
        {entries.length === 0 && <li className="border border-line bg-ink-2 p-8 text-sm text-mist">{empty}</li>}
        {entries.map((entry) => (
          <li key={entry.id} className={`flex flex-wrap items-start justify-between gap-4 border bg-ink-2 p-4 ${editing === entry.id ? "border-gold" : "border-line"}`}>
            <div className="min-w-0 flex-1 basis-56">
              <p className="font-display text-lg break-words text-bone">{str(entry[titleField])}</p>
              <p className="mt-1 flex flex-wrap gap-2 text-[0.65rem] tracking-[0.1em] text-mist uppercase">
                {badges.map((name) => {
                  const field = fields.find((f) => f.name === name);
                  const value = entry[name];
                  const label = field?.options?.find((o) => o.value === str(value))?.label ?? str(value);
                  return label ? <span key={name} className="border border-line px-1.5 py-0.5">{label}</span> : null;
                })}
                {entry.active === false && <span className="border border-red-400/50 px-1.5 py-0.5 text-red-300">Masqué</span>}
              </p>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => open(entry)} className="text-xs text-gold uppercase">Modifier</button>
              <button type="button" disabled={pending} onClick={() => remove(entry)} className="text-xs text-red-300 uppercase disabled:opacity-50">Supprimer</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
