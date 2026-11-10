import { z } from "zod";
import { emailSchema, phoneSchema } from "../auth/auth.schemas.js";

/** « sportif » remplace « reconversion » (sportif avec plus de 2 ans d'expérience). */
export const PROFILES = ["coach-pro", "jeune-diplome", "etudiant", "sportif"] as const;
export const AVAILABILITIES = ["semaine", "week-end", "soir", "intensif"] as const;
export const ATTACHMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const STATUSES = ["nouveau", "contacte", "inscrit", "archive"] as const;

const text = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} est requis` })
    .trim()
    .min(min, `${label} doit contenir au moins ${min} caractères`)
    .max(max, `${label} ne doit pas dépasser ${max} caractères`);

/** Formulaire public d'inscription (POST /api/contact). */
export const createRegistrationSchema = z.object({
  firstName: text(2, 60, "Le prénom"),
  lastName: text(2, 60, "Le nom"),
  email: emailSchema,
  phone: phoneSchema,
  city: z.string().trim().max(80).optional().default(""),
  profile: z.enum([...PROFILES, "demande-info"], { error: "Veuillez choisir votre profil" }),
  /** Slugs des formations souhaitées (leur existence est vérifiée par le service). */
  trainings: z
    .array(z.string().regex(/^[a-z0-9-]{1,60}$/), { error: "Choisissez au moins une formation" })
    .transform((list) => [...new Set(list)]),
  /** La disponibilité n'est plus demandée dans le formulaire : conservée pour les anciennes demandes. */
  availability: z.enum([...AVAILABILITIES, "non-precisee"]).optional().default("non-precisee"),
  message: z.string().trim().max(2000, "Message trop long (2000 caractères max)").optional().default(""),
  consent: z.literal(true, { error: "Vous devez accepter d'être recontacté" }),
  /** Lecture du règlement intérieur confirmée (obligatoire pour une inscription). */
  rulesAccepted: z.boolean().optional().default(false),
  /** Code de parrainage (lien /r/CODE) ; un code inconnu est ignoré sans bloquer la demande. */
  referralCode: z.string().trim().max(16).optional(),
  /** Pièce jointe facultative (CV, diplôme…), transmise par e-mail uniquement, jamais stockée. */
  attachment: z
    .object({
      filename: z.string().trim().min(1).max(180),
      contentType: z.enum(ATTACHMENT_TYPES, { error: "Pièce jointe : PDF, JPG ou PNG uniquement" }),
      // 5 Mo en base64 ≈ 6,7 millions de caractères
      base64: z.string().max(7_000_000, "La pièce jointe ne doit pas dépasser 5 Mo"),
    })
    .optional(),
}).superRefine((input, context) => {
  if (input.profile === "demande-info") {
    if (input.trainings.length > 0) {
      context.addIssue({ code: "custom", path: ["trainings"], message: "Une demande d'information ne doit pas inclure de formation" });
    }
    if (!input.message) {
      context.addIssue({ code: "custom", path: ["message"], message: "Veuillez saisir votre message" });
    }
  } else {
    if (input.trainings.length === 0) {
      context.addIssue({ code: "custom", path: ["trainings"], message: "Choisissez au moins une formation" });
    }
    if (!input.rulesAccepted) {
      context.addIssue({ code: "custom", path: ["rulesAccepted"], message: "Veuillez lire et accepter le règlement intérieur" });
    }
  }
});

export const listQuerySchema = z.object({
  status: z.enum(STATUSES).optional(),
});

export const idParamsSchema = z.object({ id: z.uuid() });
export const updateStatusSchema = z.object({ status: z.enum(STATUSES) });

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
