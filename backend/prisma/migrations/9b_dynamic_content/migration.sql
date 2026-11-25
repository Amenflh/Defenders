-- Contenu entièrement modifiable dans l'admin : formations des deux académies, historique, équipe, galeries, témoignages.
-- Ajouts uniquement (aucune donnée existante n'est supprimée).

CREATE TYPE "Academy" AS ENUM ('fitness', 'tsa');

ALTER TABLE "formations"
  ADD COLUMN "academy" "Academy" NOT NULL DEFAULT 'fitness',
  ADD COLUMN "location" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "practical" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "contact_phone" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "source_url" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "cover_is_poster" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "videos" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';

-- La couleur vient désormais de « accent » (modifiable), plus du slug.
UPDATE "formations" SET "accent" = 'pilates' WHERE "slug" = 'pilates' AND "accent" = 'gold';
UPDATE "formations" SET "accent" = 'football' WHERE "slug" = 'football' AND "accent" = 'gold';
UPDATE "formations" SET "accent" = 'personal' WHERE "slug" = 'personal-training' AND "accent" = 'gold';

ALTER TABLE "trainers"
  ADD COLUMN "academy" "Academy",
  ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "media"
  ADD COLUMN "academy" "Academy",
  ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX "media_academy_category_idx" ON "media"("academy", "category");

ALTER TABLE "cms_items"
  ADD COLUMN "academy" "Academy",
  ADD COLUMN "translations" JSONB NOT NULL DEFAULT '{}';

CREATE TABLE "history_entries" (
  "id" SERIAL NOT NULL,
  "academy" "Academy" NOT NULL,
  "activity" TEXT NOT NULL DEFAULT '',
  "date" DATE,
  "status" TEXT NOT NULL DEFAULT 'course',
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "place" TEXT NOT NULL DEFAULT '',
  "participants" INTEGER,
  "medical_follow_up" BOOLEAN NOT NULL DEFAULT false,
  "photos" JSONB NOT NULL DEFAULT '[]',
  "videos" JSONB NOT NULL DEFAULT '[]',
  "sources" JSONB NOT NULL DEFAULT '[]',
  "translations" JSONB NOT NULL DEFAULT '{}',
  "position" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "history_entries_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "history_entries_academy_date_idx" ON "history_entries"("academy", "date");
