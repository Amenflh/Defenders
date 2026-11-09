import express, { Router } from "express";
import { config } from "../../config.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { requireAdmin } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as controller from "./media.controller.js";
import { receiveFile } from "./media.files.js";
import { idParamsSchema, linkMediaSchema, listQuerySchema, updateMediaSchema } from "./media.schemas.js";

const badQuery = () => new BadRequestError("Paramètres de recherche invalides");
const notFound = () => new NotFoundError("Média introuvable");

/** /api/media — galerie publique. */
export const publicMediaRoutes = Router();
publicMediaRoutes.get("/", validate({ query: listQuerySchema }, badQuery), controller.listPublic);

/** /api/admin/media — téléversement et gestion (admin uniquement). */
export const adminMediaRoutes = Router();
adminMediaRoutes.use(requireAdmin);
adminMediaRoutes.get("/", validate({ query: listQuerySchema }, badQuery), controller.listAdmin);
adminMediaRoutes.post("/", validate({ body: linkMediaSchema }), controller.link);
adminMediaRoutes.post("/images", receiveFile("image"), controller.upload("image"));
adminMediaRoutes.post("/videos", receiveFile("video"), controller.upload("video"));
adminMediaRoutes.patch("/:id", validate({ params: idParamsSchema }, notFound), validate({ body: updateMediaSchema }), controller.update);
adminMediaRoutes.delete("/:id", validate({ params: idParamsSchema }, notFound), controller.remove);

/**
 * /uploads — fichiers téléversés. Noms aléatoires et définitifs : cache long.
 * Les vidéos supportent les requêtes partielles (Range) pour la lecture et l'avance rapide.
 */
export const uploadsStatic = express.static(config.uploads.dir, {
  index: false,
  dotfiles: "ignore",
  immutable: true,
  maxAge: "365d",
  setHeaders: (res) => res.setHeader("Content-Disposition", "inline"),
});
