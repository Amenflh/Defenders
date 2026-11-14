UPDATE "formations"
SET
  "summary" = CASE "slug"
    WHEN 'pilates' THEN 'Suivez le parcours Matwork & Reformer, niveaux 1 et 2 : 40 heures sur six jours à Nabeul, avec certification annoncée à l''issue de la formation. Contactez l''académie pour confirmer la prochaine session.'
    WHEN 'football' THEN 'Suivez quatre jours de théorie et de pratique à Hammamet : méthode d''entraînement, préparation physique, analyse du jeu et conduite des séances. Le post annonce deux certificats et un tarif de 750 TND ; aucune prochaine session n''est datée.'
    WHEN 'personal-training' THEN 'Évaluez les objectifs de vos clients, planifiez leurs séances et encadrez la musculation, le conditionnement physique et les bases nutritionnelles. Consultez les vidéos sources et contactez l''académie pour les prochaines dates et le lieu.'
  END,
  "updated_at" = CURRENT_TIMESTAMP
WHERE
  ("slug" = 'pilates' AND "summary" = 'Maîtrisez les fondamentaux du Pilates au sol et sur Reformer. Apprenez à guider les mouvements, adapter les exercices et structurer des séances progressives selon les besoins de chaque public.')
  OR ("slug" = 'football' AND "summary" = 'Concevez des séances, développez les qualités physiques et transmettez des principes de jeu adaptés à l''âge, au niveau et aux objectifs des joueurs.')
  OR ("slug" = 'personal-training' AND "summary" = 'Apprenez à évaluer les objectifs d''un client, planifier son entraînement et l''accompagner avec des méthodes sûres de musculation, de conditionnement physique et de conseils nutritionnels.');
