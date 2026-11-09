import { z } from "zod";

const formationId = z
  .union([z.literal(""), z.literal("null"), z.null(), z.coerce.number().int().positive()])
  .transform((v) => (typeof v === "number" ? v : null));

/** Champs texte envoyés avec le fichier (multipart : tout arrive en chaîne). */
export const uploadFieldsSchema = z.object({
  title: z.string().trim().max(120, "120 caractères maximum").default(""),
  category: z.string().trim().toLowerCase().max(40, "40 caractères maximum").default(""),
  formationId: formationId.optional().default(null),
});

/** Média déjà hébergé (fichier de /public, /uploads ou URL https) ajouté sans téléversement. */
export const linkMediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => /^\/(?!\/)[\w\-./%]+$/.test(v) || /^https:\/\/\S+$/.test(v), "Chemin (/uploads/…) ou URL https attendu"),
  title: z.string().trim().max(120, "120 caractères maximum").default(""),
  category: z.string().trim().toLowerCase().max(40, "40 caractères maximum").default(""),
  formationId: formationId.optional().default(null),
});

export const updateMediaSchema = z
  .object({
    title: z.string().trim().max(120, "120 caractères maximum"),
    category: z.string().trim().toLowerCase().max(40, "40 caractères maximum"),
    formationId: formationId,
  })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Aucune modification envoyée");

export const listQuerySchema = z.object({
  type: z.enum(["image", "video"]).optional(),
  category: z.string().trim().toLowerCase().max(40).optional(),
  formation: z.string().regex(/^[a-z0-9-]{1,60}$/).optional(),
});

export const idParamsSchema = z.object({ id: z.coerce.number().int().positive() });

export type UploadFields = z.infer<typeof uploadFieldsSchema>;
export type LinkMediaInput = z.infer<typeof linkMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
