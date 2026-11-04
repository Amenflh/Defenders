import { z } from "zod";

export const emailSchema = z.string({ error: "L'e-mail est requis" }).trim().pipe(z.email("Adresse e-mail invalide").max(120));

export const phoneSchema = z
  .string({ error: "Le téléphone est requis" })
  .trim()
  .regex(/^\+?[0-9 ().-]{8,20}$/, "Numéro de téléphone invalide");

/** Règles de mot de passe des comptes clients (issue #31). */
export const passwordSchema = z
  .string({ error: "Le mot de passe est requis" })
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(200)
  .regex(/[A-Za-z]/, "Le mot de passe doit contenir au moins une lettre")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

export const loginSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(1).max(200),
});

export const registerSchema = z.object({
  name: z.string({ error: "Le nom est requis" }).trim().min(2, "Le nom doit contenir au moins 2 caractères").max(80),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
