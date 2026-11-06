# Defenders Fitness Academy

Site professionnel du centre de formation continue Defenders Fitness Academy
(coaching privé et sciences du sport : Pilates, Football, Personal Training).

Organisation du code, conventions et choix techniques : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Documentation projet :

- [Cahier des charges](docs/CAHIER_DES_CHARGES.md)
- [Spécifications logicielles SRS](docs/SPECIFICATIONS_LOGICIELLES.md)
- [Plan de mise en production](docs/PLAN_MISE_EN_PRODUCTION.md)
- [Plan de tests](docs/TEST_PLAN.md)
- [Checklist Go / No-Go](docs/PRODUCTION_CHECKLIST.md)

## Stack

| Composant | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 (port 3000) |
| Animations | GSAP, Anime.js |
| Interface | Radix UI, composants shadcn-style |
| Backend | Node.js, Express 5, TypeScript, Zod, Prisma 7 (port 4000) |
| Données | PostgreSQL 17 dans Docker (port 5432) |
| E-mails | Nodemailer et SMTP |
| Déploiement local | Docker Compose |

## Pages et accès

Le site marketing est public. Les espaces protégés nécessitent une connexion :
`/admin` est réservé aux administrateurs et `/mon-espace` aux clients.

| Page | Route | Accès |
|---|---|---|
| Connexion (admin et clients, même formulaire) | `/login` | public |
| Création de compte client | `/register` | public |
| Accueil, liste et détail des formations, planning | `/`, `/formations`, `/formations/<slug>`, `/planning` | public |
| Anciennes pages de formation | `/pilates`, `/football`, `/personal-training` | public |
| Inscription à une formation (pré-remplie, liée au compte) | `/contact` | public |
| Formulaire d'inscription en popup | `/contact?popup=1` | public |
| Defenders Security Protection | `/securite` | public |
| Mentions légales, confidentialité, cookies | `/mentions-legales`, `/politique-de-confidentialite`, `/cookies` | public |
| Suivi de ses inscriptions | `/mon-espace` | client |
| Tableau de bord des demandes | `/admin` | admin |
| Gestion des formations (contenu, statut) | `/admin/formations` | admin |
| Envoi et gestion des images et vidéos | `/admin/medias` | admin |

`/robots.txt`, `/sitemap.xml` et les médias (`/pics`, `/video`, `/uploads`) restent publics.

## API (backend)

Documentation interactive (Swagger) : **http://localhost:4000/api/docs** — bouton *Authorize* pour tester avec un jeton.
Spécification brute : `/api/docs/openapi.json`. En production, activer avec `API_DOCS=true`.

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/health` | État du service et de la base PostgreSQL |
| GET | `/api/planning?discipline=pilates` | Planning hebdomadaire |
| POST | `/api/contact` | Enregistre une demande, pièce jointe facultative (PDF/JPG/PNG, 5 Mo), puis l'envoie par e-mail SMTP (10 envois / 15 min / IP) |
| POST | `/api/auth/register` | Création d'un compte client → JWT |
| POST | `/api/auth/login` | Connexion (admin ou client) → JWT (5 échecs / 15 min / IP) |
| GET | `/api/auth/me` | Utilisateur connecté (avec son rôle) |
| POST | `/api/auth/logout` | Révoque la session |
| GET | `/api/me/inscriptions` | Inscriptions du client connecté |
| GET | `/api/admin/contacts?status=nouveau` | Liste des demandes (admin) |
| PATCH | `/api/admin/contacts/:id` | Change le statut : `nouveau`, `contacte`, `inscrit`, `archive` (admin) |
| GET | `/api/formations` · `/api/formations/:slug` | Formations publiées · détail (contenu, formateurs, créneaux, médias) |
| GET · POST | `/api/admin/formations` | Toutes les formations · création (admin) |
| GET · PATCH · DELETE | `/api/admin/formations/:id` | Détail · modification partielle · suppression (409 si des inscriptions existent : archiver) (admin) |
| GET | `/api/media?type=&category=&formation=` | Galerie publique |
| POST | `/api/admin/media/images` · `/videos` | Téléversement (multipart, champ `file`) : JPG/PNG/WebP 5 Mo · MP4/WebM 100 Mo (admin) |
| GET · PATCH · DELETE | `/api/admin/media` · `/api/admin/media/:id` | Liste · modification · suppression du média et de son fichier (admin) |

**Authentification** : `Authorization: Bearer <JWT>`. Le JWT (HS256, signé avec `JWT_SECRET`) contient
`sub`, `role`, `jti`, `iat`, `exp`, `iss`, `aud` ; il expire après `SESSION_TTL_HOURS` et est révocable :
son `jti` désigne une session en base (déconnexion = suppression de la session).

Erreurs : format unique `{ "error": "message", "errors": { "champ": ["…"] } }` (`errors` seulement pour la validation).
Codes : 400 requête invalide · 401 non connecté · 403 rôle insuffisant · 404 introuvable · 409 conflit · 422 validation · 429 trop de requêtes.

## Architecture du backend

```
backend/
├── prisma/
│   ├── schema.prisma          # modèles de données (source de vérité)
│   ├── migrations/            # migrations SQL versionnées (Prisma Migrate)
│   └── seed.ts                # données de référence (npx prisma db seed)
├── prisma.config.ts           # configuration Prisma (URL de la base, migrations, seed)
└── src/
    ├── app.ts                 # assemblage Express : middlewares + routes des modules
    ├── server.ts              # démarrage : attente de la base, seed, écoute
    ├── config.ts              # variables d'environnement
    ├── lib/                   # prisma.ts (client unique), errors.ts (erreurs HTTP), email.ts (SMTP)
    ├── middlewares/           # auth (rôles), validate (Zod), error (gestion centralisée), rateLimits
    ├── modules/<domaine>/     # auth · formations · registrations · planning · media · docs · health
    │   ├── *.routes.ts        #   URL + middlewares (validation, rôles)
    │   ├── *.controller.ts    #   HTTP : lit req.valid, renvoie la réponse
    │   ├── *.service.ts       #   logique métier + accès Prisma
    │   └── *.schemas.ts       #   schémas Zod réutilisables
    └── generated/prisma/      # client Prisma généré (non versionné)
