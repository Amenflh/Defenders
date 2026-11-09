import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../lib/errors.js";
import { requireAdmin, requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { activeProvider } from "./payments.provider.js";
import * as service from "./payments.service.js";

const badRequest = () => new BadRequestError("Requête invalide");
const refSchema = z.string().trim().min(6).max(120).regex(/^[\w-]+$/);
const verifyLimiter = rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Trop de requêtes" } });

/** /api/payments — configuration publique, vérification au retour du paiement, simulation (dev). */
export const paymentsPublicRoutes = Router();

paymentsPublicRoutes.get("/config", async (_req, res) => {
  res.json(await service.paymentConfig());
});

/** Appelé par le site au retour du payeur et par le webhook Konnect : le statut est toujours redemandé au prestataire. */
paymentsPublicRoutes.post("/verify", verifyLimiter, validate({ body: z.object({ ref: refSchema }) }, badRequest), async (req, res) => {
  const { ref } = req.valid.body as { ref: string };
  res.json(await service.verify(ref));
});

/** Mode simulation uniquement (jamais en production, ni quand Konnect est configuré). */
paymentsPublicRoutes.post(
  "/simulation/:ref",
  validate({ params: z.object({ ref: refSchema }), body: z.object({ outcome: z.enum(["paid", "failed"]) }) }, badRequest),
  async (req, res) => {
    if (activeProvider()?.name !== "simulation") throw new NotFoundError();
    const { ref } = req.valid.params as { ref: string };
    const { outcome } = req.valid.body as { outcome: "paid" | "failed" };
    res.json(await service.settle(ref, outcome));
  },
);

/** /api/me/payments — acompte du client connecté. */
export const myPaymentsRoutes = Router();
myPaymentsRoutes.use(requireAuth, (req, _res, next) => {
  if (req.user?.role !== "client") throw new ForbiddenError("Réservé aux comptes clients");
  next();
});
myPaymentsRoutes.get("/", async (req, res) => {
  res.json({ payments: await service.listMine(req.user!.id) });
});
myPaymentsRoutes.post("/", validate({ body: z.object({ registrationId: z.uuid() }) }, badRequest), async (req, res) => {
  const { registrationId } = req.valid.body as { registrationId: string };
  res.status(201).json(await service.startDeposit(req.user!.id, registrationId));
});

/** /api/admin/payments — suivi des paiements. */
export const adminPaymentsRoutes = Router();
adminPaymentsRoutes.use(requireAdmin);
adminPaymentsRoutes.get("/", async (_req, res) => {
  res.json(await service.listForAdmin());
});
