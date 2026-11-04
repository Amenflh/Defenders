import type { RequestHandler } from "express";
import type { Role } from "../generated/prisma/client.js";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";
import { findUserByToken, type PublicUser } from "../modules/auth/auth.service.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: PublicUser;
  }
}

export function bearerToken(header: string | undefined): string | null {
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/** Renseigne req.user si un jeton valide est fourni, sans rien exiger. */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  const token = bearerToken(req.headers.authorization);
  if (token) req.user = (await findUserByToken(token)) ?? undefined;
  next();
};

/** Exige une session valide (admin ou client). */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token = bearerToken(req.headers.authorization);
  const user = token ? await findUserByToken(token) : null;
  if (!user) throw new UnauthorizedError();
  req.user = user;
  next();
};

/**
 * Contrôle d'accès par rôle, centralisé (issue #32).
 * 401 sans session valide, 403 si le rôle n'est pas autorisé.
 */
export function requireRole(...roles: Role[]): RequestHandler {
  return async (req, res, next) => {
    await requireAuth(req, res, () => undefined);
    if (!req.user || !roles.includes(req.user.role)) throw new ForbiddenError("Accès réservé aux administrateurs");
    next();
  };
}

export const requireAdmin = requireRole("admin");
