ALTER TABLE "formations"
ADD COLUMN "intro" JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN "facts" JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN "objectives" JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN "modules" JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN "audience" JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN "careers" JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN "cover_url" TEXT NOT NULL DEFAULT '',
ADD COLUMN "gallery_urls" JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN "accent" TEXT NOT NULL DEFAULT 'gold';
