import { z } from "zod";
import { emailSchema, phoneSchema } from "../auth/auth.schemas.js";

export const SECURITY_QUOTE_SERVICES = [
  "gardiennage",
  "evenementiel",
  "protection",
  "formation",
  "autre",
] as const;
export const SECURITY_QUOTE_STATUSES = [
  "nouveau",
  "contacte",
  "devis_envoye",
  "gagne",
  "perdu",
  "archive",
] as const;

const text = (min: number, max: number, label: string) =>
  z.string({ error: `${label} est requis` }).trim().min(min, `${label} doit contenir au moins ${min} caractères`).max(max);

export const createSecurityQuoteSchema = z.object({
  firstName: text(2, 60, "Le prénom"),
  lastName: text(2, 60, "Le nom"),
  companyName: z.string().trim().max(120).optional().default(""),
  email: emailSchema,
  phone: phoneSchema,
  city: z.string().trim().max(80).optional().default(""),
  service: z.enum(SECURITY_QUOTE_SERVICES, { error: "Choisissez le domaine de votre demande" }),
  message: text(10, 2000, "La description"),
  consent: z.literal(true, { error: "Vous devez accepter d'être recontacté" }),
  website: z.string().max(200).optional().default(""),
});

export const listSecurityQuotesSchema = z.object({
  status: z.enum(SECURITY_QUOTE_STATUSES).optional(),
});

export const securityQuoteIdSchema = z.object({ id: z.uuid() });
export const updateSecurityQuoteStatusSchema = z.object({
  status: z.enum(SECURITY_QUOTE_STATUSES),
});

export type CreateSecurityQuoteInput = z.infer<typeof createSecurityQuoteSchema>;
