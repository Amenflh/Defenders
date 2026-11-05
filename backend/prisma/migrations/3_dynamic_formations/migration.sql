ALTER TABLE "formations"
ADD COLUMN "gallery_urls" JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN "accent" TEXT NOT NULL DEFAULT 'gold';
