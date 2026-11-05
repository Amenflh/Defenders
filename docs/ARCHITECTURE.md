# Architecture — Defenders Fitness Academy

Ce document décrit comment le projet est organisé, qui fait quoi, et les règles à suivre
pour ajouter du code au même endroit que le reste. Le [README](../README.md) explique comment
lancer le projet ; ce document explique **où** et **comment** écrire le code.

## Vue d'ensemble

```
Navigateur
   │  HTML, Server Actions (cookie httpOnly « dfa_session »)
   ▼
frontend/  Next.js 16 (App Router) — port 3000
   │  fetch serveur → serveur, jeton en « Authorization: Bearer »
   ▼
backend/   Express 5 + Prisma 7 — port 4000 (API JSON sous /api)
   │  SQL via l'adaptateur @prisma/adapter-pg
   ▼
db         PostgreSQL 17 (Docker) — port 5432
```

- **Le navigateur ne parle jamais directement à l'API.** Les pages et les Server Actions de Next.js
  appellent le backend côté serveur (`frontend/src/lib/session.ts` → `apiFetch`). Le jeton de session
  reste dans un cookie `httpOnly`, illisible par JavaScript.
- **Le backend est la seule porte d'accès à la base.** Le frontend n'importe jamais Prisma.
- **Un seul dépôt, deux applications indépendantes**, chacune avec son `package.json`, son `Dockerfile`
  et son `.env`. `docker-compose.yml` les assemble avec la base.

## Responsabilités

| Couche | Fait | Ne fait pas |
|---|---|---|
| Frontend | Affichage, navigation, formulaires, redirection vers `/login`, appel de l'API côté serveur | Accès à la base, règles métier, décision finale sur les droits |
| Backend | Validation des données, règles métier, rôles, sessions, e-mails, accès à la base | HTML, mise en page |
| Base | Stockage, contraintes (clés étrangères, unicité, enums) | — |

Les droits sont toujours **vérifiés par le backend** (`requireAuth`, `requireAdmin`). Les contrôles
du frontend (`proxy.ts`, layouts) servent seulement à rediriger tôt et à afficher la bonne interface.

## Frontend (`frontend/src`)

```
app/
├── layout.tsx               # <html>, polices, styles globaux — rien d'autre
├── (auth)/                  # pages sans en-tête : /login, /register (vidéo plein écran)
│   ├── layout.tsx           #   redirige vers l'accueil si déjà connecté
│   ├── actions.ts           #   Server Actions : connexion, création de compte, déconnexion
│   └── login/, register/    #   page.tsx (serveur) + *Form.tsx (client)
├── (site)/                  # tout le site connecté : en-tête, menu, pied de page
│   ├── layout.tsx           #   vérifie la session, sinon → /login
│   ├── page.tsx             #   accueil
│   ├── formations/          #   liste + [slug] : pages formations lues depuis l'API (FormationPage)
│   ├── pilates/, football/, personal-training/   # anciennes adresses → redirection
│   ├── planning/, contact/  #   planning (API) et inscription (Server Action + popup)
│   ├── mon-espace/          #   client : ses inscriptions
│   ├── admin/               #   admin : demandes, formations (CRUD), médias (envoi de fichiers)
│   └── mentions-legales/, politique-de-confidentialite/, cookies/
├── uploads/[...path]/       # relais des fichiers téléversés (/uploads/…) depuis le backend
├── robots.ts, sitemap.ts    # publics (exclus du proxy)
└── not-found.tsx
components/                  # composants réutilisables (Header, Footer, BannerMarquee…)
└── ui/                      # primitives Radix (dialog, accordion…) sans logique métier
lib/
├── session.ts               # cookie de session, apiFetch, utilisateur connecté
├── api.ts                   # lectures publiques de l'API (planning)
├── site.ts                  # coordonnées, réseaux sociaux, partenaires, navigation
├── formations.ts            # lecture des formations (API), types
├── formation-visuals.ts     # couleurs et photos par défaut de chaque formation
├── images.ts, labels.ts, utils.ts
proxy.ts                     # sans cookie de session → /login (sauf /login, /register, médias)
```

Règles :

- Les **route groups** `(auth)` et `(site)` ne changent pas les URL ; ils choisissent la mise en page
  et le contrôle d'accès. Une nouvelle page du site va dans `(site)/`.
- Les composants sont **serveur par défaut**. `"use client"` seulement s'il faut de l'état, des
  événements ou une API du navigateur, et le plus bas possible dans l'arbre.
- Les **mutations** passent par des Server Actions (`actions.ts` à côté de la page), qui appellent
  l'API avec `apiFetch`. Pas de `fetch` vers l'API depuis un composant client.
- Le **contenu éditorial** (textes, coordonnées, partenaires) est dans `lib/`, pas en dur dans les pages.
- Images et vidéos dans `public/pics/` et `public/video/`, affichées avec `next/image`.

## Backend (`backend/src`)

