import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Lien saisi dans l'admin, rendu sûr pour un href : chemin interne, http(s), mailto: ou tel:.
 * Tout le reste (javascript:, data:, //domaine…) est remplacé par `fallback`.
 */
export function safeHref(value: string | null | undefined, fallback = "#"): string {
  const href = (value ?? "").trim();
  return /^\/(?!\/)/.test(href) || /^https?:\/\//i.test(href) || /^(mailto|tel):/i.test(href) ? href : fallback;
}
