import { createApp } from "./app.js";
import { config } from "./config.js";
import { runMigrations } from "./db/migrations.js";
import { pool, waitForDatabase } from "./db/pool.js";
import { seedAdmin } from "./lib/auth.js";

async function main() {
  await waitForDatabase();
  await runMigrations();
  await seedAdmin();

  const server = createApp().listen(config.port, config.host, () => {
    console.info(`API Defenders prête sur http://${config.host}:${config.port}`);
  });

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => {
      console.info(`${signal} reçu, arrêt du serveur…`);
      server.close(() => {
        void pool.end().finally(() => process.exit(0));
      });
    });
  }
}

main().catch((err) => {
  console.error("[démarrage] échec :", err instanceof Error ? err.message : err);
  process.exit(1);
});
