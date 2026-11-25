"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Draft } from "@/lib/preview/draft";
import { apiFetch } from "@/lib/session";

const ENDPOINTS = { formations: "/api/admin/formations", history: "/api/admin/history", trainers: "/api/admin/trainers", cms: "/api/admin/cms", media: "/api/admin/media" } as const;

async function call(path: string, method: "PATCH" | "PUT" | "DELETE", body?: unknown): Promise<string | null> {
  const res = await apiFetch(path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin/editeur");
  if (!res) return "L'API ne répond pas.";
  if (res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as { error?: string; errors?: Record<string, string[] | undefined> };
  return Object.values(data.errors ?? {}).flat().find(Boolean) ?? data.error ?? "Enregistrement impossible.";
}

/** Publie les modifications de l'éditeur visuel. Renvoie les éléments refusés (ils restent modifiables). */
export async function publishDraftAction(draft: Draft): Promise<{ ok: boolean; errors: string[] }> {
  const errors: string[] = [];
  const report = (error: string | null) => error && errors.push(error);

  if (draft.texts) report(await call("/api/admin/settings/texts", "PUT", draft.texts));
  if (draft.settings && Object.keys(draft.settings).length) {
    // Les réglages sont enregistrés d'un bloc : on part de la version actuelle.
    const current = await apiFetch("/api/admin/settings/site").catch(() => null);
    if (!current?.ok) report("Les réglages n'ont pas pu être lus.");
    else report(await call("/api/admin/settings/site", "PUT", { ...((await current.json()) as { value: Record<string, unknown> }).value, ...draft.settings }));
  }
  for (const kind of Object.keys(ENDPOINTS) as (keyof typeof ENDPOINTS)[]) {
    for (const [id, patch] of Object.entries(draft[kind] ?? {})) {
      if (!/^\d+$/.test(id)) continue;
      if (patch.deleted === true) report(await call(`${ENDPOINTS[kind]}/${id}`, "DELETE"));
      else report(await call(`${ENDPOINTS[kind]}/${id}`, "PATCH", patch));
    }
  }
  revalidatePath("/", "layout");
  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}
