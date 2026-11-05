import "server-only";
import { cookies, headers } from "next/headers";
import { backendUrl } from "./api";

/** Cookie httpOnly contenant le jeton de session (illisible par le JavaScript de la page). */
export const SESSION_COOKIE = "dfa_session";

export type Role = "admin" | "client";
export type User = { id: number; email: string; name: string; phone: string; role: Role };

/** IP du visiteur, transmise à l'API pour que ses limites (rate limit) soient par visiteur. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Appel à l'API avec le jeton de session de l'utilisateur (s'il est connecté). */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getSessionToken();
  return fetch(backendUrl(path), {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    headers: {
      "Content-Type": "application/json",
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
