/**
 * Crée un admin (ou réinitialise son mot de passe / le promeut admin s'il existe déjà).
 * Usage : npm run admin:create -- <email> <motdepasse> [nom]
 */
import { upsertAdmin } from "../lib/auth.js";
import { runMigrations } from "../db/migrations.js";
import { pool } from "../db/pool.js";

const [email, password, ...nameParts] = process.argv.slice(2);

if (!email || !password) {
  console.error("Usage : npm run admin:create -- <email> <motdepasse> [nom]");
  process.exit(1);
}
if (password.length < 10) {
  console.error("Le mot de passe doit contenir au moins 10 caractères.");
  process.exit(1);
}

await runMigrations();
const admin = await upsertAdmin(email, password, nameParts.join(" ") || "Administrateur");
console.log(`✅ Admin prêt : ${admin.email} (id ${admin.id})`);
await pool.end();
