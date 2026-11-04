import { existsSync } from "node:fs";

// En local, charge backend/.env (Node ≥ 20.12). Dans Docker, les variables viennent de docker-compose.
if (existsSync(".env")) process.loadEnvFile(".env");

function toInt(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name} (voir backend/.env.example)`);
  }
  return value;
}

export const config = {
  port: toInt(process.env.PORT, 4000),
  host: process.env.HOST ?? "0.0.0.0",
  /** Origines autorisées à appeler l'API depuis un navigateur (séparées par des virgules). */
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  /** Chaîne de connexion PostgreSQL : postgres://utilisateur:motdepasse@hôte:5432/base */
  databaseUrl: required("DATABASE_URL"),
  /** Durée de validité d'une session admin. */
  sessionTtlHours: toInt(process.env.SESSION_TTL_HOURS, 12),
  /** Compte admin créé au démarrage s'il n'existe encore aucun admin. */
  adminSeed: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME ?? "Administrateur",
  },
  smtp: {
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: toInt(process.env.SMTP_PORT, 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    contactTo: process.env.CONTACT_TO ?? "",
  },
} as const;
