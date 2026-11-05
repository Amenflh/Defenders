import { existsSync } from "node:fs";
import { defineConfig, env } from "prisma/config";

// En local, lit backend/.env ; dans Docker, DATABASE_URL vient de docker-compose.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
    // Base « fantôme » utilisée par `prisma migrate dev` / `migrate diff` (développement uniquement).
    ...(process.env.SHADOW_DATABASE_URL ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL } : {}),
  },
});
