import { Router } from "express";
import { z } from "zod";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../lib/errors.js";
import { requireAdmin, requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as service from "./referrals.service.js";

/** /api/referrals/:code — prénom du parrain, pour accueillir l'ami invité. */
export const referralsPublicRoutes = Router();
referralsPublicRoutes.get("/:code", validate({ params: z.object({ code: z.string().regex(/^[A-Za-z0-9]{4,16}$/) }) }, () => new NotFoundError("Lien de parrainage invalide")), async (req, res) => {
  res.json(await service.resolve((req.valid.params as { code: string }).code));
});

/** /api/me/referral — lien, filleuls et bonus du client connecté. */
export const myReferralRoutes = Router();
myReferralRoutes.get("/", requireAuth, async (req, res) => {
  if (req.user?.role !== "client") throw new ForbiddenError("Réservé aux comptes clients");
  res.json(await service.getMine(req.user.id));
});

/** /api/admin/referrals — suivi des parrainages et des bonus. */
export const adminReferralRoutes = Router();
adminReferralRoutes.use(requireAdmin);
adminReferralRoutes.get("/", async (_req, res) => {
  res.json(await service.listForAdmin());
});
adminReferralRoutes.patch(
  "/:registrationId",
  validate({ params: z.object({ registrationId: z.uuid() }), body: z.object({ granted: z.boolean() }) }, () => new BadRequestError("Requête invalide")),
  async (req, res) => {
    const { registrationId } = req.valid.params as { registrationId: string };
    const { granted } = req.valid.body as { granted: boolean };
    res.json(await service.setRewardGranted(registrationId, granted));
  },
);
