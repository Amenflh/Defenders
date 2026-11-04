# Cahier des charges - Defenders Fitness Academy

## 1. Objectif

Refondre le site web de Defenders Fitness Academy avec une identité premium orientée sport, certification professionnelle et demande d'inscription.

Le site doit présenter clairement les formations, accompagner les visiteurs vers une demande d'inscription et permettre aux responsables de recevoir les demandes par e-mail.

## 2. Identité visuelle

- Palette noire et dorée avec textes clairs.
- Style premium, sportif et professionnel.
- Typographie de titre condensée.
- Animations discrètes et modernes.
- Interface responsive sur ordinateur, tablette et mobile.
- Respect du mode `prefers-reduced-motion`.
- Technologies attendues : Next.js, React, TypeScript, Tailwind CSS, GSAP, Anime.js, Radix/shadcn.

## 3. Navigation principale

- Accueil
- Nos formations
- Galerie
- Planning
- Contact
- Bouton principal « Réserver ma place »

La navigation mobile doit rester accessible et fermer automatiquement après un clic.

## 4. Page d'accueil

### 4.1 En-tête

- Logo Defenders et titre Fitness Academy.
- Bandeau de présentation.
- Agrément visible : « Centre de formation certifié · Agrément n° 21-340-24 ».
- Description des coachs et professionnels du sport.
- Mot animé entre Pilates, Football et Personal Training.
- Boutons :
  - « Nos formations ».
  - « Demander mon inscription » ou « Réserver ma place ».
- Le bouton d'inscription doit ouvrir le formulaire en popup.

### 4.2 Diaporama du héros

- Arrière-plan automatique composé des photos de promotions.
- Transition animée.
- Couche sombre pour conserver la lisibilité du texte.
- Images en taille adaptée sans déformation importante.

### 4.3 Chiffres

Afficher les chiffres réels validés par Defenders Academy. Les valeurs provisoires actuellement présentes ne doivent pas être considérées comme définitives.

Exemple provisoire :

- 3 disciplines.
- 2 vidéos.
- 7+ promotions.
- 5904+ abonnés Facebook.

### 4.4 Galerie

La galerie doit être intégrée directement à la page d'accueil.

- Mélanger uniquement les photos promotionnelles, certificats, moments de formation et vidéos.
- Conserver les dimensions réelles des images sans les découper.
- Utiliser une disposition en mosaïque/masonry.
- Adapter le nombre de colonnes selon l'écran.
- Éviter les grands espaces causés par les formats portrait et paysage.
- Les vidéos doivent fonctionner directement sur le site.
- Lecture automatique, en boucle, silencieuse et compatible mobile.
- Aucun embed Instagram ou Facebook obligatoire pour les vidéos locales.

La page séparée `/galerie` n'est pas nécessaire si la galerie reste intégrée à l'accueil.

### 4.5 À propos

Présenter Defenders Academy comme centre de formation continue spécialisé en coaching privé et sciences du sport.

### 4.6 Formations

Présenter trois domaines :

- Pilates.
- Football.
- Personal Training.

Chaque formation doit mener vers sa page détaillée.

### 4.7 FAQ

Utiliser un composant accordéon pour les questions fréquentes.

### 4.8 Partenaires

- Afficher les partenaires avant le footer.
- Fond noir.
- Logos uniquement, sans titre ni description visible par défaut.
- Les logos doivent être circulaires.
- Au survol ou au clic, afficher les informations du partenaire.
- Utiliser uniquement des logos officiels validés.

Partenaires actuels à confirmer :

- RITEJ Company for Recruitment.
- Bayrak El Arab.
- Tunisian Security Academy.
- Sunset Studio Pilates.

## 5. Pages formations

Créer ou conserver une page détaillée par formation :

- `/pilates`
- `/football`
- `/personal-training`

Chaque page doit contenir :

- Présentation de la formation.
- Objectifs.
- Programme.
- Public concerné.
- Niveau.
- Informations pratiques.
- Bouton « Demander mon inscription » pré-sélectionnant la formation.

## 6. Planning

Afficher les sessions disponibles par discipline.

- Filtrage par discipline.
- Jour, heure et format.
- Niveau de la session.
- Bouton menant vers le formulaire avec la formation pré-sélectionnée.

## 7. Contact et inscriptions

### 7.1 Versions

Le site doit proposer deux accès au même formulaire :

