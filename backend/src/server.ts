import { createApp } from "./app.js";
import { config } from "./config.js";
import { ensureSeedData } from "./db/seed.js";
import { prisma, waitForDatabase } from "./lib/prisma.js";

// Les migrations sont appliquées avant le démarrage : `prisma migrate deploy`
// (automatique dans Docker, `npm run db:migrate` en local).
async function main() {
  await waitForDatabase();
  await ensureSeedData();

  const server = createApp().listen(config.port, config.host, () => {
    console.info(`API Defenders prête sur http://${config.host}:${config.port}`);
  });

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      console.info(`${signal} reçu, arrêt du serveur…`);
      server.close(() => {
        void prisma.$disconnect().finally(() => process.exit(0));
      });
    });
  }
}

main().catch((err) => {
  console.error("[démarrage] échec :", err instanceof Error ? err.message : err);
  process.exit(1);
});
