import type { RequestHandler } from "express";
import type { z } from "zod";
import { ForbiddenError } from "../../lib/errors.js";
import type { afterQuerySchema, conversationParamsSchema, sendMessageSchema } from "./chat.schemas.js";
import { notifyTeamOfMessage } from "./chat.emails.js";
import * as service from "./chat.service.js";

type After = z.infer<typeof afterQuerySchema>;
type Params = z.infer<typeof conversationParamsSchema>;
type Body = z.infer<typeof sendMessageSchema>;

/** La discussion « client » est réservée aux comptes clients (l'équipe répond depuis /api/admin/chat). */
export const requireClient: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== "client") throw new ForbiddenError("La discussion est réservée aux comptes clients");
  next();
};

// ---------------------------------------------------------------- Client

export const myThread: RequestHandler = async (req, res) => {
  const { after } = req.valid.query as After;
  res.json(await service.getClientThread(req.user!.id, after));
};

export const myUnread: RequestHandler = async (req, res) => {
  res.json({ unread: await service.clientUnreadCount(req.user!.id) });
};

export const sendMine: RequestHandler = async (req, res) => {
  const { body } = req.valid.body as Body;
  const user = req.user!;
  const { message, notifyTeam } = await service.postClientMessage(user.id, body);
  if (notifyTeam) {
    // En arrière-plan : la réponse n'attend pas le serveur SMTP.
    void notifyTeamOfMessage(user, body).catch((err) => console.error("[chat] e-mail équipe non envoyé", err));
  }
  res.status(201).json({ message });
};

// ---------------------------------------------------------------- Équipe

export const inbox: RequestHandler = async (_req, res) => {
  const [conversations, unread] = await Promise.all([service.listConversations(), service.adminUnreadTotal()]);
  res.json({ conversations, unread });
};

export const adminUnread: RequestHandler = async (_req, res) => {
  res.json({ unread: await service.adminUnreadTotal() });
};

export const thread: RequestHandler = async (req, res) => {
  const { id } = req.valid.params as Params;
  const { after } = req.valid.query as After;
  res.json(await service.getAdminThread(id, after));
};

export const reply: RequestHandler = async (req, res) => {
  const { id } = req.valid.params as Params;
  const { body } = req.valid.body as Body;
  res.status(201).json({ message: await service.postAdminMessage(id, req.user!.id, body) });
};
