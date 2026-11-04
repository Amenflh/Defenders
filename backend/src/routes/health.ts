import { Router } from "express";
import { checkDatabase } from "../db/pool.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  const db = await checkDatabase();
  res.status(db.ok ? 200 : 503).json({
    status: db.ok ? "ok" : "degraded",
    uptime: Math.round(process.uptime()),
    database: db.ok ? { status: "up", name: db.database, version: db.version, latencyMs: db.latencyMs } : { status: "down" },
  });
});
