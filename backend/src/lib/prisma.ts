import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { config } from "../config.js";

/** Client Prisma unique pour toute l'application (adaptateur PostgreSQL « pg »). */
export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: config.databaseUrl, max: 10, connectionTimeoutMillis: 5_000 }),
});

export type DbStatus =
  | { ok: true; latencyMs: number; version: string; database: string }
  | { ok: false; error: string };

/** Vérifie que la base répond (utilisé par /api/health et `npm run db:check`). */
export async function checkDatabase(): Promise<DbStatus> {
  const start = Date.now();
  try {
    const [row] = await prisma.$queryRaw<{ version: string; database: string }[]>`
      SELECT split_part(version(), ' ', 2) AS version, current_database() AS database`;
    return { ok: true, latencyMs: Date.now() - start, version: row.version, database: row.database };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Attend que PostgreSQL accepte les connexions (utile au démarrage du conteneur). */
export async function waitForDatabase(retries = 15, delayMs = 2000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const status = await checkDatabase();
    if (status.ok) {
      console.info(`[db] connecté à « ${status.database} » (PostgreSQL ${status.version})`);
      return;
    }
    console.warn(`[db] tentative ${attempt}/${retries} échouée : ${status.error}`);
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error("Impossible de se connecter à PostgreSQL");
}
