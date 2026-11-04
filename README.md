# Defenders Fitness Academy — site web

Centre de formation continue spécialisé en coaching privé et sciences du sport
(Pilates, Football, Personal Training).

## Structure

```
frontend/   Next.js 16 · React 19 · TypeScript · Tailwind CSS 4  (port 3000)
backend/    Express 5 · TypeScript · Zod · PostgreSQL (pg)       (port 4000)
db          PostgreSQL 17 dans Docker                            (port 5432)
docker-compose.yml
```

**Tout le site exige une connexion** : sans session, toute page redirige vers `/login`
(`frontend/src/proxy.ts`, puis vérification réelle côté serveur).

| Page | Route | Accès |
|---|---|---|
| Connexion (admin et clients, même formulaire) | `/login` | public |
| Création de compte client | `/register` | public |
| Accueil, Pilates, Football, Personal Training, Planning | `/`, `/pilates`, … | connecté |
| Inscription à une formation (pré-remplie, liée au compte) | `/contact` | connecté |
| Suivi de ses inscriptions | `/mon-espace` | client |
| Tableau de bord des demandes | `/admin` | admin |

### API (backend)

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/health` | État du service et de la base PostgreSQL |
| GET | `/api/planning?discipline=pilates` | Planning hebdomadaire |
| POST | `/api/contact` | Enregistre une demande (validation Zod, 10 envois / 15 min / IP) |
| POST | `/api/auth/register` | Création d'un compte client → jeton de session |
| POST | `/api/auth/login` | Connexion (admin ou client) → jeton de session (5 échecs / 15 min / IP) |
| GET | `/api/auth/me` | Utilisateur connecté (avec son rôle) |
| POST | `/api/auth/logout` | Révoque la session |
| GET | `/api/me/inscriptions` | Inscriptions du client connecté |
| GET | `/api/admin/contacts?status=nouveau` | Liste des demandes (admin) |
| PATCH | `/api/admin/contacts/:id` | Change le statut : `nouveau`, `contacte`, `inscrit`, `archive` (admin) |

Base de données : tables `users` (rôle `admin` ou `client`), `sessions`, `contacts` (liées au compte client), `schema_migrations`.
Les migrations (`backend/src/db/migrations.ts`) s'appliquent automatiquement au démarrage du backend.
Les mots de passe sont hachés (bcrypt) ; les jetons de session ne sont stockés qu'en empreinte SHA-256.

## Configuration (variables d'environnement)

Les secrets ne sont **jamais** commités. Deux fichiers à créer à partir des exemples :

| Fichier | Utilisé par | Modèle |
|---|---|---|
| `.env` (racine) | `docker compose` (PostgreSQL, admin initial) | `.env.example` |
| `backend/.env` | `npm run dev` du backend | `backend/.env.example` |

Le mot de passe PostgreSQL doit être le même dans les deux fichiers.
Le premier admin est créé au démarrage à partir de `ADMIN_EMAIL` / `ADMIN_PASSWORD` si aucun admin n'existe.

## Lancer en développement

```bash
# 1. Base de données
docker compose up -d db

# 2. Backend (terminal 1)
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

## À personnaliser

- `backend/src/data/planning.ts` : planning **d'exemple**, à remplacer par le vrai.
- `frontend/src/lib/site.ts` : coordonnées (adresse, téléphones, e-mail, réseaux sociaux).
- `frontend/src/lib/disciplines.ts` : contenus des formations.
- `frontend/public/pics/` : images (le bandeau d'accueil utilise `banner_images/`).
- En production (HTTPS) : définir `COOKIE_SECURE=true` pour le frontend.
