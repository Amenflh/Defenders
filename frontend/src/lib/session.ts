import "server-only";
import { cookies, headers } from "next/headers";
import { backendUrl } from "./api";

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

/** Appel à l'API avec le jeton de session de l'utilisateur (s'il est connecté). */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getSessionToken();
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  return fetch(backendUrl(path), {
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
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
