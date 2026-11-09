"use server";

import type { ChatMessage, SendResult, ThreadResult } from "@/lib/chat";
import { apiFetch } from "@/lib/session";

/** Fil du client connecté (seulement les messages d'id > after s'il est fourni). */
export async function getMyThreadAction(after?: number): Promise<ThreadResult> {
  const query = after ? `?after=${after}` : "";
  const res = await apiFetch(`/api/me/chat${query}`).catch(() => null);
  if (!res?.ok) return { ok: false };
  const data = (await res.json()) as { messages: ChatMessage[]; adminReadAt: string | null };
  return { ok: true, messages: data.messages, readAt: data.adminReadAt };
}

export async function sendMyMessageAction(body: string): Promise<SendResult> {
  const res = await apiFetch("/api/me/chat", { method: "POST", body: JSON.stringify({ body }) }).catch(() => null);
  if (res?.ok) return { ok: true, message: ((await res.json()) as { message: ChatMessage }).message };
  if (res?.status === 429) return { ok: false, error: "Vous envoyez des messages trop vite. Patientez quelques secondes." };
  if (res?.status === 401) return { ok: false, error: "Votre session a expiré. Reconnectez-vous." };
  if (res?.status === 422) return { ok: false, error: "Message vide ou trop long (2000 caractères max)." };
  return { ok: false, error: "Message non envoyé. Vérifiez votre connexion et réessayez." };
}

export async function getMyUnreadAction(): Promise<number> {
  const res = await apiFetch("/api/me/chat/unread").catch(() => null);
  return res?.ok ? ((await res.json()) as { unread: number }).unread : 0;
}
