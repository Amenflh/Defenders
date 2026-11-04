/**
 * Vérifie la connexion du backend à PostgreSQL et l'état du schéma.
 * Usage : npm run db:check
 */
import { checkDatabase, pool } from "../db/pool.js";

const status = await checkDatabase();
if (!status.ok) {
  console.error(`❌ Connexion PostgreSQL impossible : ${status.error}`);
  await pool.end();
  process.exit(1);
}

console.log(`✅ Connecté à « ${status.database} » — PostgreSQL ${status.version} (${status.latencyMs} ms)`);

const { rows } = await pool.query<{ table_name: string }>(
  "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
);
console.log(`   Tables : ${rows.map((r) => r.table_name).join(", ") || "(aucune — lancez le backend pour appliquer les migrations)"}`);

const migrations = await pool
  .query<{ id: string }>("SELECT id FROM schema_migrations ORDER BY id")
  .then((r) => r.rows.map((m) => m.id))
  .catch(() => []);
console.log(`   Migrations appliquées : ${migrations.join(", ") || "aucune"}`);

await pool.end();
