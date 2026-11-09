import { z } from "zod";

export const MAX_MESSAGE_LENGTH = 2000;

export const sendMessageSchema = z.object({
  body: z
    .string({ error: "Le message est requis" })
    .trim()
    .min(1, "Le message est vide")
    .max(MAX_MESSAGE_LENGTH, `Message trop long (${MAX_MESSAGE_LENGTH} caractères max)`),
});

/** ?after=<id> : ne renvoie que les messages plus récents (rafraîchissement périodique). */
export const afterQuerySchema = z.object({
  after: z.coerce.number().int().min(0).optional(),
});

export const conversationParamsSchema = z.object({ id: z.coerce.number().int().positive() });

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
