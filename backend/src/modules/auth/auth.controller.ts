import type { RequestHandler } from "express";
import { UnauthorizedError } from "../../lib/errors.js";
import { bearerToken } from "../../middlewares/auth.js";
import type { LoginInput, RegisterInput } from "./auth.schemas.js";
import * as auth from "./auth.service.js";

const toResponse = (s: auth.Session) => ({ token: s.token, expiresAt: s.expiresAt.toISOString(), user: s.user });

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.valid.body as LoginInput;
  const session = await auth.login(email, password);
  if (!session) throw new UnauthorizedError("Identifiants incorrects");
  res.json(toResponse(session));
};

export const register: RequestHandler = async (req, res) => {
  const user = await auth.registerClient(req.valid.body as RegisterInput);
  res.status(201).json(toResponse(await auth.openSession(user)));
};

export const me: RequestHandler = (req, res) => {
  res.json({ user: req.user });
};

export const logout: RequestHandler = async (req, res) => {
  const token = bearerToken(req.headers.authorization);
  if (token) await auth.logout(token);
  res.status(204).end();
};
