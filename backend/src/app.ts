import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { planningRoutes } from "./modules/planning/planning.routes.js";
import {
  adminRegistrationRoutes,
  myRegistrationRoutes,
  publicRegistrationRoutes,
} from "./modules/registrations/registrations.routes.js";
import { cmsAdminRoutes, cmsPublicRoutes } from "./modules/cms/cms.routes.js";
import { uploadRoutes } from "./modules/uploads/upload.routes.js";
import path from "node:path";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // Derrière le frontend / un reverse proxy : nécessaire pour que le rate limit voie la bonne IP.
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use("/uploads", express.static(path.resolve("src/assets/uploads")));
  // Seul le formulaire d'inscription accepte un corps volumineux (pièce jointe de 5 Mo en base64).
  app.use("/api/contact", express.json({ limit: "7mb" }));
  app.use(express.json({ limit: "20kb" }));

  // Routes par module (une responsabilité par dossier : routes → contrôleur → service → Prisma)
  app.use("/api/health", healthRoutes);
  app.use("/api/planning", planningRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/contact", publicRegistrationRoutes);
  app.use("/api/admin/contacts", adminRegistrationRoutes);
  app.use("/api/me/inscriptions", myRegistrationRoutes);
  app.use("/api/content", cmsPublicRoutes);
  app.use("/api/admin/uploads", uploadRoutes);
  app.use("/api/admin", cmsAdminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
