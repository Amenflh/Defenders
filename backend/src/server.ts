import { createApp } from "./app.js";
import { config } from "./config.js";

const server = createApp().listen(config.port, config.host, () => {
  console.info(`API Defenders prête sur http://${config.host}:${config.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.info(`${signal} reçu, arrêt du serveur…`);
    server.close(() => process.exit(0));
  });
}
