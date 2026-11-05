# SRS - Spécifications Logicielles

## 1. Portée

Ce document précise les exigences logiciel du site Defenders Fitness Academy.

## 2. Exigences fonctionnelles détaillées

### SRS-FRONT-001 - Accueil

- Afficher le groupe Defenders, les formations principales et les appels à l'action.
- Afficher les promotions, médias, partenaires et informations de contact.
- Rediriger les boutons de réservation vers la page de contact.

### SRS-FRONT-002 - Formations

- Afficher Pilates, Football et Personal Training.
- Afficher le contenu détaillé, le planning, les médias et le prix si renseigné.
- Pré-sélectionner une formation depuis l'URL ou un bouton d'inscription.

### SRS-FRONT-003 - Compte

- L'utilisateur peut créer un compte avec nom, e-mail, téléphone et mot de passe.
- L'utilisateur peut se connecter.
- L'utilisateur peut consulter son espace personnel.
- Un administrateur peut consulter son tableau de bord.

### SRS-FRONT-004 - Contact et inscription

- Le formulaire conserve les valeurs en cas d'erreur.
- Les champs obligatoires sont indiqués.
- Le consentement est obligatoire.
- Le formulaire affiche une confirmation après succès.
- Une pièce jointe facultative est acceptée en PDF/JPG/PNG jusqu'à 5 Mo.
- Le piège anti-spam empêche les soumissions automatisées.

### SRS-BACK-001 - API d'inscription

- Valider tout le payload avec Zod.
- Vérifier que les formations demandées existent et sont publiées.
- Sauvegarder la demande dans PostgreSQL.
- Rattacher la demande à l'utilisateur client si connecté.
- Tenter l'envoi SMTP sans faire échouer la sauvegarde.
- Retourner l'identifiant UUID créé.

### SRS-BACK-002 - API d'administration

- Refuser les requêtes sans authentification.
- Refuser les requêtes provenant d'un rôle autre que `admin`.
- Permettre le filtre par statut.
- Permettre la mise à jour des statuts.

### SRS-BACK-003 - API du client

- Retourner uniquement les inscriptions appartenant à l'utilisateur connecté.
- Ne jamais exposer les inscriptions d'un autre utilisateur.

## 3. Exigences de données

### Entités principales

- `User`
- `AuthSession`
- `Formation`
- `Trainer`
- `FormationTrainer`
- `TrainingSession`
- `Registration`
- `RegistrationFormation`
- `Media`

### Contraintes principales

- L'e-mail utilisateur est unique.
- Le slug de formation est unique.
- Une inscription peut contenir plusieurs formations.
- Une formation peut être attachée à plusieurs formateurs et médias.
- Une session est attachée à une formation.
- Une demande peut exister sans compte utilisateur.

## 4. Exigences d'interface

- Navigation principale accessible au clavier.
- Contraste lisible.
- Champs avec labels et états d'erreur.
- Focus visible.
- Texte alternatif sur les images.
- Iframes avec titre et gestion des cookies tiers.
- Menu mobile accessible.
- Réduction des animations si les préférences utilisateur le demandent.

## 5. Exigences de sécurité

- RBAC avec rôles `admin` et `client`.
- Sessions avec empreintes SHA-256.
- Limite de durée des sessions.
- Secrets hors Git.
- Helmet et CORS.
- Limitation des requêtes sensibles.
- Validation des entrées.
- Erreurs sans fuite de détails internes.
- Aucune pièce jointe persistée en base.
- Mots de passe jamais enregistrés en clair.

## 6. Exigences de fiabilité

- Reprise automatique de PostgreSQL et Docker.
- Demande conservée si SMTP indisponible.
- Healthcheck frontend et backend.
- Migrations Prisma exécutées avant démarrage.
- Sauvegarde restaurable.

## 7. Exigences de maintenance

- Noms de variables documentés dans `.env.example`.
- Versions Docker et Node documentées.
- Dépendances mises à jour régulièrement.
- Migrations versionnées.
- Logs horodatés et centralisables.
- Procédure de restauration documentée.

## 8. API REST

| Méthode | Route | Accès |
|---|---|---|
| GET | `/api/health` | Public |
| GET | `/api/planning` | Public |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authentifié |
| POST | `/api/auth/logout` | Public/authentifié |
| POST | `/api/contact` | Public |
| GET | `/api/me/inscriptions` | Client/authentifié |
| GET | `/api/admin/contacts` | Administrateur |
| PATCH | `/api/admin/contacts/:id` | Administrateur |

## 9. Cas d'erreur

| Code | Cas |
|---|---|
| 400 | Requête mal formée |
| 401 | Session absente ou invalide |
| 403 | Rôle insuffisant |
| 404 | Ressource introuvable |
| 422 | Validation métier échouée |
| 429 | Limite de fréquence dépassée |
| 500 | Erreur interne sans exposition du détail |
