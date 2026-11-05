import { Router } from "express";
import { NotFoundError } from "../../lib/errors.js";
import { requireAdmin } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as controller from "./formations.controller.js";
import { adminListQuerySchema, createFormationSchema, idParamsSchema, slugParamsSchema, updateFormationSchema } from "./formations.schemas.js";

const notFound = () => new NotFoundError("Formation introuvable");

/** /api/formations — lecture publique des formations publiées. */
export const publicFormationRoutes = Router();
publicFormationRoutes.get("/", controller.listPublished);
publicFormationRoutes.get("/:slug", validate({ params: slugParamsSchema }, notFound), controller.getPublished);

/** /api/admin/formations — gestion complète (admin uniquement). */
export const adminFormationRoutes = Router();
adminFormationRoutes.use(requireAdmin);
adminFormationRoutes.get("/", validate({ query: adminListQuerySchema }), controller.listAll);
adminFormationRoutes.post("/", validate({ body: createFormationSchema }), controller.create);
adminFormationRoutes.get("/:id", validate({ params: idParamsSchema }, notFound), controller.getOne);
adminFormationRoutes.patch("/:id", validate({ params: idParamsSchema }, notFound), validate({ body: updateFormationSchema }), controller.update);
adminFormationRoutes.delete("/:id", validate({ params: idParamsSchema }, notFound), controller.remove);
