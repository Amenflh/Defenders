import { Router } from "express";
import { requireAuth } from "../lib/auth.js";
import { listContactsForUser } from "../lib/contacts.js";

/** Espace personnel : données de l'utilisateur connecté. */
export const meRouter = Router();

meRouter.use(requireAuth);

meRouter.get("/inscriptions", async (req, res, next) => {
  try {
    res.json({ inscriptions: await listContactsForUser(req.user!.id) });
  } catch (err) {
    next(err);
  }
});