```

Règle : les **routes** ne contiennent pas de logique, les **contrôleurs** ne touchent pas à la base,
les **services** ne connaissent pas Express.

## Base de données (Prisma)

| Modèle | Table | Rôle |
|---|---|---|
| `User` | `users` | Comptes, rôle `admin` / `client` |
| `AuthSession` | `auth_sessions` | Sessions de connexion (empreinte SHA-256 du jeton) |
| `Formation` | `formations` | Formations (slug, statut brouillon/publié/archivé, durée, prix) |
| `Trainer` · `FormationTrainer` | `trainers` · `formation_trainers` | Formateurs et formations où ils interviennent |
| `TrainingSession` | `training_sessions` | Créneaux du planning, avec période optionnelle (plusieurs promotions) |
| `Registration` · `RegistrationFormation` | `registrations` · `registration_formations` | Demandes d'inscription et formations demandées |
| `Media` | `media` | Images / vidéos de la galerie |

Les mots de passe sont hachés (bcrypt) ; les jetons de session ne sont stockés qu'en empreinte SHA-256.

### Travailler avec les migrations

```bash
cd backend
npm run db:migrate          # applique les migrations en attente (prisma migrate deploy)
npm run db:status           # état des migrations
npm run db:seed             # données de référence (admin, planning d'exemple)
npm run db:studio           # explorer la base dans le navigateur

# Modifier le schéma : éditer prisma/schema.prisma puis
npm run db:migrate:dev -- --name description_du_changement
```

- `db:migrate:dev` utilise une base « fantôme » (`SHADOW_DATABASE_URL`), à créer une fois :
  `docker exec defenders-db psql -U defenders -d defenders_dev -c "CREATE DATABASE defenders_shadow;"`
- **Toujours relire le SQL généré** avant de l'appliquer : pour un renommage, Prisma propose
  souvent « supprimer + recréer » (perte de données). Utiliser `--create-only`, corriger le SQL, puis appliquer.
- Retour arrière : Prisma n'a pas de « down ». On corrige par une **nouvelle** migration ;
  en dev, `npx prisma migrate reset` recrée la base (⚠️ efface les données) puis relance le seed.
- Dans Docker, `prisma migrate deploy` s'exécute automatiquement au démarrage du conteneur backend.
- Base existante créée avant Prisma : `npx prisma migrate resolve --applied 0_init` puis `npm run db:migrate`.

## Configuration (variables d'environnement)

Les secrets ne sont **jamais** commités. Deux fichiers à créer à partir des exemples :

| Fichier | Utilisé par | Modèle |
|---|---|---|
| `.env` (racine) | `docker compose` (PostgreSQL, admin initial) | `.env.example` |
| `backend/.env` | `npm run dev` du backend | `backend/.env.example` |

Le mot de passe PostgreSQL doit être le même dans les deux fichiers.
Le premier admin est créé au démarrage à partir de `ADMIN_EMAIL` / `ADMIN_PASSWORD` si aucun admin n'existe.

| Variable | Rôle |
|---|---|
| `JWT_SECRET` | **Obligatoire.** Secret de signature des JWT, 32 caractères minimum, différent par environnement |
| `SESSION_TTL_HOURS` | Durée de validité d'une connexion (12 h par défaut) |
| `SITE_URL` | Adresse publique du site (liens dans les e-mails) |
| `UPLOAD_DIR`, `MAX_IMAGE_MB`, `MAX_VIDEO_MB` | Dossier des fichiers téléversés (volume `uploads` dans Docker) et tailles maximales |
| `API_DOCS` | `true` pour exposer Swagger en production |

Générer un secret : `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

