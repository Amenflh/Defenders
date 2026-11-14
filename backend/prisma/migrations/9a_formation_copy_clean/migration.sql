-- Résumés des formations : retire les notes de recherche (« le post annonce… », « aucune session n'est datée »)
-- héritées de la migration 9. Seules les fiches encore identiques au texte de la migration 9 sont modifiées :
-- un résumé déjà personnalisé dans l'admin est conservé.
UPDATE "formations"
SET
  "summary" = CASE "slug"
    WHEN 'pilates' THEN 'Suivez le parcours Matwork & Reformer, niveaux 1 et 2 : 40 heures sur six jours à Nabeul, avec une certification remise à l''issue de la formation. Contactez-nous pour réserver votre place à la prochaine session.'
    WHEN 'football' THEN 'Quatre jours de théorie et de pratique à Hammamet : méthode d''entraînement, préparation physique, analyse du jeu et conduite des séances. Deux certificats délivrés, pension complète incluse, tarif de 750 TND.'
    WHEN 'personal-training' THEN 'Évaluez les objectifs de vos clients, planifiez leurs séances et encadrez la musculation, le conditionnement physique et les bases de la nutrition. Contactez-nous pour connaître les dates et le lieu de la prochaine session.'
  END,
  "updated_at" = CURRENT_TIMESTAMP
WHERE
  ("slug" = 'pilates' AND "summary" = 'Suivez le parcours Matwork & Reformer, niveaux 1 et 2 : 40 heures sur six jours à Nabeul, avec certification annoncée à l''issue de la formation. Contactez l''académie pour confirmer la prochaine session.')
  OR ("slug" = 'football' AND "summary" = 'Suivez quatre jours de théorie et de pratique à Hammamet : méthode d''entraînement, préparation physique, analyse du jeu et conduite des séances. Le post annonce deux certificats et un tarif de 750 TND ; aucune prochaine session n''est datée.')
  OR ("slug" = 'personal-training' AND "summary" = 'Évaluez les objectifs de vos clients, planifiez leurs séances et encadrez la musculation, le conditionnement physique et les bases nutritionnelles. Consultez les vidéos sources et contactez l''académie pour les prochaines dates et le lieu.');

-- Football : la formation délivre deux certificats (coaching football et premiers secours sportifs), pas un
-- « certificat accrédité » unique. Ne touche qu'aux chiffres clés encore à leur valeur d'origine.
UPDATE "formations"
SET
  "facts" = '[{"label": "Durée", "value": "4 jours intensifs"}, {"label": "Hébergement", "value": "Pension complète"}, {"label": "Validation", "value": "2 certificats"}]'::jsonb,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "slug" = 'football'
  AND "facts" = '[{"label": "Durée", "value": "4 jours intensifs"}, {"label": "Hébergement", "value": "Inclus"}, {"label": "Validation", "value": "Certificat accrédité"}]'::jsonb;
