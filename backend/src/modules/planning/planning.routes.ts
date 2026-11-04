import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { BadRequestError } from "../../lib/errors.js";
import { validate } from "../../middlewares/validate.js";
import { getPlanning } from "./planning.service.js";

const querySchema = z.object({
  discipline: z.string().regex(/^[a-z0-9-]{1,60}$/).optional(),
});

const list: RequestHandler = async (req, res) => {
  const { discipline } = req.valid.query as z.infer<typeof querySchema>;
  res.json({ sessions: await getPlanning(discipline) });
};

/** /api/planning */
export const planningRoutes = Router();

planningRoutes.get("/", validate({ query: querySchema }, () => new BadRequestError("Paramètre discipline invalide")), list);
