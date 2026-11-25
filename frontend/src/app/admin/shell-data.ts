import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { apiFetch } from "@/lib/session";
import type { SecurityQuote } from "./SecurityQuotesManager";

export type AdminContact = {
  id: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  profile: string;
  trainings: string[];
  availability: string;
  message: string;
  status: string;
};

/** Lecture admin partagée entre le cadre (compteurs, notifications) et le tableau de bord : un seul appel par requête. */
async function get<T>(path: string): Promise<T | null> {
  const res = await apiFetch(path).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  return res?.ok ? ((await res.json()) as T) : null;
}

export const getContactRequests = cache(async () => (await get<{ contacts: AdminContact[] }>("/api/admin/contacts"))?.contacts ?? []);
/** null : devis impossibles à charger. */
export const getSecurityQuotes = cache(async () => (await get<{ quotes: SecurityQuote[] }>("/api/admin/security-quotes"))?.quotes ?? null);
export const getAdminUnread = cache(async () => (await get<{ unread: number }>("/api/admin/chat/unread"))?.unread ?? 0);
export const getAdminSettings = cache(async () => (await get<{ value: Record<string, unknown> }>("/api/admin/settings/site"))?.value ?? {});
