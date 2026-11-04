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
