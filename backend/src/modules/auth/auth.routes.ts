import { Router } from "express";
import { BadRequestError } from "../../lib/errors.js";
import { requireAuth } from "../../middlewares/auth.js";
import { loginLimiter, signupLimiter } from "../../middlewares/rateLimits.js";
import { validate } from "../../middlewares/validate.js";
import * as controller from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schemas.js";

/** /api/auth */
export const authRoutes = Router();

// Login : message volontairement générique (ne révèle pas quel champ est faux).
authRoutes.post(
  "/login",
  loginLimiter,
  validate({ body: loginSchema }, () => new BadRequestError("E-mail et mot de passe requis")),
  controller.login,
);
authRoutes.post("/register", signupLimiter, validate({ body: registerSchema }), controller.register);
authRoutes.get("/me", requireAuth, controller.me);
authRoutes.post("/logout", controller.logout);
