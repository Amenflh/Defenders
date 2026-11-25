import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "../../generated/prisma/client.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { academySchema, optionalLink, videosSchema } from "../formations/formations.schemas.js";

/** Historique des formations (page Historique) : lecture publique, gestion complète dans l'admin. */

const translation = z.object({
  title: z.string().trim().max(200),
  description: z.string().trim().max(3000),
  place: z.string().trim().max(200),
}).partial();

const fields = {
  academy: academySchema,
  activity: z.string().trim().max(60),
  date: z.union([z.literal(""), z.null(), z.iso.date("Date invalide (AAAA-MM-JJ)")]).transform((v) => (v ? new Date(`${v}T00:00:00Z`) : null)),
  status: z.enum(["course", "completed"]),
  title: z.string({ error: "Le titre est requis" }).trim().min(2, "2 caractères minimum").max(200),
  description: z.string().trim().max(3000),
  place: z.string().trim().max(200),
  participants: z.number().int().min(0).max(100_000).nullable(),
  medicalFollowUp: z.boolean(),
  photos: z.array(optionalLink).max(30).transform((list) => list.filter(Boolean)),
  videos: videosSchema,
  sources: z.array(z.object({ url: optionalLink, label: z.string().trim().max(160).default("") })).max(10).transform((list) => list.filter((s) => s.url)),
  translations: z.object({ en: translation, ar: translation }).partial(),
  position: z.number().int().min(0).max(9999),
  active: z.boolean(),
};
const createSchema = z.object(fields).partial().required({ academy: true, title: true });
const updateSchema = z.object(fields).partial().refine((v) => Object.keys(v).length > 0, "Aucune modification envoyée");
const idParams = z.object({ id: z.coerce.number().int().positive() });
const listQuery = z.object({ academy: academySchema.optional() });

const notFound = () => new NotFoundError("Entrée d'historique introuvable");
const badQuery = () => new BadRequestError("Paramètres de recherche invalides");

const toData = (input: z.infer<typeof updateSchema>) => ({
  ...input,
  ...(input.translations ? { translations: input.translations as Prisma.InputJsonValue } : {}),
});
type Row = Prisma.HistoryEntryGetPayload<object>;
const toDto = ({ date, createdAt: _createdAt, updatedAt: _updatedAt, ...row }: Row) => ({ ...row, date: date ? date.toISOString().slice(0, 10) : null });
const orderBy = [{ position: "asc" as const }, { date: { sort: "desc" as const, nulls: "last" as const } }, { id: "asc" as const }];

// ---------------------------------------------------------------- Public (/api/history)

export const publicHistoryRoutes = Router();
publicHistoryRoutes.get("/", validate({ query: listQuery }, badQuery), async (req, res) => {
  const { academy } = req.valid.query as z.infer<typeof listQuery>;
  const rows = await prisma.historyEntry.findMany({ where: { active: true, ...(academy ? { academy } : {}) }, orderBy });
  res.json({ entries: rows.map(toDto) });
});

// ---------------------------------------------------------------- Admin (/api/admin/history)

export const adminHistoryRoutes = Router();
adminHistoryRoutes.use(requireAdmin);

adminHistoryRoutes.get("/", async (_req, res) => {
  res.json({ entries: (await prisma.historyEntry.findMany({ orderBy })).map(toDto) });
});

adminHistoryRoutes.post("/", validate({ body: createSchema }), async (req, res) => {
  const data = toData(req.valid.body as z.infer<typeof updateSchema>) as Prisma.HistoryEntryCreateInput;
  res.status(201).json({ entry: toDto(await prisma.historyEntry.create({ data })) });
});

adminHistoryRoutes.patch("/:id", validate({ params: idParams }, notFound), validate({ body: updateSchema }), async (req, res) => {
  const { id } = req.valid.params as { id: number };
  if (!(await prisma.historyEntry.count({ where: { id } }))) throw notFound();
  res.json({ entry: toDto(await prisma.historyEntry.update({ where: { id }, data: toData(req.valid.body as z.infer<typeof updateSchema>) })) });
});

adminHistoryRoutes.delete("/:id", validate({ params: idParams }, notFound), async (req, res) => {
  const { id } = req.valid.params as { id: number };
  if (!(await prisma.historyEntry.count({ where: { id } }))) throw notFound();
  await prisma.historyEntry.delete({ where: { id } });
  res.status(204).end();
});
