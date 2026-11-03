import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { DISCIPLINES } from "../data/disciplines.js";
import { saveContact } from "../lib/contactStore.js";

export const PROFILES = ["coach-pro", "jeune-diplome", "etudiant", "reconversion"] as const;
export const AVAILABILITIES = ["semaine", "week-end", "soir", "intensif"] as const;

const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} est requis` })
    .trim()
    .min(min, `${label} doit contenir au moins ${min} caractères`)
    .max(max, `${label} ne doit pas dépasser ${max} caractères`);

export const contactSchema = z.object({
  firstName: text(2, 60, "Le prénom"),
  lastName: text(2, 60, "Le nom"),
  email: z.string({ error: "L'e-mail est requis" }).trim().pipe(z.email("Adresse e-mail invalide").max(120)),
  phone: z
    .string({ error: "Le téléphone est requis" })
    .trim()
    .regex(/^\+?[0-9 ().-]{8,20}$/, "Numéro de téléphone invalide"),
  city: z.string().trim().max(80).optional().default(""),
  profile: z.enum(PROFILES, { error: "Veuillez choisir votre profil" }),
  trainings: z
    .array(z.enum(DISCIPLINES), { error: "Choisissez au moins une formation" })
    .min(1, "Choisissez au moins une formation")
    .transform((list) => [...new Set(list)]),
  availability: z.enum(AVAILABILITIES, { error: "Veuillez choisir une disponibilité" }),
  message: z.string().trim().max(2000, "Message trop long (2000 caractères max)").optional().default(""),
  consent: z.literal(true, { error: "Vous devez accepter d'être recontacté" }),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const contactRouter = Router();

contactRouter.post(
  "/",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false }),
  async (req, res, next) => {
    // Champ piège anti-spam : un humain ne le remplit jamais.
    if (typeof req.body?.website === "string" && req.body.website.trim() !== "") {
      res.status(202).json({ ok: true });
      return;
    }

    const parsed = contactSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(422).json({ ok: false, errors: z.flattenError(parsed.error).fieldErrors });
      return;
    }

    try {
      const saved = await saveContact(parsed.data);
      console.info(`[contact] nouvelle demande ${saved.id} (${saved.trainings.join(", ")})`);
      res.status(201).json({ ok: true, id: saved.id });
    } catch (err) {
      next(err);
    }
  },
);
