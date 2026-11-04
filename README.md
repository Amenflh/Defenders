# Defenders Fitness Academy

Site professionnel du centre de formation continue Defenders Fitness Academy
(coaching privé et sciences du sport : Pilates, Football, Personal Training).

Organisation du code, conventions et choix techniques : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

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

**Le site exige une connexion** : sans session, toute page redirige vers `/login`
(`frontend/src/proxy.ts`, puis vérification réelle côté serveur).

| Page | Route | Accès |
|---|---|---|
| Connexion (admin et clients, même formulaire) | `/login` | public |
| Création de compte client | `/register` | public |
| Accueil, Pilates, Football, Personal Training, Planning | `/`, `/pilates`, … | connecté |
| Inscription à une formation (pré-remplie, liée au compte) | `/contact` | connecté |
| Formulaire d'inscription en popup | `/contact?popup=1` | connecté |
| Mentions légales, confidentialité, cookies | `/mentions-legales`, `/politique-de-confidentialite`, `/cookies` | connecté |
| Suivi de ses inscriptions | `/mon-espace` | client |
| Tableau de bord des demandes | `/admin` | admin |

`/robots.txt` et `/sitemap.xml` restent publics.

## API (backend)

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/health` | État du service et de la base PostgreSQL |
| GET | `/api/planning?discipline=pilates` | Planning hebdomadaire |
| POST | `/api/contact` | Enregistre une demande, pièce jointe facultative (PDF/JPG/PNG, 5 Mo), puis l'envoie par e-mail SMTP (10 envois / 15 min / IP) |
| POST | `/api/auth/register` | Création d'un compte client → jeton de session |
| POST | `/api/auth/login` | Connexion (admin ou client) → jeton de session (5 échecs / 15 min / IP) |
| GET | `/api/auth/me` | Utilisateur connecté (avec son rôle) |
| POST | `/api/auth/logout` | Révoque la session |
| GET | `/api/me/inscriptions` | Inscriptions du client connecté |
| GET | `/api/admin/contacts?status=nouveau` | Liste des demandes (admin) |
| PATCH | `/api/admin/contacts/:id` | Change le statut : `nouveau`, `contacte`, `inscrit`, `archive` (admin) |

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
    ├── modules/<domaine>/     # auth · registrations · planning · health
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

### E-mails (SMTP)

Chaque demande d'inscription est enregistrée en base, puis envoyée par e-mail à `CONTACT_TO`.
Sans configuration SMTP, la demande est quand même enregistrée (un avertissement est affiché dans les logs).
Avec Gmail, utiliser un **mot de passe d'application** Google, jamais le mot de passe principal.

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

Site : http://localhost:3000 — Admin : http://localhost:3000/admin

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
cd frontend && npm run lint && npm run build
cd ../backend && npm run typecheck && npm run build
docker compose ps
curl http://localhost:4000/api/health
```

## Personnalisation

- Coordonnées, réseaux sociaux et partenaires : `frontend/src/lib/site.ts`
- Disciplines et contenus de formation : `frontend/src/lib/disciplines.ts`
- Planning : créneaux **d'exemple** insérés dans `training_sessions` (`backend/src/db/seed.ts`), à remplacer par le vrai
- Médias : `frontend/public/pics/` et `frontend/public/pics/banner_images/`
- En production (HTTPS) : définir `COOKIE_SECURE=true` pour le frontend
