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

export async function updateSecurityQuoteStatusAction(id: string, status: string): Promise<{ ok: boolean }> {
  const res = await apiFetch(`/api/admin/security-quotes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }).catch((error: unknown) => {
    console.error("[admin security quote status]", error);
    return null;
  });
  if (res?.status === 401) redirect("/login?next=/admin");
  if (!res?.ok) return { ok: false };
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveSettingsAction(key: string, value: Record<string, unknown>): Promise<{ ok: boolean }> {
  const res = await apiFetch(`/api/admin/settings/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify(value),
  }).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  revalidatePath("/", "layout");
  return { ok: !!res?.ok };
}

export type AdminStats = {
  days: number;
  generatedAt: string;
  kpis: {
    total: { value: number; trend: number | null };
    registrations: { value: number; trend: number | null };
    inquiries: { value: number; trend: number | null };
    enrolled: { value: number; trend: number | null };
    conversionRate: number;
    processingRate: number;
    newClients: { value: number; trend: number | null };
  };
  series: { date: string; registrations: number; inquiries: number }[];
  funnel: { status: string; count: number }[];
  topFormations: { id: number; name: string; slug: string; accent: string; count: number }[];
  profiles: { label: string; count: number }[];
  availabilities: { label: string; count: number }[];
  cities: { label: string; count: number }[];
  followUps: {
    afterHours: number;
    total: number;
    items: { id: string; createdAt: string; firstName: string; lastName: string; phone: string; email: string; profile: string; formations: string[] }[];
  };
};

/** Statistiques du tableau de bord pour la période choisie (7, 30, 90 ou 365 jours). */
export async function getStatsAction(days: number): Promise<AdminStats | null> {
  const res = await apiFetch(`/api/admin/stats?days=${encodeURIComponent(String(days))}`).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  return res?.ok ? ((await res.json()) as AdminStats) : null;
}
