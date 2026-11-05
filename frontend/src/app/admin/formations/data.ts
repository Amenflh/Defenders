import "server-only";
import { redirect } from "next/navigation";
import type { Formation } from "@/lib/formations";
import { apiFetch } from "@/lib/session";
import type { FormationFormValues } from "./FormationForm";

export type AdminFormation = Formation & { registrationCount: number; sessionCount: number };

/** Appel admin : session expirée → connexion ; API injoignable → null. */
async function adminGet<T>(path: string, next: string): Promise<T | null | "not-found"> {
  const res = await apiFetch(path).catch(() => null);
  if (!res) return null;
  if (res.status === 401) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (res.status === 404) return "not-found";
  return res.ok ? ((await res.json()) as T) : null;
}

export async function listAdminFormations() {
  const data = await adminGet<{ formations: AdminFormation[] }>("/api/admin/formations", "/admin/formations");
  return data && data !== "not-found" ? data.formations : null;
}

export async function getAdminFormation(id: number) {
  const data = await adminGet<{ formation: Formation }>(`/api/admin/formations/${id}`, `/admin/formations/${id}`);
  return data === "not-found" ? "not-found" : (data?.formation ?? null);
}

/** Images téléversées (choix du visuel principal). */
export async function listImages(): Promise<{ url: string; title: string }[]> {
  const data = await adminGet<{ media: { url: string; title: string }[] }>("/api/admin/media?type=image", "/admin/formations");
  return data && data !== "not-found" ? data.media.map(({ url, title }) => ({ url, title })) : [];
}

/** Formation (API) → valeurs texte du formulaire. */
export function toFormValues(f?: Formation): FormationFormValues {
  return {
    name: f?.name ?? "",
    slug: f?.slug ?? "",
    headline: f?.headline ?? "",
    summary: f?.summary ?? "",
    status: f?.status ?? "draft",
    level: f?.level ?? "",
    durationLabel: f?.durationLabel ?? "",
    priceTnd: f?.priceTnd == null ? "" : String(f.priceTnd),
    position: String(f?.position ?? 0),
    coverUrl: f?.coverUrl ?? "",
    intro: (f?.intro ?? []).join("\n\n"),
    objectives: (f?.objectives ?? []).join("\n"),
    prerequisites: (f?.prerequisites ?? []).join("\n"),
    audience: (f?.audience ?? []).join("\n"),
    careers: (f?.careers ?? []).join("\n"),
    modules: (f?.modules ?? []).map((m) => (m.text ? `${m.title} | ${m.text}` : m.title)).join("\n"),
    facts: (f?.facts ?? []).map((x) => `${x.label} | ${x.value}`).join("\n"),
  };
}
