import { Router } from "express";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { requireAdmin, requireAuth } from "../../middlewares/auth.js";
import { chatLimiter } from "../../middlewares/rateLimits.js";
import { validate } from "../../middlewares/validate.js";
import * as controller from "./chat.controller.js";
import { afterQuerySchema, conversationParamsSchema, sendMessageSchema } from "./chat.schemas.js";

const badRequest = () => new BadRequestError("Requête invalide");
const notFound = () => new NotFoundError("Conversation introuvable");

/** /api/me/chat — discussion du client connecté avec l'équipe. */
export const myChatRoutes = Router();
myChatRoutes.use(requireAuth, controller.requireClient);
myChatRoutes.get("/", validate({ query: afterQuerySchema }, badRequest), controller.myThread);
myChatRoutes.get("/unread", controller.myUnread);
myChatRoutes.post("/", chatLimiter, validate({ body: sendMessageSchema }), controller.sendMine);

/** /api/admin/chat — boîte de réception de l'équipe. */
export const adminChatRoutes = Router();
adminChatRoutes.use(requireAdmin);
adminChatRoutes.get("/", controller.inbox);
adminChatRoutes.get("/unread", controller.adminUnread);
adminChatRoutes.get("/:id", validate({ params: conversationParamsSchema, query: afterQuerySchema }, notFound), controller.thread);
adminChatRoutes.post("/:id", validate({ params: conversationParamsSchema }, notFound), validate({ body: sendMessageSchema }), controller.reply);
