-- Passage au schéma Prisma (issues #7, #20, #21) — SANS PERTE DE DONNÉES.
-- Écrite à la main : le diff automatique de Prisma supprimait puis recréait
-- « contacts » et « sessions », et effaçait la colonne « role ».

-- ── Ancien système de migrations : remplacé par Prisma ──────────────────────
DROP TABLE "schema_migrations";

-- ── Enums ───────────────────────────────────────────────────────────────────
CREATE TYPE "Role" AS ENUM ('admin', 'client');
CREATE TYPE "FormationStatus" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "SessionFormat" AS ENUM ('theorie', 'pratique', 'atelier', 'evaluation');
CREATE TYPE "SessionLevel" AS ENUM ('tous_niveaux', 'debutant', 'intermediaire', 'avance');
CREATE TYPE "RegistrationStatus" AS ENUM ('nouveau', 'contacte', 'inscrit', 'archive');
CREATE TYPE "MediaType" AS ENUM ('image', 'video');

-- ── users : noms de contraintes Prisma + rôle en enum (valeurs conservées) ──
ALTER INDEX "admins_pkey" RENAME TO "users_pkey";
ALTER INDEX "admins_email_key" RENAME TO "users_email_key";
ALTER SEQUENCE IF EXISTS "admins_id_seq" RENAME TO "users_id_seq";
ALTER TABLE "users" DROP CONSTRAINT "users_role_check";
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role" USING "role"::"Role";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'client';

-- ── sessions → auth_sessions (les sessions ouvertes restent valides) ────────
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_admin_id_fkey";
ALTER TABLE "sessions" RENAME TO "auth_sessions";
ALTER INDEX "sessions_pkey" RENAME TO "auth_sessions_pkey";
ALTER INDEX "sessions_expires_at_idx" RENAME TO "auth_sessions_expires_at_idx";
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── contacts → registrations (demandes conservées, statut en enum) ──────────
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_user_id_fkey";
ALTER TABLE "contacts" DROP CONSTRAINT "contacts_status_check";
ALTER TABLE "contacts" RENAME TO "registrations";
ALTER INDEX "contacts_pkey" RENAME TO "registrations_pkey";
ALTER INDEX "contacts_created_at_idx" RENAME TO "registrations_created_at_idx";
ALTER INDEX "contacts_status_idx" RENAME TO "registrations_status_idx";
ALTER INDEX "contacts_user_id_idx" RENAME TO "registrations_user_id_idx";
ALTER TABLE "registrations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "registrations" ALTER COLUMN "status" TYPE "RegistrationStatus" USING "status"::"RegistrationStatus";
ALTER TABLE "registrations" ALTER COLUMN "status" SET DEFAULT 'nouveau';
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ── Formations ──────────────────────────────────────────────────────────────
CREATE TABLE "formations" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "headline" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "duration_label" TEXT,
    "price_tnd" DECIMAL(10,2),
    "status" "FormationStatus" NOT NULL DEFAULT 'published',
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    CONSTRAINT "formations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "formations_slug_key" ON "formations"("slug");
CREATE INDEX "formations_status_position_idx" ON "formations"("status", "position");

-- Les trois formations de référence (nécessaires pour reprendre les demandes existantes).
INSERT INTO "formations" ("slug", "name", "headline", "duration_label", "position", "updated_at") VALUES
  ('pilates', 'Pilates', 'Devenez instructeur Pilates Mat & Reformer', NULL, 1, CURRENT_TIMESTAMP),
  ('football', 'Football', 'Formation d''entraîneur de football', '4 jours intensifs', 2, CURRENT_TIMESTAMP),
  ('personal-training', 'Personal Training', 'Personal Fitness Trainer Certification', '4 jours consécutifs', 3, CURRENT_TIMESTAMP);

-- ── Formateurs ──────────────────────────────────────────────────────────────
CREATE TABLE "trainers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "photo_url" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "formation_trainers" (
    "formation_id" INTEGER NOT NULL,
    "trainer_id" INTEGER NOT NULL,
    CONSTRAINT "formation_trainers_pkey" PRIMARY KEY ("formation_id","trainer_id")
);
CREATE INDEX "formation_trainers_trainer_id_idx" ON "formation_trainers"("trainer_id");
ALTER TABLE "formation_trainers" ADD CONSTRAINT "formation_trainers_formation_id_fkey"
  FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "formation_trainers" ADD CONSTRAINT "formation_trainers_trainer_id_fkey"
  FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Planning (créneaux récurrents, avec période optionnelle) ────────────────
CREATE TABLE "training_sessions" (
    "id" SERIAL NOT NULL,
    "formation_id" INTEGER NOT NULL,
    "trainer_id" INTEGER,
    "title" TEXT NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "format" "SessionFormat" NOT NULL,
    "level" "SessionLevel" NOT NULL DEFAULT 'tous_niveaux',
    "period_start" DATE,
    "period_end" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "training_sessions_formation_id_day_of_week_idx" ON "training_sessions"("formation_id", "day_of_week");
CREATE INDEX "training_sessions_trainer_id_idx" ON "training_sessions"("trainer_id");
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_formation_id_fkey"
  FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_trainer_id_fkey"
  FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ── Formations demandées dans chaque inscription ────────────────────────────
CREATE TABLE "registration_formations" (
    "registration_id" UUID NOT NULL,
    "formation_id" INTEGER NOT NULL,
    CONSTRAINT "registration_formations_pkey" PRIMARY KEY ("registration_id","formation_id")
);
CREATE INDEX "registration_formations_formation_id_idx" ON "registration_formations"("formation_id");

-- Reprise des données : l'ancienne colonne trainings (tableau de slugs) devient des liens.
INSERT INTO "registration_formations" ("registration_id", "formation_id")
SELECT DISTINCT r."id", f."id"
FROM "registrations" r
JOIN "formations" f ON f."slug" = ANY (r."trainings");

ALTER TABLE "registrations" DROP COLUMN "trainings";

ALTER TABLE "registration_formations" ADD CONSTRAINT "registration_formations_registration_id_fkey"
  FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "registration_formations" ADD CONSTRAINT "registration_formations_formation_id_fkey"
  FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Médias (galerie) ────────────────────────────────────────────────────────
CREATE TABLE "media" (
    "id" SERIAL NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "formation_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "media_category_idx" ON "media"("category");
CREATE INDEX "media_formation_id_idx" ON "media"("formation_id");
ALTER TABLE "media" ADD CONSTRAINT "media_formation_id_fkey"
  FOREIGN KEY ("formation_id") REFERENCES "formations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
