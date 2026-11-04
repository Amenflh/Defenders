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

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // Derrière le frontend / un reverse proxy : nécessaire pour que le rate limit voie la bonne IP.
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: "20kb" }));

  // Routes par module (une responsabilité par dossier : routes → contrôleur → service → Prisma)
  app.use("/api/health", healthRoutes);
  app.use("/api/planning", planningRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/contact", publicRegistrationRoutes);
  app.use("/api/admin/contacts", adminRegistrationRoutes);
  app.use("/api/me/inscriptions", myRegistrationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
