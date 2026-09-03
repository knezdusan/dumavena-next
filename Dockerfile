# =============================================================================
# Dumavena — Dockerfile for Coolify
# =============================================================================
# Next.js standalone output, Node 24, non-root user, healthcheck.
# Simple portfolio site — no DB, no Playwright, no background jobs.
# =============================================================================

ARG NODE_VERSION=24-slim

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS deps

WORKDIR /app

# Copy lockfile first to leverage Docker layer caching.
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies for the build step).
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Builder
# ─────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js with standalone output.
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: Runner (minimal production image)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Install curl for Coolify's healthcheck probe.
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy static public assets.
COPY --from=builder --chown=node:node /app/public ./public

# Create .next with correct ownership for the prerender cache.
RUN mkdir -p .next && chown node:node .next

# Standalone server + traced node_modules (minimal, no full node_modules).
COPY --from=builder --chown=node:node /app/.next/standalone ./
# Static chunks (CSS, JS) served from .next/static.
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Switch to non-root user.
USER node

EXPOSE 3000

# Healthcheck — Next.js standalone server responds on the root path.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
