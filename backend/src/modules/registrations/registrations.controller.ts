import type { RequestHandler } from "express";
import type { z } from "zod";
import type { createRegistrationSchema, idParamsSchema, listQuerySchema, updateStatusSchema } from "./registrations.schemas.js";
import { sendRegistrationEmails } from "./registrations.emails.js";
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
  // E-mails envoyés en arrière-plan : la réponse n'attend pas le serveur SMTP,
  // et un échec d'envoi ne fait pas perdre la demande (déjà enregistrée).
  void sendRegistrationEmails(registration, input.attachment).catch((err) =>
    console.error(`[contact] e-mails non envoyés pour ${registration.id}`, err),
  );
  res.status(201).json({ ok: true, id: registration.id });
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
