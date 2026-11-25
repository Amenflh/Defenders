"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/session";
import { formValues, toPayload } from "./payload";

export type FormationFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** Valeurs saisies, renvoyées pour ré-afficher le formulaire après une erreur. */
  values?: Record<string, string>;
  /** Incrémenté à chaque envoi (réinitialise le formulaire avec les bonnes valeurs). */
  attempt: number;
};

export async function saveFormation(id: number | null, prev: FormationFormState, formData: FormData): Promise<FormationFormState> {
  const values = formValues(formData);
  const attempt = prev.attempt + 1;

  let res: Response;
  try {
    res = await apiFetch(id ? `/api/admin/formations/${id}` : "/api/admin/formations", {
      method: id ? "PATCH" : "POST",
      body: JSON.stringify(toPayload(values)),
    });
  } catch {
    return { status: "error", message: "L'API ne répond pas. Réessayez dans un instant.", values, attempt };
  }

  if (res.status === 401) redirect(`/login?next=/admin/formations`);
  const data = (await res.json().catch(() => ({}))) as { formation?: { id: number; slug: string }; error?: string; errors?: FormationFormState["errors"] };

  if (!res.ok) {
    return {
      status: "error",
      message: res.status === 422 || res.status === 409 ? "Merci de corriger les champs indiqués." : (data.error ?? "Enregistrement impossible."),
      errors: data.errors,
      values,
      attempt,
    };
  }

  revalidatePath("/admin/formations");
  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/formations/${data.formation!.id}?cree=1`);
  return { status: "success", message: "Modifications enregistrées. Elles sont visibles immédiatement sur le site.", attempt };
}

/** Publier, repasser en brouillon ou archiver depuis la liste. */
export async function setFormationStatus(id: number, status: "draft" | "published" | "archived") {
  const res = await apiFetch(`/api/admin/formations/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin/formations");
  revalidatePath("/admin/formations");
  revalidatePath("/", "layout");
  return { ok: !!res?.ok };
}

export async function deleteFormation(id: number): Promise<{ ok: boolean; message?: string }> {
  const res = await apiFetch(`/api/admin/formations/${id}`, { method: "DELETE" }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin/formations");
  if (!res) return { ok: false, message: "L'API ne répond pas." };
  if (!res.ok) return { ok: false, message: ((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Suppression impossible." };
  revalidatePath("/admin/formations");
  revalidatePath("/", "layout");
  return { ok: true };
}
