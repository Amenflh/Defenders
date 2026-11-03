# Defenders Fitness Academy — site web

Centre de formation continue spécialisé en coaching privé et sciences du sport
(Pilates, Football, Personal Training).

## Structure

```
frontend/   Next.js 16 · React 19 · TypeScript · Tailwind CSS 4  (port 3000)
backend/    Express 5 · TypeScript · Zod                         (port 4000)
docker-compose.yml
```

| Page | Route |
|---|---|
| Accueil | `/` |
| Pilates / Football / Personal Training | `/pilates`, `/football`, `/personal-training` |
| Planning (données de l'API) | `/planning` |
| Contact / inscription (envoi à l'API) | `/contact` |

### API (backend)

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/health` | État du service |
| GET | `/api/planning?discipline=pilates` | Planning hebdomadaire (filtre facultatif) |
| POST | `/api/contact` | Enregistre une demande d'inscription (validée par Zod, limitée à 10 / 15 min par IP) |

Les demandes sont stockées dans `DATA_DIR/contacts.jsonl` (volume Docker `backend-data`).

## Lancer avec Docker

```bash
docker compose up --build
```

- Site : http://localhost:3000
- API : http://localhost:4000/api/health

Lire les demandes de contact reçues :

```bash
docker compose exec backend cat /app/data/contacts.jsonl
```

## Lancer sans Docker (développement)

```bash
# Terminal 1
cd backend && npm install && npm run dev

# Terminal 2
cd frontend && npm install && npm run dev
```

Le frontend appelle l'API via `BACKEND_URL` (défaut : `http://localhost:4000`).

## À personnaliser

- `backend/src/data/planning.ts` : planning **d'exemple**, à remplacer par le vrai.
- `frontend/src/lib/site.ts` : coordonnées (adresse, téléphones, e-mail, réseaux sociaux).
- `frontend/src/lib/disciplines.ts` : contenus des formations.
- `frontend/public/pics/` : images (le bandeau d'accueil utilise `banner_images/`).
