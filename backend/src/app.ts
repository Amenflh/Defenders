import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { adminFormationRoutes, publicFormationRoutes } from "./modules/formations/formations.routes.js";
import { adminMediaRoutes, publicMediaRoutes, uploadsStatic } from "./modules/media/media.routes.js";
import { docsRoutes } from "./modules/docs/docs.routes.js";
import { planningRoutes } from "./modules/planning/planning.routes.js";
import {
  adminRegistrationRoutes,
  myRegistrationRoutes,
  publicRegistrationRoutes,
} from "./modules/registrations/registrations.routes.js";
import { cmsAdminRoutes, cmsPublicRoutes } from "./modules/cms/cms.routes.js";
import { cmsUploadsStatic, uploadRoutes } from "./modules/uploads/upload.routes.js";
import { adminChatRoutes, myChatRoutes } from "./modules/chat/chat.routes.js";
import { adminPaymentsRoutes, myPaymentsRoutes, paymentsPublicRoutes } from "./modules/payments/payments.routes.js";
import { adminReferralRoutes, myReferralRoutes, referralsPublicRoutes } from "./modules/referrals/referrals.routes.js";
import { adminResourceRoutes, myResourceRoutes } from "./modules/resources/resources.routes.js";
import { adminSecurityQuoteRoutes, publicSecurityQuoteRoutes } from "./modules/security-quotes/security-quotes.routes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  // Derrière le frontend / un reverse proxy : nécessaire pour que le rate limit voie la bonne IP.
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  // Fichiers du tableau de bord (CMS) : seulement images et vidéos vérifiées.
  app.use("/uploads", cmsUploadsStatic);
  // Seul le formulaire d'inscription accepte un corps volumineux (pièce jointe de 5 Mo en base64).
  app.use("/api/contact", express.json({ limit: "7mb" }));
  app.use(express.json({ limit: "20kb" }));

  // Routes par module (une responsabilité par dossier : routes → contrôleur → service → Prisma)
  app.use("/api/health", healthRoutes);
  app.use("/api/planning", planningRoutes);
  app.use("/api/formations", publicFormationRoutes);
  app.use("/api/admin/formations", adminFormationRoutes);
  app.use("/api/media", publicMediaRoutes);
  app.use("/api/admin/media", adminMediaRoutes);
  app.use("/uploads", uploadsStatic);
  if (config.apiDocs) app.use("/api/docs", docsRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/contact", publicRegistrationRoutes);
  app.use("/api/admin/contacts", adminRegistrationRoutes);
  app.use("/api/security-quotes", publicSecurityQuoteRoutes);
  app.use("/api/admin/security-quotes", adminSecurityQuoteRoutes);
  app.use("/api/me/inscriptions", myRegistrationRoutes);
  app.use("/api/me/chat", myChatRoutes);
  app.use("/api/admin/chat", adminChatRoutes);
  app.use("/api/payments", paymentsPublicRoutes);
  app.use("/api/me/payments", myPaymentsRoutes);
  app.use("/api/admin/payments", adminPaymentsRoutes);
  app.use("/api/referrals", referralsPublicRoutes);
  app.use("/api/me/referral", myReferralRoutes);
  app.use("/api/admin/referrals", adminReferralRoutes);
  app.use("/api/me/resources", myResourceRoutes);
  app.use("/api/admin/resources", adminResourceRoutes);
  app.use("/api/content", cmsPublicRoutes);
  app.use("/api/admin/uploads", uploadRoutes);
  app.use("/api/admin", cmsAdminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
