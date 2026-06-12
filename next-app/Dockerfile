# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# Production image for the LangPath Next.js app (optional — Vercel does not use
# this). Relies on `output: "standalone"` in next.config.ts.
#
# Build:  docker build -t langpath .
# Run:    docker run -p 3000:3000 --env-file .env langpath
# Postgres is provided separately (docker-compose.yml or a managed instance).
# ─────────────────────────────────────────────────────────────────────────────

# ─── deps: install production-capable node_modules + generate Prisma client ───
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# `npm ci` runs the postinstall `prisma generate`.
RUN npm ci

# ─── builder: compile the Next.js app ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL is not needed at build time (no schema queries during build).
RUN npm run build

# ─── runner: minimal standalone runtime ──────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
# Run as the unprivileged node user shipped with the base image.
USER node

# Standalone server + static assets + public dir.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

EXPOSE 3000
# `server.js` is emitted by Next.js standalone output.
CMD ["node", "server.js"]
