"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/session";

export async function updateStatusAction(id: string, status: string): Promise<{ ok: boolean }> {
  const res = await apiFetch(`/api/admin/contacts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  revalidatePath("/admin");
  return { ok: !!res?.ok };
}

export async function saveSettingsAction(key: string, value: Record<string, unknown>): Promise<{ ok: boolean }> {
  const res = await apiFetch(`/api/admin/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify(value),
  }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/mentions-legales");
  revalidatePath("/politique-de-confidentialite");
  revalidatePath("/cookies");
  revalidatePath("/planning");
  return { ok: !!res?.ok };
}

export async function saveCmsItemAction(input: {
  section: string;
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  linkUrl?: string;
  position?: number;
  active?: boolean;
  id?: number;
}): Promise<{ ok: boolean }> {
  const id = input.id;
  const body = { ...input };
  delete body.id;
  const res = await apiFetch(id ? `/api/admin/cms/${id}` : "/api/admin/cms", {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(body),
  }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: !!res?.ok };
}

export async function deleteCmsItemAction(id: number): Promise<{ ok: boolean }> {
  const res = await apiFetch(`/api/admin/cms/${id}`, { method: "DELETE" }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  if (!res?.ok) return { ok: false };
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveFormationAction(input: Record<string, unknown>, id?: number): Promise<{ ok: boolean; message?: string }> {
  const res = await apiFetch(id ? `/api/admin/formations/${id}` : "/api/admin/formations", {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(input),
  }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  if (!res?.ok) {
    const data = await res?.json().catch(() => null) as { error?: string; errors?: Record<string, string[]> } | null;
    const fieldMessage = Object.values(data?.errors ?? {}).flat().find(Boolean);
    return { ok: false, message: fieldMessage ?? data?.error ?? "La formation n'a pas pu être enregistrée. Vérifiez les champs puis réessayez." };
  }
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteFormationAction(id: number): Promise<{ ok: boolean; message?: string }> {
  const res = await apiFetch(`/api/admin/formations/${id}`, { method: "DELETE" }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  if (res?.status === 409) {
    const data = await res.json() as { error?: string };
    return { ok: false, message: data.error ?? "Impossible de supprimer cette formation." };
  }
  if (!res?.ok) return { ok: false, message: "La formation n'a pas pu être supprimée. Vérifiez les données puis réessayez." };
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveMediaAction(input: Record<string, unknown>, id?: number): Promise<{ ok: boolean }> {
  const res = await apiFetch(id ? `/api/admin/media/${id}` : "/api/admin/media", {
    method: id ? "PATCH" : "POST",
    body: JSON.stringify(input),
  }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: !!res?.ok };
}

export async function deleteMediaAction(id: number): Promise<{ ok: boolean }> {
  const res = await apiFetch(`/api/admin/media/${id}`, { method: "DELETE" }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  if (!res?.ok) return { ok: false };
  revalidatePath("/admin");
  return { ok: true };
}

export async function uploadMediaAction(formData: FormData): Promise<{ ok: boolean; file?: { url: string; type: string } }> {
  const res = await apiFetch("/api/admin/uploads", {
    method: "POST",
    body: formData,
  }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  if (!res?.ok) return { ok: false };
  const data = await res.json() as { file: { url: string; type: string } };
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true, file: data.file };
}
