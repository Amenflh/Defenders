import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { Router, type RequestHandler } from "express";
import multer from "multer";
import { z } from "zod";
import { config } from "../../config.js";
import { BadRequestError, ForbiddenError, HttpError, NotFoundError, ValidationError } from "../../lib/errors.js";
import { requireAdmin, requireAuth } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as service from "./resources.service.js";

const idParams = z.object({ id: z.coerce.number().int().positive() });
const notFound = () => new NotFoundError("Ressource introuvable");

const formationId = z
  .union([z.literal(""), z.coerce.number().int().positive(), z.null()])
  .transform((v) => (v === "" || v === null ? null : v));
const httpsUrl = z.string().trim().max(1000).refine((v) => /^https?:\/\/\S+$/i.test(v), "Lien invalide : adresse http(s):// attendue");

const createSchema = z.object({
  title: z.string().trim().min(2, "Titre trop court").max(160),
  description: z.string().trim().max(1000).optional().default(""),
  formationId: formationId.optional().default(null),
  url: z.union([z.literal(""), httpsUrl]).optional().transform((v) => v || undefined),
});
const updateSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(1000).optional(),
  formationId: formationId.optional(),
  active: z.boolean().optional(),
  position: z.number().int().min(0).max(10_000).optional(),
});

/** Réception d'un support (champ « file », facultatif pour un lien) dans le dossier temporaire privé. */
const receive: RequestHandler = (req, res, next) =>
  multer({
    storage: multer.diskStorage({ destination: service.resourcesTmpDir, filename: (_req, _file, cb) => cb(null, randomUUID()) }),
    limits: { fileSize: config.uploads.maxVideoMb * 1024 * 1024, files: 1, fields: 10, fieldSize: 10_000 },
  }).single("file")(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") return next(new HttpError(413, `Fichier trop volumineux : ${config.uploads.maxVideoMb} Mo maximum`));
      return next(new BadRequestError(`Envoi invalide (${err.code})`));
    }
    next(err);
  });

/** /api/admin/resources — gestion des supports (admin). */
export const adminResourceRoutes = Router();
adminResourceRoutes.use(requireAdmin);
adminResourceRoutes.get("/", async (_req, res) => {
  res.json({ resources: await service.listForAdmin() });
});
adminResourceRoutes.post("/", receive, async (req, res) => {
  try {
    const parsed = createSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      throw new ValidationError(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0] ?? "form"), [i.message]])));
    }
    res.status(201).json({ resource: await service.create(parsed.data, req.file) });
  } finally {
    if (req.file) await rm(req.file.path, { force: true }); // temporaire (déjà déplacé si accepté)
  }
});
adminResourceRoutes.patch("/:id", validate({ params: idParams }, notFound), validate({ body: updateSchema }), async (req, res) => {
  const { id } = req.valid.params as { id: number };
  res.json({ resource: await service.update(id, req.valid.body as z.infer<typeof updateSchema>) });
});
adminResourceRoutes.delete("/:id", validate({ params: idParams }, notFound), async (req, res) => {
  await service.remove((req.valid.params as { id: number }).id);
  res.status(204).end();
});

/** /api/me/resources — supports du stagiaire connecté. */
export const myResourceRoutes = Router();
myResourceRoutes.use(requireAuth, (req, _res, next) => {
  if (req.user?.role !== "client") throw new ForbiddenError("Réservé aux comptes clients");
  next();
});
myResourceRoutes.get("/", async (req, res) => {
  res.json(await service.listForClient(req.user!.id));
});
/** Téléchargement / lecture (gère les requêtes partielles « Range » pour les vidéos). */
myResourceRoutes.get("/:id/file", validate({ params: idParams }, notFound), async (req, res) => {
  const file = await service.fileFor(req.user!.id, (req.valid.params as { id: number }).id);
  res.setHeader("Content-Type", file.mime);
  res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(file.name)}`);
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.sendFile(file.path, { dotfiles: "deny" }, (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: "Fichier introuvable" });
  });
});
