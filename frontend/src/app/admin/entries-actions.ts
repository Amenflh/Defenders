"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/session";

/** Contenus gérés par l'éditeur commun (EntryManager). */
const ENDPOINTS = ["/api/admin/history", "/api/admin/trainers", "/api/admin/cms"] as const;
export type EntryEndpoint = (typeof ENDPOINTS)[number];
type Result = { ok: boolean; message?: string; errors?: Record<string, string[] | undefined> };

async function call(endpoint: EntryEndpoint, path: string, init: RequestInit): Promise<Result> {
  if (!ENDPOINTS.includes(endpoint)) return { ok: false, message: "Action inconnue." };
  const res = await apiFetch(`${endpoint}${path}`, init).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  if (!res) return { ok: false, message: "L'API ne répond pas. Réessayez dans un instant." };
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string; errors?: Result["errors"] };
    const first = Object.entries(data.errors ?? {}).find(([, messages]) => messages?.length);
    return { ok: false, message: first ? `${first[0]} : ${first[1]![0]}` : data.error ?? "Enregistrement impossible.", errors: data.errors };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveEntryAction(endpoint: EntryEndpoint, id: number | null, body: Record<string, unknown>): Promise<Result> {
  return call(endpoint, id ? `/${id}` : "", { method: id ? "PATCH" : "POST", body: JSON.stringify(body) });
}

export async function deleteEntryAction(endpoint: EntryEndpoint, id: number): Promise<Result> {
  return call(endpoint, `/${id}`, { method: "DELETE" });
}

/** Textes du site modifiés : { fr: { chemin: texte }, en: {…}, ar: {…} }. */
export async function saveTextsAction(value: Record<string, Record<string, string>>): Promise<Result> {
  const res = await apiFetch("/api/admin/settings/texts", { method: "PUT", body: JSON.stringify(value) }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin/textes");
  if (!res?.ok) return { ok: false, message: "Enregistrement impossible. Réessayez." };
  revalidatePath("/", "layout");
  return { ok: true };
}
