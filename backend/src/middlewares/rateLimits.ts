import rateLimit from "express-rate-limit";

const common = { standardHeaders: "draft-8", legacyHeaders: false } as const;
const message = (text: string) => ({ error: text });

/** Formulaire d'inscription : 10 envois / 15 min / IP. */
export const registrationLimiter = rateLimit({ ...common, windowMs: 15 * 60_000, limit: 10, message: message("Trop de demandes envoyées. Réessayez plus tard.") });

/** Connexion : 5 échecs / 15 min / IP (les réussites ne comptent pas). */
export const loginLimiter = rateLimit({ ...common, windowMs: 15 * 60_000, limit: 5, skipSuccessfulRequests: true, message: message("Trop de tentatives. Réessayez dans 15 minutes.") });

/** Création de compte : 10 / heure / IP. */
export const signupLimiter = rateLimit({ ...common, windowMs: 60 * 60_000, limit: 10, message: message("Trop de comptes créés. Réessayez plus tard.") });
