"use client";

import { useEffect, useRef, useState } from "react";

export type RowColumn = { label: string; placeholder?: string; type?: "text" | "textarea" | "select"; options?: { value: string; label: string }[]; wide?: boolean };

/** Colonnes des vidéos, liens, modules et chiffres clés. */
export const VIDEO_COLUMNS: RowColumn[] = [
  { label: "Lien de la vidéo", placeholder: "https://www.facebook.com/reel/…", wide: true },
  { label: "Titre", placeholder: "Facultatif" },
  { label: "Format", type: "select", options: [{ value: "portrait", label: "Vertical" }, { value: "square", label: "Carré" }, { value: "landscape", label: "Horizontal" }] },
];
export const LINK_COLUMNS: RowColumn[] = [{ label: "Lien", placeholder: "https://…", wide: true }, { label: "Texte du bouton", placeholder: "Facultatif" }];
export const MODULE_COLUMNS: RowColumn[] = [{ label: "Titre" }, { label: "Description", type: "textarea", wide: true }];
export const FACT_COLUMNS: RowColumn[] = [{ label: "Libellé", placeholder: "Ex. Durée" }, { label: "Valeur", placeholder: "Ex. 4 jours" }];

const parse = (text: string, columns: number) =>
  text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const parts = line.split("|").map((part) => part.trim());
    // Le texte peut contenir « | » dans la dernière colonne.
    return Array.from({ length: columns }, (_, i) => (i === columns - 1 ? parts.slice(i).join(" | ") : parts[i] ?? ""));
  });
const clean = (value: string, last: boolean) => (last ? value : value.replace(/\|/g, "/")).replace(/\s*\r?\n\s*/g, " ").trim();
const serialize = (rows: string[][]) => rows.filter((row) => row[0].trim()).map((row) => row.map((cell, i) => clean(cell, i === row.length - 1)).join(" | ").replace(/(\s\|\s*)+$/, "")).join("\n");

/**
 * Liste de lignes à plusieurs champs (ajouter, déplacer, supprimer), enregistrée en texte « a | b » :
 * plus besoin de connaître ce format.
 */
export function RowsEditor({ name, columns, value, onChange, addLabel, dir }: {
  /** Nom du champ de formulaire (champ caché). */
  name?: string;
  columns: RowColumn[];
  value: string;
  onChange?: (text: string) => void;
  addLabel: string;
  dir?: "rtl" | "ltr";
}) {
  const [rows, setRows] = useState(() => parse(value, columns.length));
  const text = serialize(rows);
  const hidden = useRef<HTMLInputElement>(null);
  const sent = useRef(text);

  // Prévient le formulaire (aperçu en direct) à chaque changement réel.
  useEffect(() => {
    if (sent.current === text) return;
    sent.current = text;
    onChange?.(text);
    hidden.current?.dispatchEvent(new Event("input", { bubbles: true }));
  }, [text, onChange]);

  const update = (row: number, column: number, cell: string) => setRows((old) => old.map((r, i) => (i === row ? r.map((c, j) => (j === column ? cell : c)) : r)));
  const move = (row: number, offset: -1 | 1) => setRows((old) => {
    const target = row + offset;
    if (target < 0 || target >= old.length) return old;
    const next = [...old];
    [next[row], next[target]] = [next[target], next[row]];
    return next;
  });
  const small = "grid size-8 place-items-center border border-line text-xs text-mist transition-colors hover:border-gold hover:text-bone disabled:opacity-30";

  return (
    <div className="space-y-2">
      {name && <input ref={hidden} type="hidden" name={name} value={text} readOnly />}
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-start gap-2 border border-line bg-ink p-2.5">
          {columns.map((column, j) => {
            const shared = { "aria-label": `${column.label} ${i + 1}`, dir, className: `input !px-3 !py-2 text-sm` } as const;
            return (
              <div key={column.label} className={`min-w-0 ${column.wide ? "flex-[2_1_16rem]" : "flex-[1_1_8rem]"}`}>
                {column.type === "textarea"
                  ? <textarea {...shared} rows={2} value={row[j]} placeholder={column.placeholder ?? column.label} onChange={(e) => update(i, j, e.target.value)} />
                  : column.type === "select"
                    ? <select {...shared} value={row[j] || column.options?.[0].value} onChange={(e) => update(i, j, e.target.value)}>{column.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
                    : <input {...shared} value={row[j]} placeholder={column.placeholder ?? column.label} onChange={(e) => update(i, j, e.target.value)} />}
              </div>
            );
          })}
          <div className="flex gap-1">
            <button type="button" aria-label="Monter" disabled={i === 0} onClick={() => move(i, -1)} className={small}>↑</button>
            <button type="button" aria-label="Descendre" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className={small}>↓</button>
            <button type="button" aria-label="Supprimer la ligne" onClick={() => setRows((old) => old.filter((_, j) => j !== i))} className={`${small} !text-red-300`}>✕</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setRows((old) => [...old, columns.map((c) => c.options?.[0].value ?? "")])} className="border border-dashed border-line px-4 py-2 text-xs text-mist transition-colors hover:border-gold hover:text-bone">+ {addLabel}</button>
    </div>
  );
}
