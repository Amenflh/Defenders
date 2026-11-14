# syntax=docker/dockerfile:1

# ---- Étape 1 : dépendances complètes + client Prisma + compilation TypeScript ----
FROM node:24-alpine AS build
RUN apk add --no-cache openssl
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=$DATABASE_URL
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
# Génère le client Prisma (src/generated) puis compile vers dist/
RUN npm run build

# ---- Étape 2 : dépendances de production (inclut la CLI Prisma pour les migrations) ----
FROM build AS prod-deps
RUN npm prune --omit=dev

# ---- Étape 3 : image finale légère, utilisateur non-root ----
FROM node:24-alpine AS runner
RUN apk add --no-cache openssl su-exec
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/assets ./src/assets
COPY package.json prisma.config.ts ./
COPY prisma ./prisma
# Logo intégré aux e-mails
COPY --from=build /app/src/assets ./src/assets

# Dossier des fichiers téléversés (volume Docker), accessible à l'utilisateur node
RUN mkdir -p /app/uploads /app/private-uploads && chown node:node /app/uploads /app/private-uploads

EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1
# Le volume uploads peut être initialisé root par Docker ; corrige son propriétaire
# avant de lancer les migrations et l'API avec l'utilisateur non-root.
CMD ["sh", "-c", "mkdir -p /app/src/assets/uploads /app/private-uploads && chown node:node /app/src/assets/uploads /app/private-uploads && exec su-exec node sh -c 'npx prisma migrate deploy && node dist/server.js'"]
