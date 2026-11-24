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
  // Derrière un répartiteur de charge / reverse proxy (souvent 60 s d'inactivité) : la connexion doit rester
  // ouverte plus longtemps côté API, sinon des requêtes échouent au hasard (502) sous forte charge.
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;
  // Une requête ne peut pas monopoliser une connexion indéfiniment (lenteur volontaire, client bloqué).
  server.requestTimeout = 60_000;

  let stopping = false;
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      if (stopping) return;
      stopping = true;
      console.info(`${signal} reçu, arrêt du serveur…`);
      // Arrêt propre : on termine les requêtes en cours, puis on force la sortie si cela dure plus de 10 s.
      setTimeout(() => {
        console.error("[arrêt] délai dépassé, sortie forcée");
        process.exit(1);
      }, 10_000).unref();
      server.close(() => {
        void prisma.$disconnect().finally(() => process.exit(0));
      });
      server.closeIdleConnections();
    });
  }
}

// Une promesse rejetée sans gestionnaire est journalisée (au lieu de faire tomber l'API silencieusement).
process.on("unhandledRejection", (reason) => {
  console.error("[promesse non gérée]", reason instanceof Error ? reason.message : reason);
});

main().catch((err) => {
  console.error("[démarrage] échec :", err instanceof Error ? err.message : err);
  process.exit(1);
});
