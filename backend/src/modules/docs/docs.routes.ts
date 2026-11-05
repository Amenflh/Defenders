import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { buildOpenApiDocument } from "./openapi.js";

const document = buildOpenApiDocument();

/**
 * /api/docs — documentation interactive (Swagger UI) et spécification brute (/api/docs/openapi.json).
 * Activée en développement ; en production seulement si API_DOCS=true.
 */
export const docsRoutes = Router();
docsRoutes.get("/openapi.json", (_req, res) => {
  res.json(document);
});
docsRoutes.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(document, {
    customSiteTitle: "API Defenders Fitness Academy",
    swaggerOptions: { persistAuthorization: true, docExpansion: "list", tryItOutEnabled: true },
  }),
);
