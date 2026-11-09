"use server";

import { redirect } from "next/navigation";
import type { ChatContact, ChatMessage, ConversationSummary, SendResult, ThreadResult } from "@/lib/chat";
import { apiFetch } from "@/lib/session";

async function adminFetch(path: string, init?: RequestInit) {
  const res = await apiFetch(path, init).catch(() => null);
  if (res?.status === 401) redirect("/login?next=/admin");
  return res;
}

export async function listConversationsAction(): Promise<{ conversations: ConversationSummary[]; unread: number } | null> {
  const res = await adminFetch("/api/admin/chat");
  return res?.ok ? ((await res.json()) as { conversations: ConversationSummary[]; unread: number }) : null;
}

export async function getAdminUnreadAction(): Promise<number> {
  const res = await adminFetch("/api/admin/chat/unread");
  return res?.ok ? ((await res.json()) as { unread: number }).unread : 0;
}

export async function getConversationAction(id: number, after?: number): Promise<ThreadResult & { user?: ChatContact }> {
  const res = await adminFetch(`/api/admin/chat/${id}${after ? `?after=${after}` : ""}`);
  if (!res?.ok) return { ok: false };
  const data = (await res.json()) as { messages: ChatMessage[]; clientReadAt: string | null; user: ChatContact };
  return { ok: true, messages: data.messages, readAt: data.clientReadAt, user: data.user };
}

export async function replyAction(id: number, body: string): Promise<SendResult> {
  const res = await adminFetch(`/api/admin/chat/${id}`, { method: "POST", body: JSON.stringify({ body }) });
  if (res?.ok) return { ok: true, message: ((await res.json()) as { message: ChatMessage }).message };
  if (res?.status === 422) return { ok: false, error: "Message vide ou trop long (2000 caractères max)." };
  return { ok: false, error: "Réponse non envoyée. Réessayez." };
}
