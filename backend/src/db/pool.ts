import pg from "pg";
import { config } from "../config.js";

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on("error", (err) => {
  // Erreur sur une connexion inactive (ex. redémarrage de PostgreSQL) : on log sans planter.
  console.error("[db] erreur inattendue du pool :", err.message);
});

export type DbStatus = { ok: true; latencyMs: number; version: string; database: string } | { ok: false; error: string };

/** Vérifie que la base répond (utilisé par /api/health et `npm run db:check`). */
export async function checkDatabase(): Promise<DbStatus> {
  const start = Date.now();
  try {
    const { rows } = await pool.query<{ version: string; database: string }>(
      "SELECT split_part(version(), ' ', 2) AS version, current_database() AS database",
    );
    return { ok: true, latencyMs: Date.now() - start, version: rows[0].version, database: rows[0].database };
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
