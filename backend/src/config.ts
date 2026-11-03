import path from "node:path";

function toInt(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
}

export const config = {
  port: toInt(process.env.PORT, 4000),
  host: process.env.HOST ?? "0.0.0.0",
  /** Origines autorisées à appeler l'API depuis un navigateur (séparées par des virgules). */
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  /** Dossier où sont stockées les demandes de contact (monté en volume dans Docker). */
  dataDir: path.resolve(process.env.DATA_DIR ?? "data"),
} as const;
