import { z } from "zod";

export const FORMATION_STATUSES = ["draft", "published", "archived"] as const;
export const LEVELS = ["tous_niveaux", "debutant", "intermediaire", "avance"] as const;

export const slugSchema = z
  .string({ error: "L'identifiant d'URL est requis" })
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lettres minuscules, chiffres et tirets uniquement (ex. preparation-physique)")
  .max(60, "60 caractères maximum");

const line = (max: number) => z.string().trim().min(1).max(max, `${max} caractères maximum par ligne`);
/** Liste de lignes de texte (objectifs, prérequis…). Les lignes vides sont ignorées. */
const lines = (maxItems: number, maxLength = 300) =>
  z
    .array(z.string().trim().max(maxLength, `${maxLength} caractères maximum par ligne`))
    .transform((list) => list.filter(Boolean))
    .pipe(z.array(line(maxLength)).max(maxItems, `${maxItems} éléments maximum`));

/** Chemin local (/pics/…, /uploads/…) ou URL https. */
const mediaUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => /^\/(?!\/)[\w\-./%]+$/.test(v) || /^https:\/\/\S+$/.test(v), "Chemin (/uploads/…) ou URL https attendu");

const formationFields = {
  slug: slugSchema,
  name: z.string({ error: "Le nom est requis" }).trim().min(2, "2 caractères minimum").max(80, "80 caractères maximum"),
  headline: z.string().trim().max(160, "160 caractères maximum"),
  summary: z.string().trim().max(600, "600 caractères maximum"),
  durationLabel: z.string().trim().max(60, "60 caractères maximum").nullable(),
  priceTnd: z.number({ error: "Prix invalide" }).nonnegative("Le prix ne peut pas être négatif").max(1_000_000).nullable(),
  status: z.enum(FORMATION_STATUSES, { error: "Statut invalide" }),
  position: z.number().int().min(0).max(9999),
  level: z.enum(LEVELS, { error: "Niveau invalide" }).nullable(),
  intro: lines(6, 1200),
  objectives: lines(20),
  prerequisites: lines(20),
  audience: lines(20),
  careers: lines(20),
  modules: z.array(z.object({ title: line(80), text: z.string().trim().max(400) })).max(30, "30 modules maximum"),
  facts: z.array(z.object({ label: line(40), value: line(60) })).max(6, "6 chiffres clés maximum"),
  coverUrl: mediaUrl.nullable(),
};

const base = z.object(formationFields);

/** Création : seuls le slug et le nom sont obligatoires. Par défaut : brouillon, placé après les autres. */
export const createFormationSchema = base.partial().required({ slug: true, name: true }).transform((v) => ({
  headline: "",
  summary: "",
  durationLabel: null,
  priceTnd: null,
  status: "draft" as const,
  level: null,
  intro: [],
  objectives: [],
  prerequisites: [],
  audience: [],
  careers: [],
  modules: [],
  facts: [],
  coverUrl: null,
  ...v,
}));

/** Mise à jour partielle : seuls les champs envoyés sont modifiés. */
export const updateFormationSchema = base.partial().refine((v) => Object.keys(v).length > 0, "Aucune modification envoyée");

export const idParamsSchema = z.object({ id: z.coerce.number().int().positive() });
export const slugParamsSchema = z.object({ slug: slugSchema });
export const adminListQuerySchema = z.object({ status: z.enum(FORMATION_STATUSES).optional() });

export type CreateFormationInput = z.infer<typeof createFormationSchema>;
export type UpdateFormationInput = z.infer<typeof updateFormationSchema>;
