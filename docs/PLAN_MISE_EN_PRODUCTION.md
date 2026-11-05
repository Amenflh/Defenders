# Plan de mise en production

## 1. Recommandation principale

Pour le projet actuel, la solution la plus adaptée est un **VPS Docker Europe/Tunisie** avec :

- Ubuntu LTS
- Docker Engine et Docker Compose
- Nginx ou Traefik en reverse proxy
- PostgreSQL dans Docker, avec sauvegarde externe
- Cloudflare pour DNS, CDN, HTTPS et protection WAF
- SMTP Gmail ou transactionnel professionnel

Cette solution offre le meilleur équilibre coût/contrôle/maintenance pour une plateforme Next.js + Express + PostgreSQL. Elle évite le lock-in tout en restant assez simple pour une première mise en production.

## 2. Hébergement recommandé

### Option A - Recommandée : VPS OVHcloud

Exemple : 4 vCPU, 8 Go RAM, 100 Go NVMe, stockage sauvegardes séparé.

Avantages :
- Prix maîtrisé
- Accès SSH complet
- Docker et PostgreSQL accessibles
- Centre de données européen proche de la Tunisie
- Configuration flexible

À prévoir :
- Gestion des mises à jour système
- Sauvegardes serveur
- Configuration firewall, reverse proxy et TLS

### Option B : VPS Hetzner

Avantages :
- Excellent rapport prix/performance
- Infrastructure simple
- Bonne résilience réseau

Limite :
- Pas un fournisseur tunisien et support en anglais/allemand.

### Option C : Render / Railway + PostgreSQL géré

Avantages :
- Déploiement plus simple
- Base PostgreSQL gérée
- Mises à jour et certificats automatisés

Limites :
- Coût récurrent plus élevé à l'échelle
- Stockage de médias et migrations à bien concevoir
- Risque de cold start selon l'offre
- Moins de maîtrise réseau

### Option D : Vercel + API séparée + Neon/Supabase

Avantages :
- Frontend Next.js très simple à déployer
- CDN mondial
- PostgreSQL géré possible

Limites :
- Deux fournisseurs à administrer
- Coût potentiel selon trafic
- CORS, sessions et réseaux internes à configurer
- Ne simplifie pas obligatoirement le SMTP et les pièces jointes

## 3. Domaine

### Domaine recommandé

À réserver de préférence :

- `defendersacademy.tn`
- `defenders-academy.tn`
- `defendersacademy.com`
- variante `fitness.defendersacademy.tn` si le domaine principal existe déjà

Convention :

- `www.defendersacademy.tn` → redirection vers `defendersacademy.tn`
- `api.defendersacademy.tn` → API, si séparation DNS souhaitée
- `staging.defendersacademy.tn` → préproduction

Avant achat, vérifier la disponibilité et le propriétaire juridique auprès du centre. Activer le verrouillage du domaine, le WHOIS privacy si disponible et 2FA sur le compte registrar.

## 4. HTTPS et DNS

1. Acheter le domaine.
2. Ajouter le domaine à Cloudflare.
3. Créer les enregistrements A vers l'adresse IPv4 du VPS.
4. Activer uniquement HTTPS côté Cloudflare.
5. Configurer Nginx ou Traefik avec certificat Let's Encrypt.
6. Rediriger HTTP vers HTTPS.
7. Supprimer les ports Docker exposés en dehors de localhost.
8. N'exposer que `80/tcp` et `443/tcp`.

## 5. Architecture Docker de production

Services recommandés :

- `frontend` : Next.js
- `backend` : Express/Prisma
- `db` : PostgreSQL
- `proxy` : Nginx ou Traefik
- `backup` : service périodique de dump PostgreSQL
- `monitoring` : Uptime Kuma

Modifications obligatoires :

- Ajouter CORS avec les domaines production.
- Ajouter `NEXT_PUBLIC_SITE_URL` production.
- Configurer cookies `Secure`, `HttpOnly` et `SameSite=Lax`.
- Retirer les ports frontend/backend publics en production.
- Monter un volume PostgreSQL persistant.
- Monter les fichiers uploadés sur un volume persistant.
- Ne jamais inclure `.env` dans Git.
- Utiliser des mots de passe PostgreSQL uniques.

## 6. SMTP production

Option simple :

- Gmail Workspace ou Gmail avec App Password
- Domaine d'envoi vérifié
- SPF, DKIM et DMARC configurés

Option recommandée pour volume/fiabilité :

- Brevo Transactional, Mailgun, Postmark ou Amazon SES
- Démarrage depuis le domaine du centre
- Adresse de réponse vers la boîte administrative

Recommandation SMTP :

| Besoin | Solution |
|---|---|
| Volume faible, simplicité | Gmail Workspace |
| Fiabilité marketing/transactionnelle | Brevo ou Mailgun |
| Usage professionnel international | Postmark ou Amazon SES |

Pour Gmail :

- Utiliser un App Password dédié à l'application.
- Ne jamais committer l'identifiant ou le secret.
- Révoquer le mot de passe précédent exposé.
- Activer un alias de réponse tel que `contact@domaine.tn`.

## 7. Sauvegardes

- Sauvegarde PostgreSQL complète quotidiennement.
- Sauvegarde différentielle toutes les 6 à 12 heures si le volume le justifie.
- Conserver au moins 7 jours quotidiens et 4 sauvegardes mensuelles.
- Copier hors du serveur sur S3, Backblaze B2 ou stockage externe.
- Tester une restauration mensuellement.
- Sauvegarder les fichiers média et pièces si elles sont stockées.

## 8. Monitoring

Surveiller :

- Disponibilité HTTP frontend
- Santé `/api/health`
- PostgreSQL
- Espace disque
- RAM et CPU
- Certificat TLS
- Logs backend
- Échecs SMTP
- Taux 4xx/5xx

Outil recommandé :

- Uptime Kuma pour disponibilité
- Cloudflare Analytics pour trafic
- Grafana + Prometheus pour métriques détaillées
- Alertes e-mail Telegram, Slack ou autre canal opérationnel

## 9. CI/CD

Pipeline minimal :

1. Install
2. Lint
3. Build frontend
4. Build backend
5. Tests API
6. Tests E2E
7. Scan des dépendances
8. Build Docker
9. Déploiement staging
10. Smoke test
11. Déploiement production
12. Notification de résultat

Branches recommandées :

- `amenTasks` ou `main` : production
- `develop` : intégration
- `feature/*` : fonctionnalités
- `hotfix/*` : corrections urgentes

## 10. Coûts mensuels indicatifs

| Élément | Ordre de grandeur |
|---|---:|
| Domaine `.tn` ou `.com` | 10 à 40 EUR/an |
| VPS 4 vCPU / 8 Go | 20 à 50 EUR/mois |
| Sauvegarde objet externe | 3 à 15 EUR/mois |
| SMTP professionnel | 0 à 15 EUR/mois |
| Cloudflare gratuit | 0 EUR/mois |
| Monitoring externe | 0 à 15 EUR/mois |

Ces valeurs sont indicatives et doivent être validées avec les offres disponibles au moment de l'achat.
