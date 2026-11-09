/** Une cellule CSV : guillemets doublés, et neutralisation des formules (=, +, -, @) à l'ouverture dans Excel. */
export function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Tableau → CSV lisible par Excel en français : BOM UTF-8, séparateur « ; », lignes CRLF. */
export function toCsv(rows: unknown[][]): string {
  return "﻿" + rows.map((row) => row.map((cell) => csvCell(String(cell ?? ""))).join(";")).join("\r\n");
}
