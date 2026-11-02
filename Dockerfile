# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
# Baked into static routes (robots.ts, sitemap.ts, metadataBase) at build time —
# changing the domain requires rebuilding the image.
ARG BASE_URL=http://localhost:3000
ENV BASE_URL=${BASE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# One-shot migration runner: same context as builder (full node_modules and
# the drizzle/ folder). Used by the "migrate" compose service.
FROM builder AS migrate
CMD ["node", "scripts/migrate.mjs"]

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
ENV PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["node", "server.js"]
