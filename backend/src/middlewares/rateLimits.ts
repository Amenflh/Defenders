import rateLimit from "express-rate-limit";

const common = { standardHeaders: "draft-8", legacyHeaders: false } as const;
const message = (text: string) => ({ error: text });

/** Formulaire d'inscription : 10 envois / 15 min / IP. */
export const registrationLimiter = rateLimit({ ...common, windowMs: 15 * 60_000, limit: 10, message: message("Trop de demandes envoyées. Réessayez plus tard.") });

/** Connexion : 5 échecs / 15 min / IP (les réussites ne comptent pas). */
export const loginLimiter = rateLimit({ ...common, windowMs: 15 * 60_000, limit: 5, skipSuccessfulRequests: true, message: message("Trop de tentatives. Réessayez dans 15 minutes.") });

/** Création de compte : 10 / heure / IP. */
export const signupLimiter = rateLimit({ ...common, windowMs: 60 * 60_000, limit: 10, message: message("Trop de comptes créés. Réessayez plus tard.") });

/**
 * Connexion : 10 échecs / 15 min par compte (e-mail), quelle que soit l'IP.
 * Complète la limite par IP : changer d'IP (ou falsifier X-Forwarded-For) ne permet plus de deviner un mot de passe.
 */
export const loginAccountLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60_000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `login:${String((req.body as { email?: unknown } | undefined)?.email ?? "").trim().toLowerCase()}`,
  message: message("Trop de tentatives sur ce compte. Réessayez dans 15 minutes."),
});

/** Discussion : 20 messages / minute par compte (placé après requireAuth, donc req.user est connu). */
export const chatLimiter = rateLimit({
  ...common,
  windowMs: 60_000,
  limit: 20,
  keyGenerator: (req) => `chat:${req.user?.id ?? "anonymous"}`,
  message: message("Vous envoyez des messages trop vite. Patientez quelques secondes."),
});
