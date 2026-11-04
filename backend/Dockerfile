# syntax=docker/dockerfile:1

# ---- Étape 1 : dépendances complètes + compilation TypeScript ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Étape 2 : dépendances de production uniquement ----
FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Étape 3 : image finale légère, utilisateur non-root ----
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=4000

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/assets ./src/assets
COPY package.json ./

USER node
EXPOSE 4000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1
CMD ["node", "dist/server.js"]
