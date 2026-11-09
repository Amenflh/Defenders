import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { rename, rm } from "node:fs/promises";
import path from "node:path";
import express, { Router } from "express";
import multer from "multer";
import { HttpError, ValidationError } from "../../lib/errors.js";
import { requireAdmin } from "../../middlewares/auth.js";
import { detectFormat, readHead } from "../media/media.files.js";

/**
 * /api/admin/uploads — envoi rapide d'images et de vidéos depuis le tableau de bord admin (CMS).
 * Sécurité : le type annoncé par le navigateur ne suffit pas. On lit la signature binaire du fichier
 * et l'extension est déduite de son CONTENU (jamais du nom envoyé) : impossible de déposer une page
 * HTML ou un script déguisé en image, qui serait sinon servi tel quel sous /uploads (faille XSS).
 */
export const uploadDir = path.resolve("src/assets/uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const MAX_MB = 25;
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    // Nom temporaire sans extension ; l'extension définitive vient du contenu vérifié.
    filename: (_req, _file, callback) => callback(null, `.tmp-${randomUUID()}`),
  }),
  limits: { fileSize: MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype) || /^video\/(mp4|webm)$/.test(file.mimetype)) callback(null, true);
    else callback(new ValidationError({ file: ["Format non accepté : JPG, PNG, WebP, MP4 ou WebM uniquement"] }));
  },
}).single("file");

export const uploadRoutes = Router();
uploadRoutes.use(requireAdmin);

uploadRoutes.post(
  "/",
  (req, res, next) =>
    upload(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") return next(new HttpError(413, `Fichier trop volumineux : ${MAX_MB} Mo maximum`));
      next(err);
    }),
  async (req, res) => {
    if (!req.file) throw new ValidationError({ file: ["Aucun fichier reçu (champ « file »)"] });
    try {
      const format = detectFormat(await readHead(req.file.path));
      if (!format) throw new ValidationError({ file: ["Le contenu du fichier ne correspond pas à une image ou une vidéo valide"] });

      const filename = `${randomUUID()}.${format.ext}`;
      await rename(req.file.path, path.join(uploadDir, filename));
      res.status(201).json({
        file: { url: `/uploads/${filename}`, type: format.kind, originalName: req.file.originalname, size: req.file.size },
      });
    } finally {
      await rm(req.file.path, { force: true }); // fichier temporaire (déjà déplacé si accepté)
    }
  },
);

/** Sert uniquement les images et vidéos de ce dossier (jamais de fichier temporaire ni d'autre type). */
const servable = /^\/[\w-]+\.(jpg|png|webp|mp4|webm)$/;
const serveStatic = express.static(uploadDir, { index: false, dotfiles: "ignore", immutable: true, maxAge: "365d" });
export const cmsUploadsStatic: express.RequestHandler = (req, res, next) =>
  servable.test(req.path) ? serveStatic(req, res, next) : next();
