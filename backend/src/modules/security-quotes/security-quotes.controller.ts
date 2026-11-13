import type { RequestHandler } from "express";
import type { z } from "zod";
import type {
  createSecurityQuoteSchema,
  listSecurityQuotesSchema,
  securityQuoteIdSchema,
  updateSecurityQuoteStatusSchema,
} from "./security-quotes.schemas.js";
import { sendSecurityQuoteEmails } from "./security-quotes.emails.js";
import * as service from "./security-quotes.service.js";

export const honeypot: RequestHandler = (req, res, next) => {
  if (typeof req.body?.website === "string" && req.body.website.trim() !== "") {
    res.status(202).json({ ok: false });
    return;
  }
  next();
};

export const create: RequestHandler = async (req, res) => {
  const quote = await service.createSecurityQuote(req.valid.body as z.infer<typeof createSecurityQuoteSchema>);
  console.info(`[security-quotes] nouvelle demande ${quote.id}`);
  void sendSecurityQuoteEmails(quote).catch((err) =>
    console.error(`[security-quotes] e-mails non envoyés pour ${quote.id}`, err),
  );
  res.status(201).json({ ok: true, id: quote.id });
};

export const list: RequestHandler = async (req, res) => {
  const { status } = req.valid.query as z.infer<typeof listSecurityQuotesSchema>;
  res.json({ quotes: await service.listSecurityQuotes(status) });
};

export const updateStatus: RequestHandler = async (req, res) => {
  const { id } = req.valid.params as z.infer<typeof securityQuoteIdSchema>;
  const { status } = req.valid.body as z.infer<typeof updateSecurityQuoteStatusSchema>;
  res.json({ quote: await service.updateSecurityQuoteStatus(id, status) });
};
