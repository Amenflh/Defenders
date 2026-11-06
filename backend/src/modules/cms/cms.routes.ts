import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { prisma } from "../../lib/prisma.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";

/**
 * Contenus éditables du site (réglages, FAQ, témoignages, partenaires, promotions).
 * Les formations et les médias ont leurs propres modules (/api/formations, /api/media).
 */

/** Lien ou image : vide, chemin interne (/…), https/http, mailto: ou tel:. Jamais javascript:, data:… */
export const safeUrl = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (v) => v === "" || /^\/(?!\/)\S*$/.test(v) || /^https?:\/\/\S+$/i.test(v) || /^(mailto|tel):\S+$/i.test(v),
    "Lien invalide : utilisez un chemin (/…), une adresse https://, mailto: ou tel:",
  );

const cmsSchema = z.object({
  section: z.enum(["faq", "testimonials", "partners", "promotions", "legal"]),
  title: z.string().max(200),
  subtitle: z.string().max(300).optional().default(""),
  body: z.string().max(10000).optional().default(""),
  imageUrl: safeUrl.optional().default(""),
  linkUrl: safeUrl.optional().default(""),
  position: z.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
});
const itemUpdateSchema = cmsSchema.partial().omit({ section: true });
const idParams = z.object({ id: z.coerce.number().int().positive() });
const settingKey = z.string().regex(/^[a-z0-9_-]{1,80}$/i);
const badRequest = () => new BadRequestError("Requête invalide");

function parseSetting(value: string | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// ---------------------------------------------------------------- Public (/api/content)

export const cmsPublicRoutes = Router();

cmsPublicRoutes.get("/settings/:key", validate({ params: z.object({ key: settingKey }) }, badRequest), async (req, res) => {
  const { key } = req.valid.params as { key: string };
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  res.json({ value: parseSetting(setting?.value) });
});

cmsPublicRoutes.get("/items/:section", async (req, res) => {
  const section = String(req.params.section);
  const items = await prisma.cmsItem.findMany({
    where: { section, active: true },
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  res.json({ items });
});

// ---------------------------------------------------------------- Admin (/api/admin)

export const cmsAdminRoutes = Router();
cmsAdminRoutes.use(requireAdmin);

cmsAdminRoutes.get("/metrics", async (_req, res) => {
  const [contacts, clients, formations, media, cmsItems, byStatus] = await Promise.all([
    prisma.registration.count(),
    prisma.user.count({ where: { role: "client" } }),
    prisma.formation.count(),
    prisma.media.count(),
    prisma.cmsItem.count(),
    prisma.registration.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const status = { nouveau: 0, contacte: 0, inscrit: 0, archive: 0 } as Record<string, number>;
  for (const g of byStatus) status[g.status] = g._count._all;
  res.json({ contacts, clients, formations, media, cmsItems, status });
});

cmsAdminRoutes.get("/settings/:key", validate({ params: z.object({ key: settingKey }) }, badRequest), async (req, res) => {
  const { key } = req.valid.params as { key: string };
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  res.json({ value: parseSetting(setting?.value) });
});

cmsAdminRoutes.put("/settings/:key", validate({ params: z.object({ key: settingKey }), body: z.record(z.string(), z.unknown()) }, badRequest), async (req, res) => {
  const { key } = req.valid.params as { key: string };
  const value = JSON.stringify(req.valid.body);
  const setting = await prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
  res.json({ value: parseSetting(setting.value) });
});

cmsAdminRoutes.get("/cms/:section", async (req, res) => {
  const section = String(req.params.section);
  const items = await prisma.cmsItem.findMany({
    where: section === "all" ? {} : { section },
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  res.json({ items });
});

cmsAdminRoutes.post("/cms", validate({ body: cmsSchema }), async (req, res) => {
  const data = req.valid.body as z.infer<typeof cmsSchema>;
  res.status(201).json({ item: await prisma.cmsItem.create({ data }) });
});

cmsAdminRoutes.patch("/cms/:id", validate({ params: idParams, body: itemUpdateSchema }), async (req, res) => {
  const { id } = req.valid.params as { id: number };
  if (!(await prisma.cmsItem.count({ where: { id } }))) throw new NotFoundError("Contenu introuvable");
  const data = req.valid.body as z.infer<typeof itemUpdateSchema>;
  res.json({ item: await prisma.cmsItem.update({ where: { id }, data }) });
});

cmsAdminRoutes.delete("/cms/:id", validate({ params: idParams }, badRequest), async (req, res) => {
  const { id } = req.valid.params as { id: number };
  if (!(await prisma.cmsItem.count({ where: { id } }))) throw new NotFoundError("Contenu introuvable");
  await prisma.cmsItem.delete({ where: { id } });
  res.status(204).end();
});
