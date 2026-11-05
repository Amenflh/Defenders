import { Router } from "express";
import { z } from "zod";
import { requireAdmin } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { prisma } from "../../lib/prisma.js";
import { BadRequestError, ConflictError, NotFoundError } from "../../lib/errors.js";

const settingSchema = z.object({ key: z.string().max(80), value: z.record(z.string(), z.unknown()) });
const cmsSchema = z.object({
  section: z.enum(["faq", "testimonials", "partners", "promotions", "legal"]),
  title: z.string().max(200),
  subtitle: z.string().max(300).optional().default(""),
  body: z.string().max(10000).optional().default(""),
  imageUrl: z.string().max(1000).optional().default(""),
  linkUrl: z.string().max(1000).optional().default(""),
  position: z.number().int().min(0).optional().default(0),
  active: z.boolean().optional().default(true),
});
const itemUpdateSchema = cmsSchema.partial().omit({ section: true });
const badRequest = () => new BadRequestError("Requête invalide");
const reservedFormationSlugs = new Set([
  "admin", "contact", "cookies", "football", "login", "mentions-legales", "mon-espace",
  "personal-training", "pilates", "planning", "politique-de-confidentialite", "register",
  "securite", "sitemap.xml", "robots.txt",
]);

export const cmsPublicRoutes = Router();
cmsPublicRoutes.get("/settings/:key", async (req, res) => {
  const setting = await prisma.siteSetting.findUnique({ where: { key: req.params.key } });
  if (!setting) return res.json({ value: {} });
  try { return res.json({ value: JSON.parse(setting.value) }); } catch { return res.json({ value: {} }); }
});

cmsPublicRoutes.get("/items/:section", async (req, res) => {
  const section = Array.isArray(req.params.section) ? req.params.section[0] : req.params.section;
  const items = await prisma.cmsItem.findMany({
    where: { section, active: true },
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  res.json({ items });
});

cmsPublicRoutes.get("/formations", async (_req, res) => {
  res.json({
    formations: await prisma.formation.findMany({
      where: { status: "published" },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    }),
  });
});
cmsPublicRoutes.get("/formations/:slug", async (req, res) => {
  const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
  const formation = await prisma.formation.findFirst({
    where: { slug, status: "published" },
  });
  if (!formation) throw new NotFoundError("Formation introuvable");
  res.json({ formation });
});

cmsPublicRoutes.get("/media", async (_req, res) => {
  res.json({
    media: await prisma.media.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    }),
  });
});

export const cmsAdminRoutes = Router();
cmsAdminRoutes.use(requireAdmin);

cmsAdminRoutes.get("/metrics", async (_req, res) => {
  const [contacts, clients, formations, media, cmsItems] = await Promise.all([
    prisma.registration.count(),
    prisma.user.count({ where: { role: "client" } }),
    prisma.formation.count(),
    prisma.media.count(),
    prisma.cmsItem.count(),
  ]);
  res.json({
    contacts,
    clients,
    formations,
    media,
    cmsItems,
    status: {
      nouveau: await prisma.registration.count({ where: { status: "nouveau" } }),
      contacte: await prisma.registration.count({ where: { status: "contacte" } }),
      inscrit: await prisma.registration.count({ where: { status: "inscrit" } }),
      archive: await prisma.registration.count({ where: { status: "archive" } }),
    },
  });
});

cmsAdminRoutes.get("/settings/:key", async (req, res) => {
  const setting = await prisma.siteSetting.findUnique({ where: { key: req.params.key } });
  if (!setting) return res.json({ value: {} });
  try { return res.json({ value: JSON.parse(setting.value) }); } catch { return res.json({ value: {} }); }
});

cmsAdminRoutes.put("/settings/:key", validate({ params: z.object({ key: z.string().max(80) }), body: z.record(z.string(), z.unknown()) }, badRequest), async (req, res) => {
  const keyParam = req.params.key;
  const key = Array.isArray(keyParam) ? keyParam[0] : keyParam;
  const body = req.valid.body as Record<string, unknown>;
  const setting = await prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: JSON.stringify(body) },
    update: { value: JSON.stringify(body) },
  });
  res.json({ value: JSON.parse(setting.value) });
});

cmsAdminRoutes.get("/cms/:section", async (req, res) => {
  const section = Array.isArray(req.params.section) ? req.params.section[0] : req.params.section;
  const items = await prisma.cmsItem.findMany({
    where: section === "all" ? {} : { section },
    orderBy: [{ position: "asc" }, { id: "asc" }],
  });
  res.json({ items });
});

cmsAdminRoutes.post("/cms", validate({ body: cmsSchema }, badRequest), async (req, res) => {
  const data = req.valid.body as z.infer<typeof cmsSchema>;
  res.status(201).json({ item: await prisma.cmsItem.create({ data }) });
});

cmsAdminRoutes.patch("/cms/:id", validate({ params: z.object({ id: z.coerce.number().int().positive() }), body: itemUpdateSchema }, badRequest), async (req, res) => {
  const id = Number(req.params.id);
  if (!await prisma.cmsItem.count({ where: { id } })) throw new NotFoundError("Contenu introuvable");
  const data = req.valid.body as z.infer<typeof itemUpdateSchema>;
  res.json({ item: await prisma.cmsItem.update({ where: { id }, data }) });
});

