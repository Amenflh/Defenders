import type { ChatSender } from "../../generated/prisma/client.js";
import { NotFoundError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";

/** Nombre maximum de messages renvoyés par requête (historique le plus récent). */
const PAGE = 200;

export type MessageDto = { id: number; sender: ChatSender; body: string; createdAt: Date };

const messageSelect = { id: true, sender: true, body: true, createdAt: true } as const;

/**
 * Messages d'une conversation : les `PAGE` derniers, ou seulement ceux d'id > after
 * (le frontend rafraîchit toutes les quelques secondes en ne demandant que la suite).
 */
async function messagesOf(conversationId: number, after?: number): Promise<MessageDto[]> {
  if (after !== undefined) {
    return prisma.chatMessage.findMany({ where: { conversationId, id: { gt: after } }, orderBy: { id: "asc" }, take: PAGE, select: messageSelect });
  }
  const latest = await prisma.chatMessage.findMany({ where: { conversationId }, orderBy: { id: "desc" }, take: PAGE, select: messageSelect });
  return latest.reverse();
}

const countUnread = (conversationId: number, from: ChatSender, since: Date | null) =>
  prisma.chatMessage.count({ where: { conversationId, sender: from, ...(since ? { createdAt: { gt: since } } : {}) } });

// ---------------------------------------------------------------- Côté client

/** Conversation du client (null s'il n'a encore rien écrit). La lecture marque les réponses comme lues. */
export async function getClientThread(userId: number, after?: number) {
  const conversation = await prisma.conversation.findUnique({ where: { userId } });
  if (!conversation) return { conversationId: null, messages: [], adminReadAt: null };
  const messages = await messagesOf(conversation.id, after);
  await prisma.conversation.update({ where: { id: conversation.id }, data: { clientReadAt: new Date() } });
  return { conversationId: conversation.id, messages, adminReadAt: conversation.adminReadAt };
}

export async function clientUnreadCount(userId: number): Promise<number> {
  const conversation = await prisma.conversation.findUnique({ where: { userId }, select: { id: true, clientReadAt: true } });
  return conversation ? countUnread(conversation.id, "admin", conversation.clientReadAt) : 0;
}

/**
 * Message du client ; crée la conversation au premier message.
 * `notifyTeam` est vrai quand l'équipe n'avait aucun message non lu : c'est le moment de la prévenir par e-mail
 * (un seul e-mail par série de messages, pas un par message).
 */
export async function postClientMessage(userId: number, body: string) {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const conversation = await tx.conversation.upsert({
      where: { userId },
      create: { userId, lastMessageAt: now, clientReadAt: now },
      update: { lastMessageAt: now, clientReadAt: now },
    });
    const pendingBefore = await tx.chatMessage.count({
      where: { conversationId: conversation.id, sender: "client", ...(conversation.adminReadAt ? { createdAt: { gt: conversation.adminReadAt } } : {}) },
    });
    const message = await tx.chatMessage.create({ data: { conversationId: conversation.id, sender: "client", body }, select: messageSelect });
    return { message, conversationId: conversation.id, notifyTeam: pendingBefore === 0 };
  });
}

// ---------------------------------------------------------------- Côté équipe (admin)

/** Boîte de réception : conversations les plus récentes d'abord, avec aperçu et nombre de messages non lus. */
export async function listConversations() {
  const conversations = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 200,
    select: {
      id: true,
      lastMessageAt: true,
      adminReadAt: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      messages: { orderBy: { id: "desc" }, take: 1, select: messageSelect },
    },
  });
  const unread = await Promise.all(conversations.map((c) => countUnread(c.id, "client", c.adminReadAt)));
  return conversations.map(({ messages, adminReadAt: _read, ...c }, i) => ({ ...c, lastMessage: messages[0] ?? null, unread: unread[i] }));
}

export async function adminUnreadTotal(): Promise<number> {
  const rows = await prisma.$queryRaw<{ total: bigint }[]>`
    SELECT COUNT(*)::bigint AS total
    FROM chat_messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.sender = 'client' AND (c.admin_read_at IS NULL OR m.created_at > c.admin_read_at)`;
  return Number(rows[0]?.total ?? 0);
}

/** Fil d'une conversation pour l'équipe ; la lecture marque les messages du client comme lus. */
export async function getAdminThread(conversationId: number, after?: number) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, clientReadAt: true, user: { select: { id: true, name: true, email: true, phone: true } } },
  });
  if (!conversation) throw new NotFoundError("Conversation introuvable");
  const messages = await messagesOf(conversationId, after);
  await prisma.conversation.update({ where: { id: conversationId }, data: { adminReadAt: new Date() } });
  return { conversationId, user: conversation.user, messages, clientReadAt: conversation.clientReadAt };
}

export async function postAdminMessage(conversationId: number, authorId: number, body: string) {
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    const exists = await tx.conversation.findUnique({ where: { id: conversationId }, select: { id: true } });
    if (!exists) throw new NotFoundError("Conversation introuvable");
    // Répondre implique d'avoir lu : les messages du client passent en « lus ».
    await tx.conversation.update({ where: { id: conversationId }, data: { lastMessageAt: now, adminReadAt: now } });
    return tx.chatMessage.create({ data: { conversationId, sender: "admin", authorId, body }, select: messageSelect });
  });
}
