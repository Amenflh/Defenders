"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { PaymentStatus, RewardState } from "@/lib/program";
import { apiFetch } from "@/lib/session";

async function adminFetch(path: string, init?: RequestInit) {
  const res = await apiFetch(path, init).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  return res;
}

// ---------------------------------------------------------------- Paiements

export type AdminPayment = {
  id: string;
  status: PaymentStatus;
  provider: string;
  providerRef: string | null;
  amountMillimes: number;
  createdAt: string;
  paidAt: string | null;
  registration: { id: string; firstName: string; lastName: string; email: string; phone: string; formations: string[] };
};
export type ProgramSettings = { depositTnd: number; referralRewardTnd: number };

export async function getPaymentsAction(): Promise<{
  payments: AdminPayment[];
  totals: { paidCount: number; paidMillimes: number };
  settings: ProgramSettings;
  mode: "konnect" | "simulation" | null;
} | null> {
  const [list, settings, config] = await Promise.all([
    adminFetch("/api/admin/payments"),
    adminFetch("/api/admin/settings/paiements"),
    adminFetch("/api/payments/config"),
  ]);
  if (!list?.ok) return null;
  const saved = settings?.ok ? ((await settings.json()) as { value: Partial<ProgramSettings> }).value : {};
  const cfg = config?.ok ? ((await config.json()) as { depositTnd: number; mode: "konnect" | "simulation" | null }) : null;
  return {
    ...((await list.json()) as { payments: AdminPayment[]; totals: { paidCount: number; paidMillimes: number } }),
    settings: { depositTnd: cfg?.depositTnd ?? Number(saved.depositTnd ?? 100), referralRewardTnd: Number(saved.referralRewardTnd ?? 50) },
    mode: cfg?.mode ?? null,
  };
}

export async function saveProgramSettingsAction(settings: ProgramSettings): Promise<{ ok: boolean }> {
  const clean = {
    depositTnd: Math.max(0, Math.min(100_000, Number(settings.depositTnd) || 0)),
    referralRewardTnd: Math.max(0, Math.min(100_000, Number(settings.referralRewardTnd) || 0)),
  };
  const res = await adminFetch("/api/admin/settings/paiements", { method: "PUT", body: JSON.stringify(clean) });
  revalidatePath("/mon-espace");
  return { ok: !!res?.ok };
}

// ---------------------------------------------------------------- Parrainage

export type AdminReferral = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  formations: string[];
  reward: RewardState;
  rewardGrantedAt: string | null;
  referrer: { id: number; name: string; email: string; phone: string; referralCode: string | null } | null;
};

export async function getReferralsAction(): Promise<{
  rewardTnd: number;
  referrals: AdminReferral[];
  totals: { referred: number; enrolled: number; due: number; dueTnd: number; referrers: number };
} | null> {
  const res = await adminFetch("/api/admin/referrals");
  return res?.ok ? await res.json() : null;
}

export async function setRewardGrantedAction(registrationId: string, granted: boolean): Promise<{ ok: boolean; reward?: RewardState; error?: string }> {
  const res = await adminFetch(`/api/admin/referrals/${encodeURIComponent(registrationId)}`, { method: "PATCH", body: JSON.stringify({ granted }) });
  if (res?.ok) return { ok: true, reward: ((await res.json()) as { reward: RewardState }).reward };
  const data = (await res?.json().catch(() => null)) as { error?: string } | null;
  return { ok: false, error: data?.error ?? "Action impossible." };
}

// ---------------------------------------------------------------- Ressources

export type AdminResource = {
  id: number;
  title: string;
  description: string;
  kind: "file" | "link";
  formationId: number | null;
  formation: { id: number; name: string; slug: string } | null;
  originalName: string | null;
  mime: string | null;
  size: number | null;
  url: string | null;
  position: number;
  active: boolean;
  createdAt: string;
};

export async function getResourcesAction(): Promise<AdminResource[] | null> {
  const res = await adminFetch("/api/admin/resources");
  return res?.ok ? ((await res.json()) as { resources: AdminResource[] }).resources : null;
}

export async function updateResourceAction(id: number, data: Partial<Pick<AdminResource, "title" | "description" | "formationId" | "active">>): Promise<{ ok: boolean }> {
  const res = await adminFetch(`/api/admin/resources/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  revalidatePath("/mon-espace");
  return { ok: !!res?.ok };
}

export async function deleteResourceAction(id: number): Promise<{ ok: boolean }> {
  const res = await adminFetch(`/api/admin/resources/${id}`, { method: "DELETE" });
  revalidatePath("/mon-espace");
  return { ok: !!res?.ok };
}
