import { Router } from "express";
import { BadRequestError } from "../../lib/errors.js";
import { optionalAuth, requireAdmin, requireAuth } from "../../middlewares/auth.js";
import { registrationLimiter } from "../../middlewares/rateLimits.js";
import { validate } from "../../middlewares/validate.js";
import * as controller from "./registrations.controller.js";
import { createRegistrationSchema, idParamsSchema, listQuerySchema, updateStatusSchema } from "./registrations.schemas.js";

const badRequest = () => new BadRequestError("Requête invalide");

/** /api/contact — formulaire public (rattaché au compte si un client est connecté). */
export const publicRegistrationRoutes = Router();
publicRegistrationRoutes.post("/", registrationLimiter, controller.honeypot, optionalAuth, validate({ body: createRegistrationSchema }), controller.create);

/** /api/admin/contacts — gestion des demandes (admin uniquement). */
export const adminRegistrationRoutes = Router();
adminRegistrationRoutes.use(requireAdmin);
adminRegistrationRoutes.get("/", validate({ query: listQuerySchema }, badRequest), controller.listForAdmin);
adminRegistrationRoutes.patch("/:id", validate({ params: idParamsSchema, body: updateStatusSchema }, badRequest), controller.updateStatus);

/** /api/me/inscriptions — inscriptions de l'utilisateur connecté. */
export const myRegistrationRoutes = Router();
myRegistrationRoutes.get("/", requireAuth, controller.listMine);
