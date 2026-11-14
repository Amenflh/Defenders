UPDATE "formations"
SET
  "headline" = CASE "slug"
    WHEN 'pilates' THEN 'Pilates Mat & Reformer : formation d''instructeur'
    WHEN 'football' THEN 'Formation en entraînement et coaching de football'
    WHEN 'personal-training' THEN 'Formation de coach sportif personnel'
  END,
  "summary" = CASE "slug"
    WHEN 'pilates' THEN 'Maîtrisez les fondamentaux du Pilates au sol et sur Reformer. Apprenez à guider les mouvements, adapter les exercices et structurer des séances progressives selon les besoins de chaque public.'
    WHEN 'football' THEN 'Concevez des séances, développez les qualités physiques et transmettez des principes de jeu adaptés à l''âge, au niveau et aux objectifs des joueurs.'
    WHEN 'personal-training' THEN 'Apprenez à évaluer les objectifs d''un client, planifier son entraînement et l''accompagner avec des méthodes sûres de musculation, de conditionnement physique et de conseils nutritionnels.'
  END,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "slug" IN ('pilates', 'football', 'personal-training');