### E-mails (SMTP)

Chaque demande d'inscription est enregistrée en base, puis envoyée par e-mail à `CONTACT_TO`.
Sans configuration SMTP, la demande est quand même enregistrée (un avertissement est affiché dans les logs).
Avec Gmail, utiliser un **mot de passe d'application** Google, jamais le mot de passe principal.

Deux e-mails sont envoyés : une notification à l'équipe (coordonnées, formations, message, pièce jointe,
boutons « appeler » / « répondre ») et un accusé de réception au candidat (récapitulatif, prochaines étapes).

```bash
cd backend
npm run email:preview                       # aperçu HTML dans backend/tmp/email-preview/
npm run email:preview -- vous@exemple.tn    # envoie aussi les deux e-mails à cette adresse (test SMTP)
```

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=adresse@gmail.com
SMTP_PASS=mot_de_passe_d_application
CONTACT_TO=destinataire@domaine.tn
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

## Lancer en développement

```bash
# 1. Base de données
docker compose up -d db

# 2. Backend (terminal 1) — la 1re fois : npm run db:migrate
cd backend && npm install && npm run dev

# 3. Frontend (terminal 2)
cd frontend && npm install && npm run dev
```

Site : http://localhost:3000 — Admin : http://localhost:3000/admin — Documentation de l'API : http://localhost:4000/api/docs

Vérifier la connexion backend ↔ PostgreSQL :

```bash
cd backend && npm run db:check
```

Créer un autre admin (ou réinitialiser un mot de passe) :

```bash
cd backend && npm run admin:create -- email@exemple.com "MotDePasseSolide" "Prénom Nom"
```

## Lancer avec Docker (tout-en-un)

```bash
docker compose up --build -d
docker compose ps
docker compose exec backend node dist/scripts/db-check.js
```

Avec Docker, le frontend est servi sur http://localhost:3001.

## Vérifications

```bash
cd frontend && npm run lint && npm test && npm run build
cd ../backend && npm run typecheck && npm test && npm run build
docker compose ps
curl http://localhost:4000/api/health
```

## Tests

Les mêmes commandes tournent dans la CI (`.github/workflows/ci.yml`) sur chaque PR.

**Backend** : tests d'intégration (`backend/test/*.test.ts`) avec le lanceur de Node. Ils démarrent l'API
et appellent ses routes sur une **vraie base PostgreSQL dédiée**, `defenders_test`, vidée au début de chaque fichier.
Ils couvrent la connexion et les rôles, les limites de tentatives, le formulaire d'inscription, la gestion des demandes,
les statistiques du tableau de bord et la validation du CMS.

```bash
# Une seule fois : créer la base de test (dans le conteneur db), puis y appliquer les migrations
docker exec defenders-db createdb -U <POSTGRES_USER> defenders_test
cd backend && npm run test:db
npm test
```

Par défaut, les tests utilisent la base de `backend/.env` renommée en `defenders_test`. `TEST_DATABASE_URL` permet d'en choisir une autre.
Par sécurité, ils refusent de tourner sur une base dont le nom ne finit pas par `_test`. Aucun e-mail n'est envoyé.

**Frontend** : tests unitaires des fonctions pures (`frontend/tests/`) : liens WhatsApp, filtrage des liens, export CSV.
Ils ne demandent aucune installation : `cd frontend && npm test`.

## Personnalisation

- Coordonnées, réseaux sociaux et partenaires : `frontend/src/lib/site.ts`
- Contenu des formations : espace admin › Formations (stocké en base) ; couleurs et photos par défaut : `frontend/src/lib/formation-visuals.ts`
- Images et vidéos : espace admin › Médias
- Planning : créneaux **d'exemple** insérés dans `training_sessions` (`backend/src/db/seed.ts`), à remplacer par le vrai
- Médias : `frontend/public/pics/` et `frontend/public/pics/banner_images/`
- En production (HTTPS) : définir `COOKIE_SECURE=true` pour le frontend
