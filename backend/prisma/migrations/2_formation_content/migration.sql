-- Contenu détaillé des formations, modifiable par l'admin (issues #35, #37)
ALTER TABLE "formations"
  ADD COLUMN IF NOT EXISTS "level"         "SessionLevel",
  ADD COLUMN IF NOT EXISTS "intro"         TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "objectives"    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "prerequisites" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "audience"      TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "careers"       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "modules"       JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "facts"         JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "cover_url"     TEXT;

-- A preceding version of the dynamic-formations migration stored these lists as JSON.
-- Convert them in-place so existing content and its ordering survive the schema merge.
CREATE FUNCTION pg_temp.jsonb_text_array(input JSONB) RETURNS TEXT[]
  LANGUAGE SQL IMMUTABLE
  AS $$ SELECT COALESCE(array_agg(value ORDER BY ordinal), ARRAY[]::TEXT[])
        FROM jsonb_array_elements_text(input) WITH ORDINALITY AS item(value, ordinal) $$;

DO $$
DECLARE
  v_column_name TEXT;
BEGIN
  FOREACH v_column_name IN ARRAY ARRAY['intro', 'objectives', 'audience', 'careers']
  LOOP
    IF (SELECT c.data_type FROM information_schema.columns c
        WHERE c.table_schema = current_schema() AND c.table_name = 'formations' AND c.column_name = v_column_name) = 'jsonb' THEN
      EXECUTE format('ALTER TABLE "formations" ALTER COLUMN %I DROP DEFAULT', v_column_name);
      EXECUTE format(
        'ALTER TABLE "formations" ALTER COLUMN %I TYPE TEXT[] USING pg_temp.jsonb_text_array(%I)',
        v_column_name,
        v_column_name
      );
    END IF;
    EXECUTE format('ALTER TABLE "formations" ALTER COLUMN %I SET DEFAULT ARRAY[]::TEXT[]', v_column_name);
    EXECUTE format('ALTER TABLE "formations" ALTER COLUMN %I SET NOT NULL', v_column_name);
  END LOOP;
  IF (SELECT c.data_type FROM information_schema.columns c
      WHERE c.table_schema = current_schema() AND c.table_name = 'formations' AND c.column_name = 'cover_url') = 'text' THEN
    ALTER TABLE "formations" ALTER COLUMN "cover_url" DROP NOT NULL;
  END IF;
END $$;

-- Fichiers téléversés (issues #38, #39)
ALTER TABLE "media"
  ADD COLUMN IF NOT EXISTS "storage_key" TEXT,
  ADD COLUMN IF NOT EXISTS "mime_type"   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "size_bytes"  INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS "media_storage_key_key" ON "media"("storage_key");
