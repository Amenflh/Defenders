# Plan de tests

## 1. Objectif

Définir les contrôles nécessaires avant tout déploiement en production du site Defenders Fitness Academy.

## 2. Types de tests

### 2.1 Tests unitaires

Backend :
- Validation des schémas Zod
- Hashage et vérification des mots de passe
- Vérification des permissions RBAC
- Conversion des données Prisma vers DTO
- Construction des templates e-mail
- Validation des pièces jointes

Frontend :
- Gestion des états de formulaire
- Pré-sélection des formations
- Affichage des erreurs
- Adaptation responsive via composants

### 2.2 Tests API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `POST /api/contact`
- `GET /api/me/inscriptions`
- `GET /api/admin/contacts`
- `PATCH /api/admin/contacts/:id`
- `GET /api/planning`

### 2.3 Tests fonctionnels E2E

1. Visiteur ouvre la page d'accueil.
2. Visiteur ouvre une formation.
3. Visiteur crée une demande.
4. Demande enregistrée en base.
5. Confirmation e-mail reçue.
6. Notification administrateur reçue.
7. Client se connecte.
8. Client consulte ses inscriptions.
9. Administrateur consulte les demandes.
10. Administrateur change le statut.
11. Un client ne peut pas accéder aux routes administrateur.

### 2.4 Tests responsive

Résolutions minimales à valider :

- 360 x 800
- 390 x 844
- 768 x 1024
- 1280 x 720
- 1440 x 900
- 1920 x 1080

Contrôles :

- Aucun défilement horizontal
- Menu mobile utilisable
- Formulaire complet accessible
- Images et vidéos proportionnées
- Grilles partenaires et formations lisibles
- Carte Google et iframe accessibles

### 2.5 Tests de sécurité

- Authentification invalide
- Jeton expiré
- Accès admin avec rôle client
- Injection SQL
- Injection HTML/XSS dans les champs e-mail
- Honeypot spam
- Rate limit inscription et connexion
- Upload PDF/JPG/PNG interdit pour extension non autorisée
- Taille supérieure à 5 Mo refusée
- Secrets absents des builds et du dépôt
- CORS restrictif
- Headers Helmet

### 2.6 Tests e-mail

- Envoi Gmail configuré
- E-mail administrateur avec pièces jointes
- E-mail confirmation avec logo
- Logo embarqué et visible
- Adresse `replyTo` correcte
- Échec SMTP journalisé sans suppression de la demande
- Affichage Gmail desktop/mobile
- Affichage Outlook ou webmail si disponible

## 3. Critères d'entrée

- Build frontend réussi
- Build backend réussi
- Migrations Prisma appliquées
- Variables d'environnement production définies
- Domaine et HTTPS disponibles
- Base de recette initialisée
- Données de test séparées de la production

## 4. Critères de sortie

- Aucun bug Critique ou Bloquant ouvert
- Aucun test de sécurité critique échoué
- Aucun secret commité
- Sauvegarde restaurée avec succès sur une base test
- Pages principales disponibles en HTTPS
- Formulaire réel validé
- Log de déploiement archivé

## 5. Outils recommandés

| Catégorie | Outil recommandé |
|---|---|
| API | Vitest ou Jest + Supertest |
| E2E | Playwright |
| Lint | ESLint |
| Types | TypeScript |
| Sécurité dépendances | npm audit / Snyk / GitHub Dependabot |
| Headers | SecurityHeaders.com |
| Performance | Lighthouse / PageSpeed |
| Monitoring | Uptime Kuma |
| SMTP | Compte Gmail Workspace ou service transactionnel |