- Page classique `/contact`.
- Popup accessible par `/contact?popup=1`.

Le même formulaire doit être utilisé dans les deux versions afin qu'elles restent toujours synchronisées.

### 7.2 Champs

- Prénom.
- Nom.
- Adresse e-mail.
- Téléphone.
- Ville.
- Profil.
- Formations souhaitées, choix multiple.
- Disponibilité.
- Niveau ou expérience.
- Message libre.
- Pièce jointe facultative.
- Consentement au recontact.
- Champ anti-spam invisible.

Pièces autorisées :

- PDF.
- JPG/JPEG.
- PNG.
- Taille maximale : 5 Mo.

### 7.3 Validation

- Validation côté navigateur et côté API.
- Messages d'erreur précis sous chaque champ concerné.
- Conservation des données saisies après une erreur.
- Protection anti-spam.
- Limitation du nombre de demandes.
- Écran de confirmation après envoi réussi.

### 7.4 Envoi

- Les demandes doivent être enregistrées dans la base PostgreSQL.
- Un e-mail complet doit être envoyé à `ahannachi193@gmail.com`.
- Le champ Répondre à doit correspondre à l'adresse du candidat.
- Le formulaire doit accepter les pièces jointes.
- Gmail SMTP doit utiliser un mot de passe d'application Google.
- Le mot de passe SMTP ne doit jamais être écrit dans le dépôt.

Variables à configurer :

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=adresse-gmail
SMTP_PASS=mot-de-passe-d-application
CONTACT_TO=ahannachi193@gmail.com
```

### 7.5 Liens de conversion

Les liens publiés sur Instagram, Facebook ou dans les vidéos peuvent ouvrir directement :

```text
https://site-defenders/contact?popup=1
```

Une formation peut être pré-sélectionnée :

```text
/contact?popup=1&formation=pilates
/contact?popup=1&formation=football
/contact?popup=1&formation=personal-training
```

## 8. Administration

Prévoir l'accès aux demandes enregistrées :

- Liste des demandes.
- Statut : nouveau, contacté, inscrit, archivé.
- Informations du candidat.
- Pièces jointes si elles sont persistées durablement.
- Filtrage par statut et formation.
- Protection par authentification administrateur.

## 9. Technique

### Frontend

- Next.js 16.
- React 19.
- TypeScript.
- Tailwind CSS 4.
- Radix UI.
- GSAP et Anime.js.

### Backend

- Node.js.
- Express.
- Zod.
- PostgreSQL.
- Nodemailer.
- Docker Compose.

### Sécurité

- Ne jamais exposer les mots de passe ou clés SMTP.
- Conserver les secrets dans les fichiers `.env` non suivis par Git.
- Valider les fichiers et limiter leur taille.
- Protège les routes administrateur.
- Limiter les tentatives d'inscription par adresse IP.

## 10. Déploiement

- Frontend accessible sur le port local 3001 en développement.
- Backend accessible sur le port local 4000 en développement.
- PostgreSQL accessible uniquement en local/Docker.
- La production doit reconstruire les images Docker après chaque modification.
- Un changement du frontend ou backend doit être suivi de lint, build et redémarrage.

## 11. Contenus à finaliser

- Remplacer les chiffres provisoires par les données officielles.
- Remplacer les logos partenaires provisoires par les logos officiels.
- Vérifier les adresses, téléphones et liens sociaux.
- Vérifier les programmes et tarifs de chaque formation.
- Remplacer les intitulés et textes provisoires si nécessaire.
- Valider les photos promotionnelles publiques et les droits associés.
- Configurer le mot de passe d'application Gmail.
- Ajouter un certificat TLS et un nom de domaine pour la production.

## 12. Critères de validation

- Tous les liens internes et externes fonctionnent.
- Le site est responsive sur mobile, tablette et ordinateur.
- Les images conservent leur format naturel.
- La galerie est visible sur l'accueil et ne génère pas d'espaces inutiles.
- Les vidéos tournent automatiquement en boucle sans son.
- Les chiffres sont placés sous le héros.
- Les partenaires sont affichés circulairement sur fond noir avant le footer.
- La popup s'ouvre depuis tous les liens d'inscription ciblés.
- La page classique reste disponible.
- Les demandes sont enregistrées et envoyées par e-mail.
- Le dépôt ne contient aucun mot de passe ou secret SMTP.
