/**
 * Chargé avant chaque fichier de test (`node --import ./test/env.ts`), donc avant `src/config.ts`.
 * `.env` n'écrase jamais une variable déjà définie : les valeurs ci-dessous l'emportent.
 */
import { existsSync } from "node:fs";

if (existsSync(".env")) process.loadEnvFile(".env");

// Base dédiée aux tests : TEST_DATABASE_URL, sinon la base de .env renommée en « defenders_test ».
const url = new URL(process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "postgres://localhost:5432/defenders_test");
if (!process.env.TEST_DATABASE_URL) url.pathname = "/defenders_test";

// Garde-fou : les tests vident des tables, jamais sur une base qui ne s'appelle pas *_test.
if (!url.pathname.endsWith("_test")) {
  throw new Error(`Les tests refusent de tourner sur « ${url.pathname.slice(1)} » : utilisez une base dont le nom finit par _test.`);
}

Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: url.toString(),
  JWT_SECRET: "test-secret-test-secret-test-secret-0123456789",
  ADMIN_EMAIL: "admin@test.local",
  ADMIN_PASSWORD: "Admin-test-123",
  ADMIN_NAME: "Admin Test",
  // Aucun e-mail réel pendant les tests.
  SMTP_USER: "",
  SMTP_PASS: "",
});
