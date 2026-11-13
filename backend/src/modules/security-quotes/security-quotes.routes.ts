import { Router } from "express";
import { BadRequestError } from "../../lib/errors.js";
import { requireAdmin } from "../../middlewares/auth.js";
import { securityQuoteLimiter } from "../../middlewares/rateLimits.js";
import { validate } from "../../middlewares/validate.js";
import * as controller from "./security-quotes.controller.js";
import {
  createSecurityQuoteSchema,
  listSecurityQuotesSchema,
  securityQuoteIdSchema,
  updateSecurityQuoteStatusSchema,
} from "./security-quotes.schemas.js";

const badRequest = () => new BadRequestError("Requête invalide");

export const publicSecurityQuoteRoutes = Router();
publicSecurityQuoteRoutes.post("/", securityQuoteLimiter, controller.honeypot, validate({ body: createSecurityQuoteSchema }), controller.create);

export const adminSecurityQuoteRoutes = Router();
adminSecurityQuoteRoutes.use(requireAdmin);
adminSecurityQuoteRoutes.get("/", validate({ query: listSecurityQuotesSchema }, badRequest), controller.list);
adminSecurityQuoteRoutes.patch(
  "/:id",
  validate({ params: securityQuoteIdSchema, body: updateSecurityQuoteStatusSchema }, badRequest),
  controller.updateStatus,
);
