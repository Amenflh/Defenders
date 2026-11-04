import type { ErrorRequestHandler, RequestHandler } from "express";
import { z } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { HttpError } from "../lib/errors.js";

const isProduction = process.env.NODE_ENV === "production";

/** Route inconnue → 404 au format standard. */
export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Ressource introuvable" });
};

/**
 * Gestion centralisée des erreurs (issue #24).
 * Format de réponse : { error: string, errors?: { champ: [messages] } }.
 * Les détails techniques ne sont jamais renvoyés au client.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // Erreurs métier connues
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, ...(err.fieldErrors ? { errors: err.fieldErrors } : {}) });
    return;
  }

  // Validation Zod non interceptée par le middleware de validation
  if (err instanceof z.ZodError) {
    res.status(422).json({ error: "Données invalides", errors: z.flattenError(err).fieldErrors });
    return;
  }

  // JSON mal formé dans le corps de la requête
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "JSON invalide" });
    return;
  }
  if (err?.type === "entity.too.large") {
    res.status(413).json({ error: "Requête trop volumineuse" });
    return;
  }

  // Erreurs de base de données connues
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Cette ressource existe déjà" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: "Ressource introuvable" });
      return;
    }
  }

  // Erreur inattendue : journalisée côté serveur, message générique côté client
  console.error(`[erreur] ${req.method} ${req.originalUrl}`, isProduction ? (err?.message ?? err) : err);
  res.status(500).json({ error: "Erreur interne du serveur" });
};
