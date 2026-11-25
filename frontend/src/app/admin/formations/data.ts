import "server-only";
import { redirect } from "next/navigation";
import type { Formation } from "@/lib/formations";
import { apiFetch } from "@/lib/session";
import type { FormationFormValues } from "./FormationForm";

export type AdminFormation = Formation & { registrationCount: number; sessionCount: number };
type FormationWithTrainers = Formation & { trainerIds: number[] };

/** Formateurs proposés dans la fiche. */
export async function listTrainers(): Promise<{ id: number; name: string }[]> {
  const data = await adminGet<{ trainers: { id: number; name: string }[] }>("/api/admin/trainers", "/admin/formations");
  return data && data !== "not-found" ? data.trainers.map(({ id, name }) => ({ id, name })) : [];
}

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
  const data = await adminGet<{ formation: FormationWithTrainers }>(`/api/admin/formations/${id}`, `/admin/formations/${id}`);
  return data === "not-found" ? "not-found" : (data?.formation ?? null);
}

/** Images téléversées (choix du visuel principal). */
export async function listImages(): Promise<{ url: string; title: string }[]> {
  const data = await adminGet<{ media: { url: string; title: string }[] }>("/api/admin/media?type=image", "/admin/formations");
  if (!data || data === "not-found") return [];
  // Une même image peut servir à plusieurs emplacements (galerie, bandeau…) : proposée une seule fois.
  return [...new Map(data.media.map(({ url, title }) => [url, { url, title }])).values()];
}

type TextSource = Partial<Pick<Formation, "intro" | "objectives" | "prerequisites" | "audience" | "careers" | "modules" | "facts">>;
const longTexts = (f?: TextSource) => ({
  intro: (f?.intro ?? []).join("\n\n"),
  objectives: (f?.objectives ?? []).join("\n"),
  prerequisites: (f?.prerequisites ?? []).join("\n"),
  audience: (f?.audience ?? []).join("\n"),
  careers: (f?.careers ?? []).join("\n"),
  modules: (f?.modules ?? []).map((m) => (m.text ? `${m.title} | ${m.text}` : m.title)).join("\n"),
  facts: (f?.facts ?? []).map((x) => `${x.label} | ${x.value}`).join("\n"),
});

/** Formation (API) → valeurs texte du formulaire, traductions comprises (« en.name »…). */
export function toFormValues(f?: FormationWithTrainers): FormationFormValues {
  const translated = Object.fromEntries((["en", "ar"] as const).flatMap((lang) => {
    const tr = (f?.translations?.[lang] ?? {}) as Partial<Record<"name" | "headline" | "summary" | "durationLabel" | "location" | "practical", string>> & TextSource;
    const { name = "", headline = "", summary = "", durationLabel = "", location = "", practical = "" } = tr;
    return Object.entries({ name, headline, summary, durationLabel, location, practical, ...longTexts(tr) }).map(([k, v]) => [`${lang}.${k}`, v]);
  }));
  return {
    ...translated,
    academy: f?.academy ?? "fitness",
    accent: f?.accent ?? "gold",
    location: f?.location ?? "",
    practical: f?.practical ?? "",
    contactPhone: f?.contactPhone ?? "",
    sourceUrl: f?.sourceUrl ?? "",
    coverIsPoster: f?.coverIsPoster ? "on" : "",
    videos: (f?.videos ?? []).map((v) => [v.url, v.title, v.layout].join(" | ")).join("\n"),
    galleryUrls: (f?.galleryUrls ?? []).join("\n"),
    trainerIds: (f?.trainerIds ?? []).join(","),
    ...longTexts(f),
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
    nextSessionDate: f?.nextSessionDate ?? "",
  };
}
