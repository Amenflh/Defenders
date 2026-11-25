import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { backendUrl } from "./api";
import type { Locale } from "./i18n/config";
import { parsePreview, PREVIEW_HEADER } from "./preview/config";
import { applyDraft, type Draft } from "./preview/draft";
import { markResponse } from "./preview/markers";
import { getDraft } from "./preview/store";
import { cachedPublicGet, clearPublicCache, isCacheablePublicGet } from "./public-cache";

/** Cookie httpOnly contenant le jeton de session (illisible par le JavaScript de la page). */
export const SESSION_COOKIE = "dfa_session";

export type Role = "admin" | "client";
export type User = { id: number; email: string; name: string; phone: string; role: Role };

/**
 * Nombre de reverse proxies de confiance devant Next.js (Nginx, Traefik…). Chacun ajoute une IP
 * à droite de X-Forwarded-For : seules ces entrées sont fiables, celles de gauche viennent du navigateur.
 */
const TRUSTED_PROXY_HOPS = Math.max(1, Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? "1", 10) || 1);

/**
 * IP du visiteur, transmise à l'API pour que ses limites (rate limit) soient par visiteur.
 * On lit X-Forwarded-For depuis la droite : la première valeur (à gauche) est falsifiable par le client.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const chain = (h.get("x-forwarded-for") ?? "").split(",").map((ip) => ip.trim()).filter(Boolean);
  return chain[Math.max(0, chain.length - TRUSTED_PROXY_HOPS)] || h.get("x-real-ip") || "unknown";
}

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/**
 * Aperçu demandé par un administrateur connecté (?apercu=…) : sa langue et son brouillon. null sur le site public.
 */
export const getPreview = cache(async (): Promise<{ locale: Locale; draft: Draft } | null> => {
  const preview = parsePreview((await headers()).get(PREVIEW_HEADER));
  if (!preview) return null;
  const user = await getCurrentUser();
  if (!user || user === "unavailable" || user.role !== "admin") return null;
  return { locale: preview.locale, draft: getDraft(user.id, preview.draftId) };
});

/** Lecture publique de l'API ; dans l'aperçu, avec le brouillon de l'admin et les références des textes. */
export async function publicGet(path: string, load: () => Promise<Response>): Promise<Response> {
  const preview = await getPreview();
  const response = await cachedPublicGet(path, load);
  if (!preview) return response;
  const body: unknown = await response.json().catch(() => null);
  const needsTrainers = path.startsWith("/api/formations/") && Object.keys(preview.draft.formations ?? {}).length > 0;
  const trainers = needsTrainers
    ? await cachedPublicGet("/api/trainers", () => fetch(backendUrl("/api/trainers"), { cache: "no-store", signal: AbortSignal.timeout(5000) })).then((r) => (r.ok ? r.json() : { trainers: [] }))
    : { trainers: [] };
  const result = applyDraft(path, response.status, body, preview.draft, trainers.trainers);
  return Response.json(markResponse(path.split("?")[0], result.body), { status: result.status });
}

/**
 * Appel à l'API avec le jeton de session de l'utilisateur (s'il est connecté).
 * Les lectures publiques (identiques pour tous) passent par un cache mémoire court, voir public-cache.ts.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  if (isCacheablePublicGet(path, method) && !init.headers) {
    return publicGet(path, () =>
      fetch(backendUrl(path), { cache: "no-store", signal: AbortSignal.timeout(8000), headers: { "Content-Type": "application/json" } }),
    );
  }
  const token = await getSessionToken();
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  const response = await fetch(backendUrl(path), {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      "X-Forwarded-For": await clientIp(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (method !== "GET" && method !== "HEAD") clearPublicCache();
  return response;
}

/**
 * Utilisateur connecté, ou :
 * - null si non connecté / session expirée,
 * - "unavailable" si l'API ne répond pas.
 */
export async function getCurrentUser(): Promise<User | null | "unavailable"> {
  if (!(await getSessionToken())) return null;
  try {
    const res = await apiFetch("/api/auth/me");
    if (res.status === 401) return null;
    if (!res.ok) return "unavailable";
    return ((await res.json()) as { user: User }).user;
  } catch {
    return "unavailable";
  }
}

/** Page d'accueil selon le rôle. */
export const homeFor = (role: Role) => (role === "admin" ? "/admin" : "/");

/** N'accepte que des chemins internes (évite les redirections ouvertes vers un autre site). */
export function safeNext(next: unknown): string | null {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : null;
}

/** Coordonnées du client connecté, pour pré-remplir les formulaires d'inscription ({} sinon). */
export async function getContactDefaults(): Promise<Partial<Record<"firstName" | "lastName" | "email" | "phone", string>>> {
  const user = await getCurrentUser();
  if (!user || user === "unavailable" || user.role !== "client") return {};
  const [firstName, ...rest] = user.name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" "), email: user.email, phone: user.phone };
}

/** Adresse publique du site (liens à partager) : NEXT_PUBLIC_SITE_URL, sinon l'hôte de la requête. */
export async function publicOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3001";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
