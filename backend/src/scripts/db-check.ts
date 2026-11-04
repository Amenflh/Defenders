/**
 * Vérifie la connexion du backend à PostgreSQL via Prisma et l'état des migrations.
 * Usage : npm run db:check   (dans Docker : node dist/scripts/db-check.js)
 */
import { checkDatabase, prisma } from "../lib/prisma.js";

try {
  const status = await checkDatabase();
  if (!status.ok) {
    console.error(`❌ Connexion PostgreSQL impossible : ${status.error}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ Connecté à « ${status.database} » — PostgreSQL ${status.version} (${status.latencyMs} ms) via Prisma`);

    const tables = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
    console.log(`   Tables : ${tables.map((t) => t.table_name).join(", ")}`);

    const migrations = await prisma
      .$queryRaw<{ migration_name: string }[]>`
        SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY started_at`
      .catch(() => []);
    console.log(`   Migrations Prisma appliquées : ${migrations.map((m) => m.migration_name).join(", ") || "aucune (lancez npm run db:migrate)"}`);

    const [users, formations, sessions, registrations] = await Promise.all([
      prisma.user.count(),
      prisma.formation.count(),
      prisma.trainingSession.count(),
      prisma.registration.count(),
    ]);
    console.log(`   Données : ${users} comptes, ${formations} formations, ${sessions} créneaux, ${registrations} inscriptions`);
  }
} finally {
  await prisma.$disconnect();
}
