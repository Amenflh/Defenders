import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../../middlewares/auth.js";
import { BadRequestError } from "../../lib/errors.js";

const uploadDir = path.resolve("src/assets/uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, "");
    callback(null, `${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    callback(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype) || /^video\/(mp4|webm)$/.test(file.mimetype));
  },
});

export const uploadRoutes = Router();
uploadRoutes.use(requireAdmin);

uploadRoutes.post("/", upload.single("file"), (req, res) => {
  if (!req.file) throw new BadRequestError("Format non pris en charge ou fichier absent");
  const isVideo = req.file.mimetype.startsWith("video/");
  res.status(201).json({
    file: {
      url: `/uploads/${encodeURIComponent(req.file.filename)}`,
      type: isVideo ? "video" : "image",
      originalName: req.file.originalname,
      size: req.file.size,
    },
  });
});
