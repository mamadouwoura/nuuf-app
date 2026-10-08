# syntax=docker/dockerfile:1
# Image de production de Nuuf : build multi-étapes, exécution sans privilèges.

ARG NODE_VERSION=24

# ---- 1. Dépendances (toutes, pour compiler) ----
FROM node:${NODE_VERSION}-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- 2. Compilation ----
FROM node:${NODE_VERSION}-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Valeurs factices : uniquement pour la génération du client Prisma et la compilation (aucune connexion).
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build" \
    SESSION_SECRET="valeur-de-compilation-uniquement-0123456789abcdef"
RUN npx prisma generate && npm run build

# ---- 3. Migrations de base de données (étape ponctuelle) ----
FROM build AS migrate
CMD ["npx", "prisma", "migrate", "deploy"]

# ---- 4. Exécution ----
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/sante').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
