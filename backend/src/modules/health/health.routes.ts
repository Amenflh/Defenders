import { Router } from "express";
import { checkDatabase } from "../../lib/prisma.js";

/** /api/health — état du service et de la base (issue #27). */
export const healthRoutes = Router();

healthRoutes.get("/", async (_req, res) => {
  const db = await checkDatabase();
  res.status(db.ok ? 200 : 503).json({
    status: db.ok ? "ok" : "degraded",
    uptime: Math.round(process.uptime()),
    database: db.ok ? { status: "up", name: db.database, version: db.version, latencyMs: db.latencyMs } : { status: "down" },
  });
});
