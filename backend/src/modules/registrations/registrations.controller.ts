import type { RequestHandler } from "express";
import type { z } from "zod";
import type { createRegistrationSchema, idParamsSchema, listQuerySchema, updateStatusSchema } from "./registrations.schemas.js";
import { sendRegistrationEmail } from "../../lib/email.js";
import * as service from "./registrations.service.js";

/** Champ piège anti-spam : un humain ne le remplit jamais → réponse « OK » sans rien enregistrer. */
export const honeypot: RequestHandler = (req, res, next) => {
  if (typeof req.body?.website === "string" && req.body.website.trim() !== "") {
    res.status(202).json({ ok: true });
    return;
  }
  next();
};

export const create: RequestHandler = async (req, res) => {
  const input = req.valid.body as z.infer<typeof createRegistrationSchema>;
  const registration = await service.createRegistration(input, req.user?.role === "client" ? req.user.id : undefined);
  const requestType = registration.profile === "demande-info" ? "demande d'information" : "inscription";
  console.info(`[contact] nouvelle ${requestType} ${registration.id}`);
  // La demande est enregistrée : un échec d'envoi de l'e-mail ne doit pas la faire échouer.
  let emailSent = false;
  try {
    emailSent = await sendRegistrationEmail(registration, input.attachment);
  } catch (err) {
    console.error(`[contact] e-mail non envoyé pour ${registration.id}`, err);
  }
  res.status(201).json({ ok: true, id: registration.id, emailSent });
};

export const listForAdmin: RequestHandler = async (req, res) => {
  const { status } = req.valid.query as z.infer<typeof listQuerySchema>;
  res.json(await service.listRegistrations(status));
};

export const updateStatus: RequestHandler = async (req, res) => {
  const { id } = req.valid.params as z.infer<typeof idParamsSchema>;
  const { status } = req.valid.body as z.infer<typeof updateStatusSchema>;
  res.json({ contact: await service.updateRegistrationStatus(id, status) });
};

export const listMine: RequestHandler = async (req, res) => {
  res.json({ inscriptions: await service.listRegistrationsForUser(req.user!.id) });
};
