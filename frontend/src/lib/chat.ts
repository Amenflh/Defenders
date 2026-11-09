/** Types partagés de la discussion client ↔ équipe (réponses de /api/me/chat et /api/admin/chat). */

export type ChatSender = "client" | "admin";
export type ChatMessage = { id: number; sender: ChatSender; body: string; createdAt: string };

/** Résultat d'un chargement de fil : `readAt` = dernière lecture par l'autre côté (pour l'indicateur « Lu »). */
export type ThreadResult = { ok: true; messages: ChatMessage[]; readAt: string | null } | { ok: false };
export type SendResult = { ok: true; message: ChatMessage } | { ok: false; error: string };

export type ChatContact = { id: number; name: string; email: string; phone: string };
export type ConversationSummary = {
  id: number;
  lastMessageAt: string;
  user: ChatContact;
  lastMessage: ChatMessage | null;
  unread: number;
};

export const MAX_CHAT_MESSAGE = 2000;
