"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/session";

type Result = { ok: boolean; message?: string };

async function call(path: string, init: RequestInit): Promise<Result> {
  const res = await apiFetch(path, init).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin/medias");
  if (!res) return { ok: false, message: "L'API ne répond pas." };
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string; errors?: Record<string, string[]> };
    return { ok: false, message: Object.values(data.errors ?? {})[0]?.[0] ?? data.error ?? "Action impossible." };
  }
  revalidatePath("/admin/medias");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateMedia(id: number, fields: { title: string; category: string; formationId: number | null }) {
  return call(`/api/admin/media/${id}`, { method: "PATCH", body: JSON.stringify(fields) });
}

export async function deleteMedia(id: number) {
  return call(`/api/admin/media/${id}`, { method: "DELETE" });
}

/** Après un envoi réussi (fait par le navigateur), rafraîchit les pages concernées. */
export async function refreshMedia() {
  revalidatePath("/admin/medias");
  revalidatePath("/", "layout");
}
