import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { EmailTakenError, bearerToken, createUser, login, logout, openSession, requireAuth, type Session } from "../lib/auth.js";

export const authRouter = Router();

const sessionResponse = (s: Session) => ({ token: s.token, expiresAt: s.expiresAt.toISOString(), user: s.user });

const loginSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(1).max(200),
});

authRouter.post(
  "/login",
  // Anti force brute : 5 tentatives échouées par IP toutes les 15 minutes.
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, skipSuccessfulRequests: true, standardHeaders: "draft-8", legacyHeaders: false }),
  async (req, res, next) => {
    const parsed = loginSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: "E-mail et mot de passe requis" });
      return;
    }
    try {
      const session = await login(parsed.data.email, parsed.data.password);
      if (!session) {
        res.status(401).json({ error: "Identifiants incorrects" });
        return;
      }
      res.json(sessionResponse(session));
    } catch (err) {
      next(err);
    }
  },
);

export const registerSchema = z.object({
  name: z.string({ error: "Le nom est requis" }).trim().min(2, "Le nom doit contenir au moins 2 caractères").max(80),
  email: z.string({ error: "L'e-mail est requis" }).trim().pipe(z.email("Adresse e-mail invalide").max(120)),
  phone: z
    .string({ error: "Le téléphone est requis" })
    .trim()
    .regex(/^\+?[0-9 ().-]{8,20}$/, "Numéro de téléphone invalide"),
  password: z
    .string({ error: "Le mot de passe est requis" })
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(200)
    .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
});

/** Création d'un compte client (les admins sont créés par script ou au démarrage). */
authRouter.post(
  "/register",
  rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false }),
  async (req, res, next) => {
    const parsed = registerSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(422).json({ errors: z.flattenError(parsed.error).fieldErrors });
      return;
    }
    try {
      const user = await createUser({ ...parsed.data, role: "client" });
      res.status(201).json(sessionResponse(await openSession(user)));
    } catch (err) {
      if (err instanceof EmailTakenError) {
        res.status(409).json({ errors: { email: ["Un compte existe déjà avec cet e-mail"] } });
        return;
      }
      next(err);
    }
  },
);

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const token = bearerToken(req.headers.authorization);
    if (token) await logout(token);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