```
app.ts                 # assemblage Express : sécurité, JSON, routes des modules, erreurs
server.ts              # démarrage : attente de la base, seed, écoute, arrêt propre
config.ts              # lecture et validation des variables d'environnement
lib/                   # prisma.ts (client unique), errors.ts (erreurs HTTP), email.ts (SMTP)
middlewares/           # auth (session + rôles), validate (Zod), error (gestion centrale), rateLimits
modules/<domaine>/     # auth · formations · registrations · planning · media · docs · health
├── <domaine>.routes.ts       # URL + middlewares (validation, rôle, rate limit)
├── <domaine>.controller.ts   # lit req.valid, appelle le service, renvoie la réponse HTTP
├── <domaine>.service.ts      # logique métier + accès Prisma
└── <domaine>.schemas.ts      # schémas Zod
db/seed.ts             # données de référence (admin initial, planning d'exemple)
scripts/               # outils en ligne de commande (db-check, create-admin)
generated/prisma/      # client Prisma généré (non versionné)
```

Chaîne d'une requête : **route → middlewares → contrôleur → service → Prisma**.

- Les **routes** ne contiennent pas de logique.
- Les **contrôleurs** ne touchent pas à la base et ne connaissent pas Prisma.
- Les **services** ne connaissent pas Express (`req`, `res`) : ils reçoivent des données validées
  et renvoient des objets ou lèvent une erreur de `lib/errors.ts` (`NotFoundError`, `ConflictError`…).
- Les **erreurs** remontent jusqu'à `middlewares/error.ts`, qui produit toujours
  `{ "error": "…", "errors": { "champ": ["…"] } }`. Express 5 transmet seul les erreurs des fonctions `async`.

Ajouter un domaine (ex. `trainers`) : créer `modules/trainers/` avec les quatre fichiers, une ligne
`app.use("/api/trainers", trainerRoutes)` dans `app.ts`, et ses routes dans `modules/docs/openapi.ts`.

## Accès à la base

- **Prisma** est le seul moyen d'accéder à la base, via le client unique `lib/prisma.ts`.
- Le **schéma** (`prisma/schema.prisma`) est la source de vérité. Toute modification passe par
  une **migration versionnée** (`npm run db:migrate:dev -- --name …`), relue avant d'être commitée.
- Les noms des tables et colonnes en base restent en `snake_case` (`@@map`, `@map`) ; le code utilise
  le `camelCase` généré par Prisma.
- Les opérations qui touchent plusieurs tables utilisent une transaction (`prisma.$transaction`).

## Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Composant React, son fichier | `PascalCase` | `PartnersMarquee.tsx` |
| Fichier utilitaire (lib) | `camelCase` | `session.ts` |
| Dossier de route (URL) | `kebab-case`, en français | `personal-training/`, `mon-espace/` |
| Fichier backend d'un module | `<domaine>.<rôle>.ts` | `registrations.service.ts` |
| Variables et fonctions | `camelCase` | `getCurrentUser` |
| Constantes globales | `UPPER_SNAKE_CASE` | `SESSION_COOKIE` |
| Modèle Prisma / table | `PascalCase` singulier / `snake_case` pluriel | `TrainingSession` / `training_sessions` |
| Route d'API | `/api/<ressource>` au pluriel, `kebab-case` | `/api/admin/contacts` |
| Variable d'environnement | `UPPER_SNAKE_CASE` | `DATABASE_URL` |
| Branche Git | `feature/…`, `fix/…`, `chore/…` | `feature/prisma-orm` |
| Commit | Conventional Commits, en français | `feat(footer): bandeau des partenaires` |

Les textes affichés et les messages d'erreur de l'API sont en **français**. Le code (identifiants)
est en anglais, sauf les URL publiques.

## Décisions d'architecture

**1. Next.js appelle l'API côté serveur, avec un cookie `httpOnly`.**
Le jeton n'est jamais exposé au JavaScript du navigateur (protection contre le vol par XSS), et l'API
n'a pas besoin d'être ouverte au navigateur (CORS minimal).

**2. JWT signés, adossés à des sessions en base.**
Le jeton est un JWT HS256 (`JWT_SECRET`) avec expiration, émetteur et audience vérifiés à chaque requête.
Son identifiant (`jti`) désigne une session en base, stockée uniquement en empreinte SHA-256 : une
connexion peut ainsi être révoquée immédiatement (déconnexion, compte compromis), ce qu'un JWT seul ne
permet pas sans liste noire. Le rôle est relu en base, jamais pris dans le jeton.
Coût : une requête en base par appel authentifié, négligeable à cette échelle.

**3. Prisma comme ORM.**
Schéma typé, migrations versionnées et client TypeScript généré. Les migrations sont relues à la main :
pour un renommage, Prisma propose souvent « supprimer + recréer », ce qui efface les données.

**4. Backend découpé en modules par domaine.**
Chaque fonctionnalité est regroupée dans un dossier (routes, contrôleur, service, schémas), ce qui
limite les fichiers à toucher et les conflits entre développeurs.

**5. Tout le site exige une connexion.**
Choix du projet : admin et clients se connectent avant de consulter le site et de s'inscrire.
Seuls `/login`, `/register`, `robots.txt`, `sitemap.xml` et les médias restent publics.

**6. Une demande d'inscription est d'abord enregistrée, puis envoyée par e-mail.**
Une panne SMTP ne fait pas perdre la demande : elle reste visible dans l'espace admin.
