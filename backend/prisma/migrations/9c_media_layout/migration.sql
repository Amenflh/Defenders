-- Format des vidéos de la médiathèque : un reel paysage ou carré est recadré correctement dans les galeries.
ALTER TABLE "media" ADD COLUMN "layout" TEXT NOT NULL DEFAULT 'portrait';

-- Reprend le format déjà connu sur les formations (même lien vidéo).
UPDATE "media" AS m
SET "layout" = v->>'layout'
FROM "formations" AS f, jsonb_array_elements(f."videos") AS v
WHERE m."type" = 'video'
  AND v->>'url' = m."url"
  AND v->>'layout' IN ('square', 'landscape');
