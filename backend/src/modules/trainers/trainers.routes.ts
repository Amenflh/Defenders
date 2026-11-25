import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { academySchema, optionalLink } from "../formations/formations.schemas.js";

/** Équipe pédagogique : formateurs présentés sur les pages des académies et des formations. */

const translation = z.object({ title: z.string().trim().max(160), bio: z.string().trim().max(1500) }).partial();

const fields = {
  name: z.string({ error: "Le nom est requis" }).trim().min(2, "2 caractères minimum").max(120),
  title: z.string().trim().max(160),
  bio: z.string().trim().max(1500),
  photoUrl: optionalLink.nullable().transform((v) => v || null),
  /** null : présenté dans les deux académies. */
  academy: academySchema.nullable(),
  position: z.number().int().min(0).max(9999),
  active: z.boolean(),
  translations: z.object({ en: translation, ar: translation }).partial(),
};
const createSchema = z.object(fields).partial().required({ name: true });
const updateSchema = z.object(fields).partial().refine((v) => Object.keys(v).length > 0, "Aucune modification envoyée");
const idParams = z.object({ id: z.coerce.number().int().positive() });
const listQuery = z.object({ academy: academySchema.optional() });

const notFound = () => new NotFoundError("Formateur introuvable");
const badQuery = () => new BadRequestError("Paramètres de recherche invalides");
const select = {
  id: true, name: true, title: true, bio: true, photoUrl: true, academy: true, position: true, active: true, translations: true,
  formations: { select: { formation: { select: { id: true, name: true, slug: true, academy: true, status: true } } } },
} satisfies Prisma.TrainerSelect;
const toDto = ({ formations, ...row }: Prisma.TrainerGetPayload<{ select: typeof select }>) => ({ ...row, formations: formations.map((f) => f.formation) });
const toData = (input: z.infer<typeof updateSchema>) => ({
  ...input,
  ...(input.translations ? { translations: input.translations as Prisma.InputJsonValue } : {}),
});
const orderBy = [{ position: "asc" as const }, { id: "asc" as const }];

// ---------------------------------------------------------------- Public (/api/trainers)

export const publicTrainerRoutes = Router();
publicTrainerRoutes.get("/", validate({ query: listQuery }, badQuery), async (req, res) => {
  const { academy } = req.valid.query as z.infer<typeof listQuery>;
  const rows = await prisma.trainer.findMany({
    where: { active: true, ...(academy ? { OR: [{ academy }, { academy: null }] } : {}) },
    orderBy,
    select: { ...select, formations: { where: { formation: { status: "published" } }, select: select.formations.select } },
  });
  res.json({ trainers: rows.map(toDto) });
});

// ---------------------------------------------------------------- Admin (/api/admin/trainers)

export const adminTrainerRoutes = Router();
adminTrainerRoutes.use(requireAdmin);

adminTrainerRoutes.get("/", async (_req, res) => {
  res.json({ trainers: (await prisma.trainer.findMany({ orderBy, select })).map(toDto) });
});

adminTrainerRoutes.post("/", validate({ body: createSchema }), async (req, res) => {
  const data = toData(req.valid.body as z.infer<typeof updateSchema>) as Prisma.TrainerCreateInput;
  res.status(201).json({ trainer: toDto(await prisma.trainer.create({ data, select })) });
});

adminTrainerRoutes.patch("/:id", validate({ params: idParams }, notFound), validate({ body: updateSchema }), async (req, res) => {
  const { id } = req.valid.params as { id: number };
  if (!(await prisma.trainer.count({ where: { id } }))) throw notFound();
  res.json({ trainer: toDto(await prisma.trainer.update({ where: { id }, data: toData(req.valid.body as z.infer<typeof updateSchema>), select })) });
});

adminTrainerRoutes.delete("/:id", validate({ params: idParams }, notFound), async (req, res) => {
  const { id } = req.valid.params as { id: number };
  if (!(await prisma.trainer.count({ where: { id } }))) throw notFound();
  await prisma.trainer.delete({ where: { id } });
  res.status(204).end();
});