cmsAdminRoutes.delete("/cms/:id", validate({ params: z.object({ id: z.coerce.number().int().positive() }) }, badRequest), async (req, res) => {
  const id = Number(req.params.id);
  if (!await prisma.cmsItem.count({ where: { id } })) throw new NotFoundError("Contenu introuvable");
  await prisma.cmsItem.delete({ where: { id } });
  res.status(204).end();
});

cmsAdminRoutes.get("/formations", async (_req, res) => {
  res.json({ formations: await prisma.formation.findMany({ orderBy: [{ position: "asc" }, { id: "asc" }] }) });
});

const formationSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(60).refine(
    (slug) => !reservedFormationSlugs.has(slug),
    "Cette URL est déjà réservée par le site",
  ),
  name: z.string().min(2).max(150),
  headline: z.string().max(300).optional().default(""),
  summary: z.string().max(5000).optional().default(""),
  intro: z.array(z.string().max(3000)).optional().default([]),
  facts: z.array(z.object({ label: z.string().max(100), value: z.string().max(300) })).optional().default([]),
  objectives: z.array(z.string().max(500)).optional().default([]),
  modules: z.array(z.object({ title: z.string().max(150), text: z.string().max(1000) })).optional().default([]),
  audience: z.array(z.string().max(500)).optional().default([]),
  careers: z.array(z.string().max(500)).optional().default([]),
  coverUrl: z.string().max(1000).optional().default(""),
  galleryUrls: z.array(z.string().max(1000)).optional().default([]),
  accent: z.enum(["gold", "pilates", "football", "personal"]).optional().default("gold"),
  durationLabel: z.string().max(100).optional().nullable(),
  priceTnd: z.number().min(0).max(1000000).optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional().default("published"),
  position: z.number().int().min(0).optional().default(0),
});
const formationUpdateSchema = formationSchema.partial();

cmsAdminRoutes.post("/formations", validate({ body: formationSchema }), async (req, res) => {
  const data = req.valid.body as z.infer<typeof formationSchema>;
  res.status(201).json({ formation: await prisma.formation.create({ data }) });
});
cmsAdminRoutes.patch("/formations/:id", validate({ params: z.object({ id: z.coerce.number().int().positive() }), body: formationUpdateSchema }), async (req, res) => {
  const id = Number(req.params.id);
  if (!await prisma.formation.count({ where: { id } })) throw new NotFoundError("Formation introuvable");
  const data = req.valid.body as z.infer<typeof formationUpdateSchema>;
  res.json({ formation: await prisma.formation.update({ where: { id }, data }) });
});
cmsAdminRoutes.delete("/formations/:id", validate({ params: z.object({ id: z.coerce.number().int().positive() }) }, badRequest), async (req, res) => {
  const id = Number(req.params.id);
  if (!await prisma.formation.count({ where: { id } })) throw new NotFoundError("Formation introuvable");
  const [registrationCount, sessionCount] = await Promise.all([
    prisma.registrationFormation.count({ where: { formationId: id } }),
    prisma.trainingSession.count({ where: { formationId: id } }),
  ]);
  if (registrationCount || sessionCount) {
    throw new ConflictError("Cette formation est liée à des inscriptions ou à des sessions du planning. Archivez-la pour préserver l'historique.");
  }
  await prisma.formation.delete({ where: { id } });
  res.status(204).end();
});

cmsAdminRoutes.get("/media", async (_req, res) => {
  res.json({ media: await prisma.media.findMany({ orderBy: [{ createdAt: "desc" }, { id: "desc" }] }) });
});
const mediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().url().or(z.string().regex(/^\/[^\s]+$/)),
  title: z.string().max(200).optional().default(""),
  category: z.string().max(100).optional().default(""),
  formationId: z.number().int().positive().optional().nullable(),
});
const mediaUpdateSchema = mediaSchema.partial();
cmsAdminRoutes.post("/media", validate({ body: mediaSchema }, badRequest), async (req, res) => {
  const data = req.valid.body as z.infer<typeof mediaSchema>;
  res.status(201).json({ media: await prisma.media.create({ data }) });
});
cmsAdminRoutes.patch("/media/:id", validate({ params: z.object({ id: z.coerce.number().int().positive() }), body: mediaUpdateSchema }, badRequest), async (req, res) => {
  const id = Number(req.params.id);
  if (!await prisma.media.count({ where: { id } })) throw new NotFoundError("Média introuvable");
  const data = req.valid.body as z.infer<typeof mediaUpdateSchema>;
  res.json({ media: await prisma.media.update({ where: { id }, data }) });
});
cmsAdminRoutes.delete("/media/:id", validate({ params: z.object({ id: z.coerce.number().int().positive() }) }, badRequest), async (req, res) => {
  const id = Number(req.params.id);
  if (!await prisma.media.count({ where: { id } })) throw new NotFoundError("Média introuvable");
  await prisma.media.delete({ where: { id } });
  res.status(204).end();
});
