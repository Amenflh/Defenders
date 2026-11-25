"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/session";

export type FormationFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** Valeurs saisies, renvoyées pour ré-afficher le formulaire après une erreur. */
  values?: Record<string, string>;
  /** Incrémenté à chaque envoi (réinitialise le formulaire avec les bonnes valeurs). */
  attempt: number;
};

const FIELDS = [
  "name", "slug", "headline", "summary", "status", "level", "durationLabel", "priceTnd", "position", "coverUrl", "nextSessionDate",
  "intro", "objectives", "prerequisites", "audience", "careers", "modules", "facts",
  "academy", "accent", "location", "practical", "contactPhone", "sourceUrl", "coverIsPoster", "videos", "galleryUrls", "trainerIds",
] as const;
/** Champs traduits, saisis sous les noms « en.name », « ar.name »… */
const TRANSLATED = ["name", "headline", "summary", "durationLabel", "location", "practical", "intro", "objectives", "prerequisites", "audience", "careers", "modules", "facts"] as const;
const ALL_FIELDS = [...FIELDS, ...TRANSLATED.flatMap((k) => [`en.${k}`, `ar.${k}`])];

/** Une ligne = un élément ; lignes vides ignorées. */
const lines = (v: string) => v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
/** « Titre | texte » sur chaque ligne. */
const pairs = <K extends string, V extends string>(v: string, k: K, val: V) =>
  lines(v).map((l) => {
    const [a, ...rest] = l.split("|");
    return { [k]: a.trim(), [val]: rest.join("|").trim() } as Record<K | V, string>;
  });

/** Introduction : paragraphes séparés par une ligne vide. */
const paragraphs = (v: string) => v.split(/\r?\n\s*\r?\n/).map((p) => p.replace(/\s*\r?\n\s*/g, " ").trim()).filter(Boolean);
/** « lien | titre | format » sur chaque ligne. */
const videoLinks = (v: string) => lines(v).map((l) => {
  const [url, title = "", layout = ""] = l.split("|").map((p) => p.trim());
  return { url, title, layout: ["portrait", "square", "landscape"].includes(layout) ? layout : "portrait" };
});
/** Champs remplis d'une langue ; un champ vide s'affiche en français. */
function translation(v: Record<string, string>, lang: "en" | "ar") {
  const get = (k: string) => v[`${lang}.${k}`] ?? "";
  const entries: [string, unknown][] = [
    ...(["name", "headline", "summary", "durationLabel", "location", "practical"] as const).map((k): [string, unknown] => [k, get(k).trim()]),
    ["intro", paragraphs(get("intro"))],
    ...(["objectives", "prerequisites", "audience", "careers"] as const).map((k): [string, unknown] => [k, lines(get(k))]),
    ["modules", pairs(get("modules"), "title", "text")],
    ["facts", pairs(get("facts"), "label", "value")],
  ];
  return Object.fromEntries(entries.filter(([, value]) => (Array.isArray(value) ? value.length : value)));
}

/** Formulaire → corps JSON attendu par l'API. */
function toPayload(v: Record<string, string>) {
  const price = v.priceTnd.trim().replace(",", ".");
  return {
    name: v.name,
    slug: v.slug,
    headline: v.headline,
    summary: v.summary,
    status: v.status,
    level: v.level || null,
    durationLabel: v.durationLabel.trim() || null,
    priceTnd: price === "" ? null : Number(price),
    position: Number(v.position || 0),
    coverUrl: v.coverUrl || null,
    nextSessionDate: v.nextSessionDate.trim() || null,
    intro: paragraphs(v.intro),
    objectives: lines(v.objectives),
    prerequisites: lines(v.prerequisites),
    audience: lines(v.audience),
    careers: lines(v.careers),
    modules: pairs(v.modules, "title", "text"),
    facts: pairs(v.facts, "label", "value"),
    academy: v.academy === "tsa" ? "tsa" : "fitness",
    accent: v.accent || "gold",
    location: v.location,
    practical: v.practical,
    contactPhone: v.contactPhone,
    sourceUrl: v.sourceUrl,
    coverIsPoster: v.coverIsPoster === "on",
    videos: videoLinks(v.videos),
    galleryUrls: lines(v.galleryUrls),
    trainerIds: v.trainerIds.split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0),
    translations: { en: translation(v, "en"), ar: translation(v, "ar") },
  };
}

export async function saveFormation(id: number | null, prev: FormationFormState, formData: FormData): Promise<FormationFormState> {
  const values = Object.fromEntries(ALL_FIELDS.map((k) => [k, String(formData.get(k) ?? "")])) as Record<string, string>;
  values.trainerIds = formData.getAll("trainerIds").map(String).join(",");
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
