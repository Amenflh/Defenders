import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import { healthRouter } from "./routes/health.js";
import { planningRouter } from "./routes/planning.js";
import { contactRouter } from "./routes/contact.js";
import { authRouter } from "./routes/auth.js";
import { adminRouter } from "./routes/admin.js";
import { meRouter } from "./routes/me.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // Derrière le frontend / un reverse proxy : nécessaire pour que le rate limit voie la bonne IP.
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: "20kb" }));

  app.use("/api/health", healthRouter);
  app.use("/api/planning", planningRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/me", meRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Ressource introuvable" });
  });

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err?.type === "entity.parse.failed") {
      res.status(400).json({ error: "JSON invalide" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  };
  app.use(onError);

  return app;
}
