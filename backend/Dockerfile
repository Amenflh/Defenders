# syntax=docker/dockerfile:1

# ---- Étape 1 : dépendances complètes + client Prisma + compilation TypeScript ----
FROM node:24-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
# Génère le client Prisma (src/generated) puis compile vers dist/
RUN npm run build

# ---- Étape 2 : dépendances de production (inclut la CLI Prisma pour les migrations) ----
FROM node:24-alpine AS prod-deps
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Étape 3 : image finale légère, utilisateur non-root ----
FROM node:24-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json prisma.config.ts ./
COPY prisma ./prisma
# Logo intégré aux e-mails
COPY --from=build /app/src/assets ./src/assets

USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1
# Applique les migrations en attente, puis démarre l'API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
