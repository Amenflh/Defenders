import type { RequestHandler } from "express";
import { discardTemp, type UploadKind } from "./media.files.js";
import { type ListQuery, type UpdateMediaInput, uploadFieldsSchema } from "./media.schemas.js";
import * as service from "./media.service.js";

export function upload(kind: UploadKind): RequestHandler {
  return async (req, res) => {
    try {
      // Les champs texte arrivent avec le fichier (multipart) : validés ici, après multer.
      const fields = uploadFieldsSchema.parse(req.body ?? {});
      const media = await service.upload(kind, req.file!, fields);
      res.status(201).json({ media });
    } finally {
      // Fichier temporaire supprimé dans tous les cas (déjà déplacé si l'envoi a réussi).
      await discardTemp(req.file);
    }
  };
}

export const listPublic: RequestHandler = async (req, res) => {
  res.json({ media: await service.list(req.valid.query as ListQuery, { publicOnly: true }) });
};

export const listAdmin: RequestHandler = async (req, res) => {
  res.json({ media: await service.list(req.valid.query as ListQuery, { publicOnly: false }) });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = req.valid.params as { id: number };
  res.json({ media: await service.update(id, req.valid.body as UpdateMediaInput) });
};

export const remove: RequestHandler = async (req, res) => {
  await service.remove((req.valid.params as { id: number }).id);
  res.status(204).end();
};
