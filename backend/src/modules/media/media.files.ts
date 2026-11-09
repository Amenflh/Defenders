import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { open, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import type { RequestHandler } from "express";
import multer from "multer";
import { config } from "../../config.js";
import { BadRequestError, HttpError, ValidationError } from "../../lib/errors.js";

export type UploadKind = "image" | "video";

/**
 * Formats acceptés et leur signature binaire (« magic bytes »).
 * Le type annoncé par le navigateur ne suffit pas : on lit le début du fichier.
 * SVG volontairement exclu (peut contenir du JavaScript).
 */
const FORMATS: Record<UploadKind, { mime: string; ext: string; matches: (b: Buffer) => boolean }[]> = {
  image: [
    { mime: "image/jpeg", ext: "jpg", matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    { mime: "image/png", ext: "png", matches: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
    { mime: "image/webp", ext: "webp", matches: (b) => b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP" },
  ],
  video: [
    { mime: "video/mp4", ext: "mp4", matches: (b) => b.toString("latin1", 4, 8) === "ftyp" && b.toString("latin1", 8, 10) !== "qt" },
    { mime: "video/webm", ext: "webm", matches: (b) => b.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3])) },
  ],
};

/** Format réel d'un fichier d'après ses premiers octets (16 suffisent), ou null s'il n'est pas accepté. */
export function detectFormat(head: Buffer, kinds: UploadKind[] = ["image", "video"]) {
  for (const kind of kinds) {
    const format = FORMATS[kind].find((f) => f.matches(head));
    if (format) return { kind, mime: format.mime, ext: format.ext };
  }
  return null;
}

/** Lit les 16 premiers octets d'un fichier. */
export async function readHead(filePath: string): Promise<Buffer> {
  const handle = await open(filePath, "r");
  const head = Buffer.alloc(16);
  try {
    await handle.read(head, 0, 16, 0);
  } finally {
    await handle.close();
  }
  return head;
}

export const ACCEPTED = {
  image: { mimes: FORMATS.image.map((f) => f.mime), label: "JPG, PNG ou WebP", maxMb: () => config.uploads.maxImageMb },
  video: { mimes: FORMATS.video.map((f) => f.mime), label: "MP4 ou WebM", maxMb: () => config.uploads.maxVideoMb },
} as const;

const tmpDir = join(config.uploads.dir, ".tmp");
for (const dir of [tmpDir, join(config.uploads.dir, "images"), join(config.uploads.dir, "videos")]) mkdirSync(dir, { recursive: true });

/** Middleware multer : un seul fichier, champ « file », taille maximale selon le type. */
export function receiveFile(kind: UploadKind): RequestHandler {
  const upload = multer({
    storage: multer.diskStorage({ destination: tmpDir, filename: (_req, _file, cb) => cb(null, randomUUID()) }),
    limits: { fileSize: ACCEPTED[kind].maxMb() * 1024 * 1024, files: 1, fields: 10, fieldSize: 10_000 },
    fileFilter: (_req, file, cb) => {
      if ((ACCEPTED[kind].mimes as readonly string[]).includes(file.mimetype)) cb(null, true);
      else cb(new ValidationError({ file: [`Format non accepté : ${ACCEPTED[kind].label} uniquement`] }));
    },
  }).single("file");

  return (req, res, next) =>
    upload(req, res, (err: unknown) => {
      if (!err) return req.file ? next() : next(new ValidationError({ file: ["Aucun fichier reçu (champ « file »)"] }));
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") return next(new HttpError(413, `Fichier trop volumineux : ${ACCEPTED[kind].maxMb()} Mo maximum`));
        return next(new BadRequestError(`Envoi invalide (${err.code})`));
      }
      next(err);
    });
}

/**
 * Vérifie la signature du fichier reçu puis le range dans uploads/<images|videos>/<uuid>.<ext>.
 * Fichier non conforme → supprimé et erreur 422.
 */
export async function storeFile(kind: UploadKind, file: Express.Multer.File) {
  const handle = await open(file.path, "r");
  const head = Buffer.alloc(16);
  try {
    await handle.read(head, 0, 16, 0);
  } finally {
    await handle.close();
  }

  const format = FORMATS[kind].find((f) => f.matches(head));
  if (!format) {
    await rm(file.path, { force: true });
    throw new ValidationError({ file: [`Le contenu du fichier n'est pas une ${kind === "image" ? "image" : "vidéo"} valide (${ACCEPTED[kind].label})`] });
  }

  const storageKey = `${kind}s/${randomUUID()}.${format.ext}`;
  await rename(file.path, join(config.uploads.dir, storageKey));
  return { storageKey, url: `/uploads/${storageKey}`, mimeType: format.mime, sizeBytes: file.size };
}

/** Supprime un fichier téléversé (silencieux s'il n'existe plus). */
export async function deleteStoredFile(storageKey: string) {
  if (!/^(images|videos)\/[\w-]+\.\w+$/.test(storageKey)) return;
  await rm(join(config.uploads.dir, storageKey), { force: true });
}

/** Nettoie le fichier temporaire si la requête échoue après réception. */
export async function discardTemp(file?: Express.Multer.File) {
  if (file?.path) await rm(file.path, { force: true });
}
