-- Contenu détaillé des formations, modifiable par l'admin (issues #35, #37)
ALTER TABLE "formations"
  ADD COLUMN "level"         "SessionLevel",
  ADD COLUMN "intro"         TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "objectives"    TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "audience"      TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "careers"       TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "modules"       JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "facts"         JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "cover_url"     TEXT;

-- Fichiers téléversés (issues #38, #39)
ALTER TABLE "media"
  ADD COLUMN "storage_key" TEXT,
  ADD COLUMN "mime_type"   TEXT NOT NULL DEFAULT '',
  ADD COLUMN "size_bytes"  INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "media_storage_key_key" ON "media"("storage_key");
