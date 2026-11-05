import type { RequestHandler } from "express";
import type { z } from "zod";
import type { adminListQuerySchema, CreateFormationInput, idParamsSchema, slugParamsSchema, UpdateFormationInput } from "./formations.schemas.js";
import * as service from "./formations.service.js";

type IdParams = z.infer<typeof idParamsSchema>;

export const listPublished: RequestHandler = async (_req, res) => {
  res.json({ formations: await service.listPublished() });
};

export const getPublished: RequestHandler = async (req, res) => {
  const { slug } = req.valid.params as z.infer<typeof slugParamsSchema>;
  res.json({ formation: await service.getPublishedBySlug(slug) });
};

export const listAll: RequestHandler = async (req, res) => {
  const { status } = req.valid.query as z.infer<typeof adminListQuerySchema>;
  res.json({ formations: await service.listAll(status) });
};

export const getOne: RequestHandler = async (req, res) => {
  res.json({ formation: await service.getById((req.valid.params as IdParams).id) });
};

export const create: RequestHandler = async (req, res) => {
  const formation = await service.create(req.valid.body as CreateFormationInput);
  res.status(201).location(`/api/admin/formations/${formation.id}`).json({ formation });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = req.valid.params as IdParams;
  res.json({ formation: await service.update(id, req.valid.body as UpdateFormationInput) });
};

export const remove: RequestHandler = async (req, res) => {
  await service.remove((req.valid.params as IdParams).id);
  res.status(204).end();
};
