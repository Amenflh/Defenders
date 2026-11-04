# Defenders Fitness Academy

Site vitrine professionnel pour les formations Pilates, football et personal training de Defenders Fitness Academy.

## Stack

| Composant | Technologies |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Animations | GSAP, Anime.js |
| Interface | Radix UI, composants shadcn-style |
| Backend | Node.js 22, Express 5, TypeScript, Zod |
| Données | PostgreSQL 17 |
| Déploiement local | Docker Compose |
| E-mails | Nodemailer et SMTP |

## Routes publiques

| Page | Route |
|---|---|
| Accueil | `/` |
| Pilates | `/pilates` |
| Football | `/football` |
| Personal Training | `/personal-training` |
| Planning | `/planning` |
| Contact | `/contact` |
| Security Protection | `/securite` |
| Formulaire d'inscription popup | `/contact?popup=1` |
| Mentions légales | `/mentions-legales` |
| Confidentialité | `/politique-de-confidentialite` |
| Cookies | `/cookies` |

## Développement

```bash
# Base de données
docker compose up -d db

# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

Frontend local : `http://localhost:3000`
Frontend Docker local : `http://localhost:3001`
Backend Docker local : `http://localhost:4000`

## Docker

```bash
docker compose up --build -d
docker compose ps
```

## API

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Santé du backend et de PostgreSQL |
| `GET` | `/api/planning` | Sessions planifiées |
| `POST` | `/api/contact` | Enregistre une demande de contact et tente l'envoi SMTP |

## Configuration

Copier `.env.example` vers `.env`, puis renseigner les variables PostgreSQL, administrateur et SMTP.
Ne jamais versionner les mots de passe ou mots de passe d'application Gmail.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=adresse@gmail.com
SMTP_PASS=mot_de_passe_d_application
CONTACT_TO=destinataire@domaine.tn
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

## Vérifications

```bash
cd frontend && npm run lint && npm run build
cd ../backend && npm run typecheck && npm run build
docker compose ps
curl http://localhost:4000/api/health
```

## Personnalisation

- Coordonnées, réseaux sociaux et partenaires : `frontend/src/lib/site.ts`
- Disciplinées et contenus de formation : `frontend/src/lib/disciplines.ts`
- Planning de démonstration : `backend/src/data/planning.ts`
- Médias : `frontend/public/pics/` et `frontend/public/pics/banner_images/`
