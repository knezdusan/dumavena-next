# Handoff Document: Dumavena-Next Deployment & Coolify Migration

> **Purpose:** This document is for a fresh Devin session opened in the
> `/Users/knez/Documents/WebDev/dumavena/dumavena-next` project directory. It
> contains everything that session needs to:
>
> 1. Enhance the local project with AI tooling (MCP servers, skills, AGENTS.md)
> 2. Prepare the project for Docker deployment
> 3. Migrate the `dumavena.com` domain from DigitalOcean to the Hetzner VPS
> 4. Deploy the dumavena-next site to Coolify
> 5. Migrate the Coolify dashboard from `admin.vectormatch.dev` to
>    `admin.dumavena.com` (making it domain-agnostic, bound to the primary
>    identity domain rather than a specific app domain)
> 6. Verify both `vectormatch.dev` and `dumavena.com` are live and healthy
>
> **Critical constraint:** Both `vectormatch.dev` (existing app) and
> `dumavena.com` (new app) must be live and healthy when the transition is
> complete. The ordering of phases is designed to guarantee zero downtime for
> either domain.

---

## Table of Contents

1. [Project Context](#1-project-context)
2. [Infrastructure Summary](#2-infrastructure-summary)
3. [Architecture: How Coolify & Traefik Route Domains](#3-architecture-how-coolify--traefik-route-domains)
4. [Phase 1: Local AI Enhancement Setup](#phase-1-local-ai-enhancement-setup)
5. [Phase 2: Prepare dumavena-next for Docker Deployment](#phase-2-prepare-dumavena-next-for-docker-deployment)
6. [Phase 3: Migrate dumavena.com DNS to Hetzner](#phase-3-migrate-dumavenacom-dns-to-hetzner)
7. [Phase 4: Deploy dumavena-next to Coolify](#phase-4-deploy-dumavena-next-to-coolify)
8. [Phase 5: Migrate Coolify Dashboard to admin.dumavena.com](#phase-5-migrate-coolify-dashboard-to-admindumavenacom)
9. [Phase 6: Post-Deployment Verification](#phase-6-post-deployment-verification)
10. [Phase 7: Resend Domain Verification & Cleanup](#phase-7-resend-domain-verification--cleanup)
11. [Appendix A: Reference Configs](#appendix-a-reference-configs)
12. [Appendix B: Quick Command Reference](#appendix-b-quick-command-reference)
13. [Appendix C: Troubleshooting](#appendix-c-troubleshooting)

---

## 1. Project Context

**Dumavena-Next** is the portfolio website for Dumavena LLC (Dusan Knezevic's
web-dev portfolio), rebuilt from Laravel/Blade into Next.js 16. It is a
**simple static-dynamic hybrid site** — no database, no authentication, no
background jobs. The only dynamic feature is a contact form that sends email
via Resend.

### Tech Stack (as of Sep 2026)

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3.4 (App Router, Turbopack, React Compiler) |
| UI | React 19.2.8, Tailwind CSS v4 (CSS-first `@theme`, no JS config) |
| Language | TypeScript 5 (strict) |
| Animation | Motion (framer-motion successor) |
| Email | Resend |
| Validation | Zod 4 |
| Linter/Formatter | Biome 2.4.2 |
| Deployment target | Coolify (Docker) on Hetzner VPS |

### GitHub Repository

- **URL:** https://github.com/knezdusan/dumavena-next
- **Branch:** `main`
- **Remote:** `origin` → `https://github.com/knezdusan/dumavena-next.git`
- **Latest commit:** `319ae9e` (Readme file update)

### Pages

| Route | Purpose |
|---|---|
| `/` | Homepage (hero, services, portfolio, testimonials, contact) |
| `/about` | About page |
| `/faq` | FAQ page |
| `/privacy-policy` | Privacy policy |
| `/terms-of-services` | Terms of service |

### Environment Variables

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key for sending email |
| `CONTACT_FROM_EMAIL` | Sender address (must be verified in Resend) |
| `CONTACT_TO_EMAIL` | Recipient for contact form submissions |

> **Note:** The `.env` file already exists locally with real values. The
> `.env.example` is committed to the repo as a template. For Coolify, these
> will be set in the Coolify dashboard as runtime environment variables.

---

## 2. Infrastructure Summary

### Hetzner VPS (production target)

| Property | Value |
|---|---|
| **Server name** | `vector-match-CX33` |
| **Public IPv4** | `157.180.68.189` |
| **Public IPv6** | `2a01:4f9:c013:2d1f::1` |
| **SSH alias** | `vectormatch-vps` (configured in `~/.ssh/config`) |
| **SSH user** | `root` (key-based auth via `~/.ssh/id_ed25519`) |
| **Coolify version** | 4.1.2 |
| **Proxy** | Traefik v3.6.21 (managed by Coolify) |
| **Coolify dashboard (current)** | `https://admin.vectormatch.dev` |
| **Coolify dashboard (target)** | `https://admin.dumavena.com` |
| **Coolify MCP endpoint (current)** | `https://admin.vectormatch.dev/mcp` |
| **Coolify MCP token** | `1\|CjgLBfyxjp8dDxmtT6Rkjyl3YBGFsFZNNpWAraVcfd8e9e21` |

### SSH config (~/.ssh/config)

```
Host vectormatch-vps
    HostName 157.180.68.189
    User root
    IdentityFile ~/.ssh/id_ed25519
    LocalForward 15432 10.0.1.10:5432
```

### Current DNS state (as of Sep 3 2026)

| Domain | Nameservers | A Record | Points to | Status |
|---|---|---|---|---|
| `vectormatch.dev` | Cloudflare (`lou.ns.cloudflare.com`, `aitana.ns.cloudflare.com`) | Cloudflare proxy IPs | Hetzner VPS (157.180.68.189) | **Live, proxied through Cloudflare** |
| `admin.vectormatch.dev` | Cloudflare | Cloudflare proxy IPs | Hetzner VPS (Coolify dashboard) | **Live, proxied through Cloudflare** |
| `dumavena.com` | DigitalOcean (`ns1/2/3.digitalocean.com`) | `157.245.210.218` | DigitalOcean droplet (old Laravel) | **Live on DigitalOcean, to be migrated** |
| `www.dumavena.com` | DigitalOcean | `157.245.210.218` | DigitalOcean droplet | **Live on DigitalOcean** |

### Coolify current state

- **1 server:** `localhost` (uuid: `lqct1x9er0irqivojvwzp1p8`) — the Hetzner
  VPS itself; Coolify runs on the same host
- **1 project:** `VectorMatch` (uuid: `auf5w48fd3wriug75oei3d8o`)
- **1 application:** `vectormatch:main` (uuid:
  `o13urtthlj1q3md70gqeuca2`, running:healthy, FQDN: `https://vectormatch.dev`)
- **3 services:** flaresolverr, filebrowser, wordpress+mariadb
- **1 database:** PostgreSQL (container `z10g6zz09soe0ddwgpizteq2`, for
  VectorMatch, port 25432 external)
- **1 Redis:** (container `fynhnv9ws1q1kkk9ufy9d71p`, for VectorMatch rate
  limiting)

### Running containers on the VPS (as of Sep 3 2026)

```
coolify-proxy              — Traefik v3.6, ports 80/443/8080 (the reverse proxy)
coolify                    — Coolify dashboard, port 8000→8080
coolify-realtime           — WebSocket server, ports 6001-6002
coolify-redis              — Coolify's internal Redis
coolify-db                 — Coolify's internal PostgreSQL
coolify-sentinel           — Monitoring agent
o13urtthlj1q3md70gqeuca2   — VectorMatch Next.js app (port 3000 internal)
z10g6zz09soe0ddwgpizteq2   — VectorMatch PostgreSQL (port 25432 external)
fynhnv9ws1q1kkk9ufy9d71p   — VectorMatch Redis
flaresolverr               — Cloudflare bypass (port 8191)
filebrowser                — File manager (port 80 internal)
wordpress + mariadb        — WordPress site
```

### Key takeaway

The Hetzner VPS already runs Coolify with Traefik handling SSL/TLS via
Let's Encrypt (HTTP-01 challenge). Adding a new application is straightforward
— Coolify configures Traefik automatically to route the new domain and
provision certificates. **No manual Traefik or nginx configuration is needed.**

---

## 3. Architecture: How Coolify & Traefik Route Domains

Understanding this architecture is essential for the migration. The key
insight is that **the Coolify dashboard FQDN and application FQDNs are
completely independent** — changing one does not affect the other.

### Two separate routing mechanisms

#### A. Coolify Dashboard routing (dynamic config file)

The Coolify dashboard itself is routed via a **Traefik dynamic config file**
at `/data/coolify/proxy/dynamic/coolify.yaml`. This file is auto-generated by
Coolify based on the `instance_settings.fqdn` value in the Coolify database.

Current content (key excerpt):
```yaml
http:
  routers:
    coolify-http:
      rule: Host(`admin.vectormatch.dev`)
      service: coolify
    coolify-https:
      rule: Host(`admin.vectormatch.dev`)
      service: coolify
      tls:
        certresolver: letsencrypt
  services:
    coolify:
      loadBalancer:
        servers:
          - url: 'http://coolify:8080'
```

When you change the FQDN in the Coolify dashboard settings, Coolify
**regenerates this file** with the new domain and Traefik picks it up
automatically (file watcher).

#### B. Application routing (Docker container labels)

Each application deployed by Coolify gets Traefik routing via **Docker labels**
on its container. These are generated from the `applications.fqdn` column in
the database. Example (VectorMatch):

```yaml
labels:
  - traefik.http.routers.https-0-o13urtthlj1q3md70gqeuca2.rule=Host(`vectormatch.dev`)
  - traefik.http.routers.https-0-o13urtthlj1q3md70gqeuca2.tls.certresolver=letsencrypt
```

These labels live on the container, **not** in the dynamic config file. They
are completely independent of the Coolify dashboard FQDN.

### What this means for the migration

| Action | Affects dashboard? | Affects vectormatch.dev? | Affects dumavena.com? |
|---|---|---|---|
| Change `instance_settings.fqdn` | Yes (regenerates coolify.yaml) | No (container labels unchanged) | No (container labels unchanged) |
| Deploy dumavena-next app | No | No | Yes (new container with new labels) |
| Change DNS for dumavena.com | No | No | Yes (traffic routes to VPS) |

**The migration is safe:** changing the Coolify dashboard FQDN from
`admin.vectormatch.dev` to `admin.dumavena.com` only rewrites the dashboard
routing file. The VectorMatch app's container labels are untouched, so
`vectormatch.dev` continues serving without interruption.

### Where `admin.vectormatch.dev` is referenced (full inventory)

This is the complete list of places the old dashboard URL appears, verified
by searching the VPS filesystem and Coolify database on Sep 3 2026:

| # | Location | What it does | Auto-updated when FQDN changes? |
|---|---|---|---|
| 1 | `instance_settings.fqdn` (Coolify DB) | Source of truth for dashboard URL | **You change this in dashboard Settings** |
| 2 | `/data/coolify/proxy/dynamic/coolify.yaml` | Traefik routing rules for dashboard | **Auto-regenerated** by Coolify |
| 3 | `/data/coolify/proxy/acme.json` | Let's Encrypt SSL cert for old domain | **New cert auto-provisioned** for new domain |
| 4 | `COOLIFY_BASE_URL` env var on VectorMatch app | App→Coolify API callbacks (webhooks, notifications) | **Auto-updated** by Coolify |
| 5 | `vectormatch/.devin/mcp_config.local.json` (local Mac) | Devin MCP client config for VectorMatch project | **Manual update** (1 line) |
| 6 | `~/.config/devin/mcp_config.json` (global Devin config) | Global Devin MCP client config | **Manual update** (1 line) |

Items 1-4 are handled automatically by Coolify. Only items 5-6 require
manual updates on the local Mac (one line each).

---

## Phase 1: Local AI Enhancement Setup

The dumavena-next project currently has a minimal `AGENTS.md` (just the
auto-generated Next.js warning block). To give the Devin agent full access to
resources and latest documentation, the following enhancements are needed.

### 1.1 Create `.devin/` directory and MCP config

The `.devin/` directory is already in `.gitignore` (line: `.devin/`), so it
won't be committed. Create the MCP configuration files:

**File: `.devin/mcp_config.json`** (template with placeholders — safe to
commit, but `.devin/` is gitignored anyway)

```json
{
  "mcpServers": {
    "shadcn": {
      "transport": "STDIO",
      "command": "npx",
      "args": ["shadcn@latest", "mcp"]
    },
    "playwright": {
      "transport": "STDIO",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    },
    "coolify": {
      "url": "${COOLIFY_BASE_URL}/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer ${COOLIFY_MCP_TOKEN}"
      }
    }
  }
}
```

**File: `.devin/mcp_config.local.json`** (contains real secrets — gitignored
via `.devin/`)

> **IMPORTANT:** The Coolify MCP URL below uses `admin.vectormatch.dev`
> initially. After Phase 5 (Coolify dashboard migration), this must be updated
> to `admin.dumavena.com`. See Phase 5 Step 5 for the update.

```json
{
  "mcpServers": {
    "coolify": {
      "url": "https://admin.vectormatch.dev/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer 1|CjgLBfyxjp8dDxmtT6Rkjyl3YBGFsFZNNpWAraVcfd8e9e21"
      }
    }
  }
}
```

> **Note:** The MCP token (`1|CjgLBfyxjp8d...`) is tied to the Coolify
> instance, not the URL. It remains valid after the dashboard domain changes.

**File: `.devin/config.json`**

```json
{
  "version": 1,
  "permissions": {
    "allow": ["Exec(npx)", "Exec(npm)", "Exec(node)"]
  },
  "exclude": [
    "**/node_modules/**",
    "**/.next/**",
    "**/build/**",
    "**/dist/**",
    "**/.git/**",
    "**/package-lock.json"
  ]
}
```

### 1.2 Install relevant skills

The following skills from the VectorMatch project and global skill store are
relevant to dumavena-next. Copy them into `.devin/skills/`:

#### From VectorMatch (project-level skills to copy)

```bash
# Create the skills directory
mkdir -p .devin/skills

# These skills live in the VectorMatch project and are directly relevant:
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/next-best-practices \
      .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/next-cache-components \
      .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/shadcn \
      .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/vitest-best-practices \
      .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/playwright-e2e \
      .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/fallow \
      .devin/skills/
```

#### Already available globally (no action needed — Devin loads these
automatically)

These skills are in `~/.agents/skills/` and `~/.codeium/windsurf/skills/` and
are available to all projects:

- `frontend-design` — Create distinctive, production-grade frontend interfaces
- `web-design-guidelines` — Review UI for accessibility and design compliance
- `vercel-react-best-practices` — React/Next.js performance optimization
- `vercel-composition-patterns` — React composition patterns that scale
- `find-skills` — Discover and install new skills

#### Skills NOT relevant to dumavena-next (do NOT copy)

- `better-auth-best-practices` — No authentication in this project
- `better-auth-security-best-practices` — No authentication
- `create-auth-skill` — No authentication
- `email-and-password-best-practices` — No authentication
- `database-schema-mermaid` — No Drizzle ORM / no database
- `turborepo` — Not a monorepo

### 1.3 Enhance AGENTS.md

The current `AGENTS.md` only has the auto-generated Next.js warning block.
Replace it with a comprehensive version tailored to this project. The
auto-generated block (between `<!-- BEGIN:nextjs-agent-rules -->` and
`<!-- END:nextjs-agent-rules -->`) **must be preserved** — `next dev`
re-creates it if missing. Add the project-specific rules below that block.

**Recommended `AGENTS.md` content:**

```markdown
<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices.

This block is written and re-added by `next dev` — verify at
`node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a
diff only re-creates the uncommitted change; committing it with your work keeps
the tree clean.

<!-- END:nextjs-agent-rules -->

# Dumavena — Portfolio Website (Next.js 16)

## Project Overview
Dumavena LLC portfolio website — a static-dynamic hybrid Next.js site with a
Resend-powered contact form. No database, no authentication, no background
jobs. Deployed via Coolify (Docker) on a Hetzner VPS.

## Technology Stack
- **Next.js 16.3.4** (App Router, Turbopack, React Compiler)
- **React 19.2.8** + **TypeScript 5** (strict)
- **Tailwind CSS v4** (CSS-first `@theme` in `app/globals.css` — NO
  `tailwind.config.js` or `tailwind.config.ts`)
- **Motion** for animations (framer-motion successor)
- **Resend** for transactional email (contact form)
- **Zod 4** for server-side form validation
- **Biome 2.4.2** for linting + formatting (never ESLint/Prettier)

## CRITICAL: Destructive Operations Prohibition
NEVER perform irreversible destructive operations without explicit user
confirmation. This includes:
- Deleting directories, files, or git branches
- Force-pushing or rewriting git history
- Running `rm -rf` or bulk-deleting files
- NEVER run git commands (add, commit, push, checkout, etc.) — version control
  is the user's responsibility.

## Core Architecture Rules
- Use **App Router** exclusively (`app/` directory)
- **Server Components by default** — add `"use client"` only when necessary
- Contact form uses a **Server Action** (`app/actions.ts`) with Zod validation
- No database — all content is in `lib/content.ts`
- Rate limiting is in-memory (3 submissions per 10 minutes per IP)

## Coding Standards
- **Formatting**: Always use Biome (`biome check --write`)
- **Naming**: `camelCase` for variables/functions, `PascalCase` for components
- **Error Handling**: Always handle errors gracefully (see `app/actions.ts` for
  the Resend error handling pattern)
- **Types**: Strict TypeScript + Zod for all external/form data

## Tailwind CSS v4 Compliance
- **No JS Configurations:** Never create `tailwind.config.js` or
  `tailwind.config.ts`.
- **Theme Extensions:** All custom colors, spacing, and typography are in
  `app/globals.css` using `@theme` / CSS custom properties.
- **Design tokens:** See `:root` in `app/globals.css` for the color system
  (base, surface, surface-raised, border, text, text-secondary, text-muted,
  accent, accent-soft, accent-glow).

## Deployment
- **Target:** Coolify v4.1.2 on Hetzner VPS (157.180.68.189)
- **Build pack:** Dockerfile (see `Dockerfile` in repo root)
- **Port:** 3000
- **Domain:** `https://dumavena.com`
- **Coolify dashboard:** `https://admin.dumavena.com` (after Phase 5 migration;
  initially `https://admin.vectormatch.dev`)
- **Coolify MCP:** Available via `.devin/mcp_config.local.json` for read-only
  infrastructure queries (list applications, check status, etc.)

## Environment Variables (runtime, set in Coolify dashboard)
| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `CONTACT_FROM_EMAIL` | Sender address (verified in Resend) |
| `CONTACT_TO_EMAIL` | Recipient for contact form |

## Resources & References
- **Next.js 16 docs:** Read `node_modules/next/dist/docs/` before writing code
- **Tailwind CSS v4:** https://tailwindcss.com/docs
- **Resend:** https://resend.com/docs
- **Biome:** https://biomejs.dev/
- **Motion:** https://motion.dev/
- **Coolify:** https://coolify.io/docs/
```

### 1.4 Verify `.gitignore` covers Devin artifacts

The existing `.gitignore` already contains:

```
# devin-specific (MCP config, skills, local overrides)
.devin/
skills-lock.json
```

This is correct — no changes needed. The `.devin/` directory with MCP configs
and skills will stay local only and never be committed.

### 1.5 Verify the setup

After creating the files, the Devin agent in the new session should:

1. **Confirm MCP servers are loaded** — the Coolify MCP server should be
   available, allowing read-only queries to the Coolify infrastructure.
2. **Confirm skills are discoverable** — run `skill list` to see all available
   skills.
3. **Test Coolify MCP connectivity** — call `get_infrastructure_overview` to
   verify the agent can see the Coolify setup (1 server, 1 project, 1 app).

---

## Phase 2: Prepare dumavena-next for Docker Deployment

The project currently has **no Dockerfile** and `next.config.ts` does not have
`output: "standalone"`. Both are needed for Coolify's Dockerfile build pack.

### 2.1 Add `output: "standalone"` to next.config.ts

**Current `next.config.ts`:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
```

**Required change — add `output: "standalone"`:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
```

> **Why:** `output: "standalone"` tells Next.js to produce a minimal
> self-contained server in `.next/standalone/` that includes only the needed
> `node_modules` files. This is the standard pattern for Docker deployments
> and is what the VectorMatch Dockerfile uses.

### 2.2 Create a Dockerfile

This is a **much simpler** Dockerfile than VectorMatch's (no Playwright, no
pg-boss, no PostgreSQL client). Create this file in the project root:

**File: `Dockerfile`**

```dockerfile
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
```

### 2.3 Create `.dockerignore`

**File: `.dockerignore`**

```
.git
.gitignore
.gitattributes

.next
.next/cache
out
build
dist

node_modules

.env
.env.*
!.env.example

coverage
test-results
playwright-report

.vscode
.idea
*.swp
*.swo
.DS_Store

.devin
skills-lock.json

*.log
npm-debug.log*
.DS_Store
README.md
AGENTS.md
CLAUDE.md
HANDOFF_DEVIN_SETUP.md
```

### 2.4 Verify the build locally

Before pushing to GitHub and deploying via Coolify, verify the Docker build
works locally:

```bash
# Build the image
docker build -t dumavena-next .

# Run it locally (env vars from .env file)
docker run -p 3001:3000 \
  --env-file .env \
  dumavena-next

# Test in browser: http://localhost:3001
# The contact form won't send email unless RESEND_API_KEY is valid,
# but the site itself should render correctly.
```

### 2.5 Commit and push

After verifying the build, the user should commit and push the new files
(`Dockerfile`, `.dockerignore`, updated `next.config.ts`) to GitHub. **The
Devin agent must NOT run git commands** — remind the user to do this manually.

The user should run:
```bash
git add Dockerfile .dockerignore next.config.ts
git commit -m "Add Dockerfile and standalone output for Coolify deployment"
git push origin main
```

---

## Phase 3: Migrate dumavena.com DNS to Hetzner

> **Why this comes before deployment:** Coolify's Traefik needs the domain to
> resolve to the VPS before it can provision an SSL certificate via Let's
> Encrypt HTTP-01 challenge. If you deploy the app first without DNS pointing
> to the VPS, the certificate provisioning will fail.

This phase makes `dumavena.com` (and `www.dumavena.com` and
`admin.dumavena.com`) point to the Hetzner VPS. The old Laravel site on
DigitalOcean will stop being served for these domains once DNS propagates.

### 3.1 Choose DNS approach

#### Option A: Keep DigitalOcean DNS, change A records (simplest, fastest)

Just update the A records in the DigitalOcean DNS dashboard to point to the
Hetzner VPS IP.

**Steps:**
1. Log in to DigitalOcean dashboard → **Networking** → **Domains** →
   `dumavena.com`
2. Find the **A record** for `dumavena.com` (the root domain)
3. Change the IP from `157.245.210.218` → `157.180.68.189`
4. Find the **A record** for `www.dumavena.com` (if it exists)
5. Change the IP from `157.245.210.218` → `157.180.68.189`
6. **Add a new A record:** `admin.dumavena.com` → `157.180.68.189`
   (This is for the Coolify dashboard migration in Phase 5)
7. Save
8. Wait for DNS propagation (usually 5-30 minutes for DigitalOcean's TTL;
   up to 48 hours globally)
9. Verify: `dig dumavena.com A` should return `157.180.68.189`
10. Verify: `dig admin.dumavena.com A` should return `157.180.68.189`

**Pros:** Simple, no NS migration, fastest propagation
**Cons:** DNS stays on DigitalOcean (not consolidated with Cloudflare where
vectormatch.dev lives); no CDN/DDoS protection

#### Option B: Migrate DNS to Cloudflare (recommended for consistency)

This consolidates all domains under Cloudflare, matching how
`vectormatch.dev` is managed. Also gives CDN, DDoS protection, and caching.

**Steps:**
1. **In Cloudflare:**
   - Log in to Cloudflare dashboard
   - Click **"Add a site"** → enter `dumavena.com`
   - Select the **Free plan** (or Pro if desired)
   - Cloudflare will scan existing DNS records — review them
   - **Set/verify these A records** (all pointing to Hetzner VPS):
     ```
     dumavena.com         A  157.180.68.189  (proxied = orange cloud)
     www.dumavena.com     A  157.180.68.189  (proxied = orange cloud)
     admin.dumavena.com   A  157.180.68.189  (proxied = orange cloud)
     ```
   - Cloudflare will assign nameservers (e.g., `xxx.ns.cloudflare.com` and
     `yyy.ns.cloudflare.com`)

2. **At the domain registrar:**
   - Change the nameservers for `dumavena.com` from
     `ns1/2/3.digitalocean.com` to the Cloudflare-assigned nameservers
   - This is done at wherever the domain is registered (DigitalOcean domains,
     or the original registrar if the domain was registered elsewhere and just
     using DigitalOcean DNS)

3. **Wait for NS propagation** (can take 1-48 hours, usually 1-4 hours)

4. **In Cloudflare, set SSL/TLS mode:**
   - Go to **SSL/TLS** → **Overview**
   - Set to **"Full"** (not "Flexible" — Coolify/Traefik handles SSL on the
     origin with Let's Encrypt)
   - This matches the vectormatch.dev setup

5. **Verify:**
   - `dig dumavena.com NS` should show Cloudflare nameservers
   - `dig dumavena.com A` should show Cloudflare proxy IPs (not the raw VPS IP
     — this is expected with Cloudflare proxy enabled)
   - `dig admin.dumavena.com A` should show Cloudflare proxy IPs

**Pros:** Consolidated DNS management, CDN, DDoS protection, matches
vectormatch.dev setup
**Cons:** Longer migration time (NS propagation), more steps

### 3.2 DNS records summary (regardless of option chosen)

| Record | Type | Value | Purpose |
|---|---|---|---|
| `dumavena.com` | A | `157.180.68.189` | Main website |
| `www.dumavena.com` | A | `157.180.68.189` | WWW redirect to main |
| `admin.dumavena.com` | A | `157.180.68.189` | Coolify dashboard (Phase 5) |

> **If using Cloudflare (Option B):** All three should be proxied (orange
> cloud). The `dig` command will show Cloudflare's proxy IPs, not the raw VPS
> IP — this is correct and expected.

### 3.3 Verify DNS propagation before proceeding

```bash
# Check that dumavena.com resolves to the Hetzner VPS
dig dumavena.com A

# If using Option A (DigitalOcean DNS), should return: 157.180.68.189
# If using Option B (Cloudflare), should return Cloudflare proxy IPs

# Check admin subdomain
dig admin.dumavena.com A

# Check NS (if Option B)
dig dumavena.com NS
# Should show Cloudflare nameservers
```

**Do NOT proceed to Phase 4 until DNS is fully propagated.** Coolify needs the
domain to resolve to the VPS to provision SSL certificates.

---

## Phase 4: Deploy dumavena-next to Coolify

> **Prerequisite:** Phase 3 is complete — `dumavena.com` DNS is pointing to
> the Hetzner VPS and propagation is verified.
>
> **Note:** The Coolify dashboard is still accessible at
> `https://admin.vectormatch.dev` at this point. The dashboard migration
> happens in Phase 5, after dumavena-next is deployed and verified.

### 4.1 Create a new Coolify project (recommended)

For cleanliness, create a separate Coolify project for Dumavena (rather than
adding it to the VectorMatch project). This can be done via the Coolify
dashboard:

1. Log in to `https://admin.vectormatch.dev`
2. Click **"New Project"** → Name it **"Dumavena"** → Create

Alternatively, the Dumavena app can be added to the existing "VectorMatch"
project. The choice is organizational — Coolify projects are just groupings.

### 4.2 Create a new application in Coolify

1. In the Coolify dashboard, go to the project (new "Dumavena" or existing
   "VectorMatch")
2. Click **"New Resource"** → **"Dockerfile"** (or "GitHub Repository" if
   Coolify has GitHub integration set up)
3. **If using GitHub integration:**
   - Select repository: `knezdusan/dumavena-next`
   - Branch: `main`
   - Build Pack: **Dockerfile**
   - Dockerfile location: `/Dockerfile`
   - Port exposes: `3000`
4. **If using manual Dockerfile:**
   - Connect the GitHub repo or paste the Dockerfile content
   - Set the same settings as above

### 4.3 Configure the application

Set the following in the Coolify application settings:

| Setting | Value |
|---|---|
| **Name** | `dumavena:main` (or similar) |
| **FQDN** | `https://dumavena.com` |
| **Build Pack** | `Dockerfile` |
| **Dockerfile location** | `/Dockerfile` |
| **Port exposes** | `3000` |
| **Base directory** | `/` |
| **Health check path** | `/` |
| **Health check port** | `3000` |
| **Health check method** | `GET` |
| **Health check return code** | `200` |
| **Health check scheme** | `http` |
| **Health check enabled** | `true` |
| **Redirect** | `both` (HTTP → HTTPS, www → non-www) |

### 4.4 Set environment variables in Coolify

In the Coolify application's **"Environment Variables"** tab, add:

```
RESEND_API_KEY=<the actual key from the local .env file>
CONTACT_FROM_EMAIL=Dumavena <onboarding@resend.dev>
CONTACT_TO_EMAIL=info@dumavena.com
```

> **Note on `CONTACT_FROM_EMAIL`:** Use the Resend testing sender
> (`onboarding@resend.dev`) initially, because `dumavena.com` is not yet
> verified in Resend. After Phase 7 (Resend domain verification), switch to
> `Dumavena <noreply@dumavena.com>`.

### 4.4a Also add the www domain

In the Coolify application's FQDN field, add both domains (comma-separated):
```
https://dumavena.com,https://www.dumavena.com
```

This tells Traefik to route both `dumavena.com` and `www.dumavena.com` to the
same container. The `redirect: both` setting will handle www → non-www
redirection automatically.

### 4.5 Deploy

1. Click **"Deploy"** in the Coolify dashboard
2. Watch the build logs — the Docker build should complete in 1-3 minutes
3. Once deployed, Coolify's Traefik proxy will automatically:
   - Route `dumavena.com` traffic to the container on port 3000
   - Provision a Let's Encrypt SSL certificate (via HTTP-01 challenge — works
     because DNS is already pointing to the VPS from Phase 3)
   - Route `www.dumavena.com` traffic and redirect to `dumavena.com`
4. The health check should pass within 30 seconds

### 4.6 Verify the deployment

```bash
# Check that the site loads over HTTPS
curl -I https://dumavena.com

# Check www redirect
curl -I https://www.dumavena.com
# Should return a 301/302 redirect to https://dumavena.com

# Check HTTP → HTTPS redirect
curl -I http://dumavena.com
# Should return a 301 redirect to https://dumavena.com
```

### 4.7 Verify via Coolify MCP

The Devin agent can verify the deployment status using the Coolify MCP server:

```
# List all applications to find the new dumavena app
mcp_call_tool("coolify", "list_applications", {})

# Get details of the new application (use the UUID from the list)
mcp_call_tool("coolify", "get_application", {"uuid": "<uuid>"})
```

Check that:
- `status` is `running:healthy`
- `fqdn` is `https://dumavena.com,https://www.dumavena.com`
- `git_repository` is `knezdusan/dumavena-next`
- `git_branch` is `main`

### 4.8 Functional verification

- [ ] `https://dumavena.com` loads the homepage (hero, services, portfolio)
- [ ] `https://dumavena.com/about` loads
- [ ] `https://dumavena.com/faq` loads
- [ ] `https://dumavena.com/privacy-policy` loads
- [ ] `https://dumavena.com/terms-of-services` loads
- [ ] SSL certificate is valid (no browser warnings)
- [ ] `https://www.dumavena.com` redirects to `https://dumavena.com`
- [ ] HTTP redirects to HTTPS
- [ ] Fonts load correctly (Fraunces + Geist)
- [ ] Images load from `/images/` path
- [ ] Metadata is correct (view page source — title, description, OpenGraph)
- [ ] Coolify dashboard shows the app as `running:healthy`

**Do NOT proceed to Phase 5 until dumavena.com is fully verified and working.**
The Coolify dashboard migration in Phase 5 will briefly interrupt dashboard
access, so we want the dumavena-next app to be stable first.

---

## Phase 5: Migrate Coolify Dashboard to admin.dumavena.com

> **Prerequisite:** Phase 4 is complete — dumavena-next is deployed, healthy,
> and accessible at `https://dumavena.com`.
>
> **Prerequisite:** `admin.dumavena.com` DNS is pointing to the Hetzner VPS
> (set in Phase 3).
>
> **What this phase does:** Moves the Coolify admin dashboard from
> `admin.vectormatch.dev` to `admin.dumavena.com`. This makes Coolify
> domain-agnostic — bound to the primary identity domain (dumavena.com)
> rather than a specific app domain (vectormatch.dev).
>
> **Risk to vectormatch.dev:** **Zero.** The VectorMatch app's Traefik routing
> is defined by Docker container labels, not by the dashboard's dynamic config
> file. Changing the dashboard FQDN only rewrites `coolify.yaml` (the dashboard
> routing file). The VectorMatch container's labels are untouched.
>
> **Downtime:** Brief (seconds to ~1 minute) for the Coolify dashboard only,
> while Traefik reloads and the new SSL cert is provisioned. Existing apps
> (vectormatch.dev, dumavena.com) keep serving without interruption.

### 5.1 Pre-migration checklist

Before changing the FQDN, verify:

- [ ] `dig admin.dumavena.com A` returns the VPS IP (or Cloudflare proxy IPs)
- [ ] `https://dumavena.com` is live and healthy (Phase 4 verified)
- [ ] `https://vectormatch.dev` is live and healthy
- [ ] You have SSH access to the VPS (`ssh vectormatch-vps`) as a fallback
- [ ] You know the VPS IP for emergency dashboard access:
      `http://157.180.68.189:8000`

### 5.2 Change the Coolify FQDN

1. Log in to the Coolify dashboard at `https://admin.vectormatch.dev`
2. Go to **Settings** → **Instance Settings** (or look for "Instance FQDN"
   in the settings page)
3. Find the **FQDN** field (currently set to `https://admin.vectormatch.dev`)
4. Change it to: `https://admin.dumavena.com`
5. **Save**

### 5.3 What Coolify does automatically (no manual action needed)

When you save the new FQDN, Coolify will:

1. **Update `instance_settings.fqdn`** in the database
2. **Regenerate `/data/coolify/proxy/dynamic/coolify.yaml`** with
   `Host(\`admin.dumavena.com\`)` rules (replacing all 6 occurrences of
   `admin.vectormatch.dev`)
3. **Traefik detects the file change** (file watcher) and reloads its config
4. **Provision a new Let's Encrypt SSL certificate** for `admin.dumavena.com`
   via HTTP-01 challenge (works because DNS is already pointing to the VPS)
5. **Update the `COOLIFY_BASE_URL` environment variable** on all applications
   (currently only the VectorMatch app has this var) to
   `https://admin.dumavena.com`

Steps 1-3 happen in seconds. Step 4 (cert provisioning) takes 5-30 seconds.
During this brief window, the dashboard may be inaccessible. Existing apps
are unaffected.

### 5.4 Verify the new dashboard URL

```bash
# Wait ~30 seconds after saving, then:
curl -I https://admin.dumavena.com
# Should return 200 OK with a valid SSL certificate

# Try loading it in a browser — should show the Coolify login/dashboard
```

If it doesn't work immediately, wait 1-2 minutes for cert provisioning and
try again. If it still doesn't work after 5 minutes, see Troubleshooting
(Appendix C).

### 5.5 Verify vectormatch.dev is still working

```bash
curl -I https://vectormatch.dev
# Should still return 200 OK — this app is unaffected by the dashboard migration
```

### 5.6 Verify dumavena.com is still working

```bash
curl -I https://dumavena.com
# Should still return 200 OK
```

### 5.7 Verify the old admin URL is no longer routing

```bash
curl -I https://admin.vectormatch.dev
# Should NOT return the Coolify dashboard anymore.
# It may return a 503 (default_redirect_503.yaml catchall) or a connection
# error — this is expected and correct.
```

> **Note:** The `admin.vectormatch.dev` subdomain DNS still points to the VPS
> (via Cloudflare), but Traefik no longer has a routing rule for it. The
> catchall rule in `default_redirect_503.yaml` will return a 503 for any
> unrecognized host. This is expected behavior.

### 5.8 Update local Devin MCP configs

Two files on the local Mac need to be updated with the new Coolify URL:

**File 1:** `/Users/knez/Documents/WebDev/vectormatch/.devin/mcp_config.local.json`

Change the `url` from `https://admin.vectormatch.dev/mcp` to
`https://admin.dumavena.com/mcp`:

```json
{
  "mcpServers": {
    "coolify": {
      "url": "https://admin.dumavena.com/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer 1|CjgLBfyxjp8dDxmtT6Rkjyl3YBGFsFZNNpWAraVcfd8e9e21"
      }
    }
  }
}
```

**File 2:** `~/.config/devin/mcp_config.json`

Change the `url` from `https://admin.vectormatch.dev/mcp` to
`https://admin.dumavena.com/mcp`:

```json
{
  "mcpServers": {
    "coolify": {
      "url": "https://admin.dumavena.com/mcp",
      "headers": {
        "Authorization": "Bearer ${file:~/.config/coolify/mcp_token}"
      }
    }
  }
}
```

> **Note:** The MCP token stays the same — it's tied to the Coolify instance,
> not the URL.

**File 3:** `/Users/knez/Documents/WebDev/dumavena/dumavena-next/.devin/mcp_config.local.json`

If this file was created in Phase 1 with the old URL, update it too:

```json
{
  "mcpServers": {
    "coolify": {
      "url": "https://admin.dumavena.com/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer 1|CjgLBfyxjp8dDxmtT6Rkjyl3YBGFsFZNNpWAraVcfd8e9e21"
      }
    }
  }
}
```

### 5.9 Update the AGENTS.md references

If the `AGENTS.md` created in Phase 1.3 references `https://admin.vectormatch.dev`
as the Coolify dashboard URL, update it to `https://admin.dumavena.com`.

### 5.10 Post-migration verification summary

| URL | Expected result | Status |
|---|---|---|
| `https://admin.dumavena.com` | Coolify dashboard loads | [ ] |
| `https://vectormatch.dev` | VectorMatch app loads | [ ] |
| `https://dumavena.com` | Dumavena Next.js site loads | [ ] |
| `https://www.dumavena.com` | Redirects to `https://dumavena.com` | [ ] |
| `https://admin.vectormatch.dev` | 503 or no response (expected) | [ ] |
| Coolify MCP via Devin | `get_infrastructure_overview` works | [ ] |

---

## Phase 6: Post-Deployment Verification

After all phases are complete, do a final end-to-end verification of both
domains and the Coolify dashboard.

### 6.1 vectormatch.dev (existing app — must be unaffected)

- [ ] `https://vectormatch.dev` loads the VectorMatch homepage
- [ ] SSL certificate is valid
- [ ] Login/auth flows work (if applicable)
- [ ] No errors in browser console
- [ ] Coolify dashboard shows vectormatch app as `running:healthy`

### 6.2 dumavena.com (new app)

- [ ] `https://dumavena.com` loads the homepage
- [ ] `https://dumavena.com/about` loads
- [ ] `https://dumavena.com/faq` loads
- [ ] `https://dumavena.com/privacy-policy` loads
- [ ] `https://dumavena.com/terms-of-services` loads
- [ ] SSL certificate is valid (no browser warnings)
- [ ] `https://www.dumavena.com` redirects to `https://dumavena.com`
- [ ] HTTP redirects to HTTPS
- [ ] Fonts load correctly (Fraunces + Geist)
- [ ] Images load from `/images/` path
- [ ] Metadata is correct (view page source — title, description, OpenGraph)
- [ ] Coolify dashboard shows dumavena app as `running:healthy`

### 6.3 Coolify dashboard (new URL)

- [ ] `https://admin.dumavena.com` loads the Coolify login page
- [ ] Can log in with existing credentials
- [ ] Both applications visible in the dashboard
- [ ] Both applications show `running:healthy`
- [ ] Coolify MCP works from Devin (call `get_infrastructure_overview`)

### 6.4 Contact form (dumavena.com)

- [ ] Submit the contact form with valid data → success message appears
- [ ] Email is received at `info@dumavena.com` (if Resend is configured with
      the testing sender — check the Resend dashboard for delivery logs)
- [ ] Submit with empty fields → validation errors appear
- [ ] Submit with invalid email → validation error appears
- [ ] Submit 4 times rapidly → rate limit message appears (3 per 10 min)

---

## Phase 7: Resend Domain Verification & Cleanup

### 7.1 Verify dumavena.com in Resend

To use `noreply@dumavena.com` as the sender (instead of the testing
`onboarding@resend.dev`), the domain must be verified in Resend.

**Steps:**
1. Log in to Resend → **Domains** → **Add Domain** → enter `dumavena.com`
2. Resend will provide DNS records to add (typically):
   - **SPF** (TXT record)
   - **DKIM** (CNAME or TXT records)
   - **DMARC** (TXT record, optional but recommended)
3. Add these records to the DNS provider:
   - If Option A (DigitalOcean DNS): add in DigitalOcean dashboard
   - If Option B (Cloudflare): add in Cloudflare dashboard
4. Wait for verification (usually 5-30 minutes — Resend will show "Verified"
   when the DNS records propagate)
5. In the Coolify dashboard, update the dumavena-next app's environment
   variable:
   ```
   CONTACT_FROM_EMAIL=Dumavena <noreply@dumavena.com>
   ```
   (was previously `Dumavena <onboarding@resend.dev>`)
6. Redeploy the dumavena-next app (or restart it) for the env var to take
   effect

### 7.2 Decommission the old DigitalOcean droplet (optional)

**Only after confirming the new site is fully working:**
1. Verify `https://dumavena.com` loads the Next.js site (not Laravel)
2. Verify the contact form works
3. Verify all pages load correctly
4. Then — at the user's discretion — power off or destroy the DigitalOcean
   droplet serving the old Laravel site

> **Do NOT destroy the DigitalOcean droplet until the user explicitly
> confirms the new site is working and they want the old one removed.**

### 7.3 Clean up the old admin.vectormatch.dev DNS record (optional)

After confirming `admin.dumavena.com` is working as the Coolify dashboard, you
can optionally remove the `admin.vectormatch.dev` DNS record from Cloudflare
(since nothing is serving it anymore). Or leave it — it's harmless and could
serve as a fallback if you ever need to temporarily revert.

---

## Appendix A: Reference Configs

### A.1 VectorMatch Coolify Application Config (reference)

The existing VectorMatch application on Coolify serves as a reference for how
a Next.js app is configured:

| Setting | VectorMatch Value | Dumavena Target Value |
|---|---|---|
| UUID | `o13urtthlj1q3md70gqeuca2` | (new UUID) |
| Name | `vectormatch:main-o13urtthlj1q3md70gqeuca2` | `dumavena:main` |
| FQDN | `https://vectormatch.dev` | `https://dumavena.com,https://www.dumavena.com` |
| Git repository | `knezdusan/vectormatch` | `knezdusan/dumavena-next` |
| Git branch | `main` | `main` |
| Build pack | `dockerfile` | `dockerfile` |
| Dockerfile location | `/Dockerfile` | `/Dockerfile` |
| Port exposes | `3000` | `3000` |
| Health check path | `/api/health` | `/` |
| Health check port | `3000` | `3000` |
| Health check return code | `200` | `200` |
| Redirect | `both` | `both` |
| Status | `running:healthy` | (target: `running:healthy`) |

> **Note:** VectorMatch has a dedicated `/api/health` endpoint. Dumavena-next
> does not have one — the health check uses the root path `/` which returns
> 200 on the homepage. If desired, a dedicated `/api/health` route can be
> added later, but the root path works fine for a simple portfolio site.

### A.2 Coolify instance settings (current vs target)

| Setting | Current value | Target value (after Phase 5) |
|---|---|---|
| `instance_settings.fqdn` | `https://admin.vectormatch.dev` | `https://admin.dumavena.com` |
| `instance_settings.instance_name` | `VectorMatch - Coolify` | `Dumavena - Coolify` (optional) |
| `instance_settings.public_ipv4` | `157.180.68.189` | (unchanged) |
| `instance_settings.public_ipv6` | `2a01:4f9:c013:2d1f::1` | (unchanged) |
| `instance_settings.is_mcp_server_enabled` | `true` | (unchanged) |

### A.3 Traefik dynamic config (auto-generated)

The file `/data/coolify/proxy/dynamic/coolify.yaml` is auto-generated by
Coolify. After the Phase 5 migration, it will contain `Host(\`admin.dumavena.com\`)`
instead of `Host(\`admin.vectormatch.dev\`)`. **Never edit this file manually**
— Coolify will overwrite it. Always change the FQDN via the dashboard.

### A.4 SSH access to VPS

```bash
# Standard SSH (with port forwarding for Postgres tunnel)
ssh vectormatch-vps

# SSH without port forwarding (faster for general commands)
ssh -o ClearAllForwardings=yes vectormatch-vps

# Emergency Coolify access (if dashboard domain is broken)
# Coolify's internal HTTP port is 8000, accessible on the VPS directly
ssh -L 8000:localhost:8000 vectormatch-vps
# Then open http://localhost:8000 in browser
```

---

## Appendix B: Quick Command Reference

```bash
# === Phase 1: Local AI setup ===
mkdir -p .devin/skills
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/next-best-practices .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/next-cache-components .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/shadcn .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/vitest-best-practices .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/playwright-e2e .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/fallow .devin/skills/

# === Phase 2: Docker build verification ===
docker build -t dumavena-next .
docker run -p 3001:3000 --env-file .env dumavena-next
# Open http://localhost:3001

# === Phase 3: DNS verification ===
dig dumavena.com A
dig www.dumavena.com A
dig admin.dumavena.com A
dig dumavena.com NS  # if using Cloudflare

# === Phase 4: Deployment verification ===
curl -I https://dumavena.com
curl -I https://www.dumavena.com  # should redirect
curl -I http://dumavena.com       # should redirect to HTTPS

# === Phase 5: Coolify dashboard migration verification ===
curl -I https://admin.dumavena.com   # should return 200
curl -I https://admin.vectormatch.dev # should return 503 or no response
curl -I https://vectormatch.dev       # should still return 200

# === Phase 6: Final verification ===
# Via Coolify MCP (Devin):
#   mcp_call_tool("coolify", "get_infrastructure_overview", {})
#   mcp_call_tool("coolify", "list_applications", {})

# === SSH to VPS (emergency/fallback) ===
ssh vectormatch-vps
ssh -L 8000:localhost:8000 vectormatch-vps  # emergency Coolify access

# === Check running containers on VPS ===
ssh vectormatch-vps "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
```

---

## Appendix C: Troubleshooting

### C.1 Coolify dashboard not loading at admin.dumavena.com after migration

**Symptom:** `https://admin.dumavena.com` returns a 503, timeout, or SSL error
after changing the FQDN in Coolify settings.

**Possible causes and fixes:**

1. **DNS not propagated:** Verify `dig admin.dumavena.com A` returns the VPS
   IP (or Cloudflare IPs if proxied). If not, wait for DNS propagation.

2. **SSL cert not yet provisioned:** Let's Encrypt HTTP-01 challenge can take
   up to 60 seconds. Wait 2-3 minutes and retry.

3. **Cloudflare proxy interfering with HTTP-01 challenge:** If using
   Cloudflare (Option B), the proxy might intercept the HTTP-01 challenge.
   Temporarily set the `admin.dumavena.com` record to **DNS only** (grey cloud)
   in Cloudflare, let the cert provision, then re-enable proxying.

4. **Traefik didn't reload:** SSH to the VPS and check:
   ```bash
   ssh vectormatch-vps
   cat /data/coolify/proxy/dynamic/coolify.yaml | grep Host
   # Should show admin.dumavena.com, not admin.vectormatch.dev
   docker logs coolify-proxy --tail 20
   ```
   If the file still shows the old domain, try restarting Traefik:
   ```bash
   docker restart coolify-proxy
   ```

5. **Emergency access:** If the dashboard is completely broken, access it via
   the VPS IP directly:
   ```bash
   ssh -L 8000:localhost:8000 vectormatch-vps
   # Open http://localhost:8000 in browser
   ```
   You can then fix the FQDN setting from there.

### C.2 vectormatch.dev stopped working after dashboard migration

**This should not happen** — the VectorMatch app's routing is on its container
labels, not in the dashboard config file. But if it does:

1. Check the VectorMatch container is still running:
   ```bash
   ssh vectormatch-vps "docker ps | grep o13urtthlj1q3md70gqeuca2"
   ```
2. Check Traefik can see the container's labels:
   ```bash
   ssh vectormatch-vps "docker inspect o13urtthlj1q3md70gqeuca2-183141871638 --format '{{json .Config.Labels}}'" | grep vectormatch.dev
   ```
3. Restart the VectorMatch app from the Coolify dashboard (if accessible) or
   via Docker:
   ```bash
   ssh vectormatch-vps "docker restart o13urtthlj1q3md70gqeuca2-183141871638"
   ```

### C.3 dumavena.com SSL certificate fails to provision

**Symptom:** The dumavena-next app deploys but HTTPS doesn't work (browser
shows cert error).

**Fix:** Ensure DNS is pointing to the VPS before deploying. If using
Cloudflare, temporarily disable proxying (grey cloud) for `dumavena.com` while
the cert provisions, then re-enable it.

### C.4 Contact form not sending email

**Symptom:** Contact form returns an error message.

**Check:**
1. `RESEND_API_KEY` is set correctly in Coolify env vars
2. `CONTACT_FROM_EMAIL` uses a verified sender (`onboarding@resend.dev` works
   without domain verification; `noreply@dumavena.com` requires Phase 7)
3. Check the Resend dashboard for delivery logs
4. Check container logs:
   ```bash
   ssh vectormatch-vps "docker logs <dumavena-container-name> --tail 50"
   ```

### C.5 Reverting the Coolify dashboard migration

If something goes wrong and you need to revert to `admin.vectormatch.dev`:

1. Access Coolify via emergency IP: `ssh -L 8000:localhost:8000 vectormatch-vps`
   → open `http://localhost:8000`
2. Go to Settings → Instance Settings → change FQDN back to
   `https://admin.vectormatch.dev`
3. Save — Coolify will regenerate the Traefik config and re-provision the old
   cert
4. Update the local Devin MCP configs back to `admin.vectormatch.dev`

---

## Summary: What the Devin Agent in the New Session Should Do

1. **Read this document first** — it contains all context needed.
2. **Set up `.devin/` directory** with MCP configs and skills (Phase 1).
3. **Update `AGENTS.md`** with the full project-specific content (Phase 1.3).
4. **Create `Dockerfile` and `.dockerignore`** (Phase 2.2, 2.3).
5. **Update `next.config.ts`** to add `output: "standalone"` (Phase 2.1).
6. **Verify the Docker build locally** (Phase 2.4).
7. **Remind the user to commit and push** the new files to GitHub (Phase 2.5).
8. **Guide the user through DNS migration** (Phase 3) — this is a manual step
   the user performs in the DigitalOcean/Cloudflare dashboard. Verify DNS
   propagation before proceeding.
9. **Guide the user through Coolify dashboard setup** (Phase 4) — the agent
   can use the Coolify MCP to verify deployment status but cannot create
   applications (the MCP is read-only).
10. **Verify dumavena.com is fully working** before proceeding to Phase 5.
11. **Guide the user through the Coolify dashboard migration** (Phase 5) —
    changing the FQDN from `admin.vectormatch.dev` to `admin.dumavena.com` in
    the Coolify settings.
12. **Update the local Devin MCP config files** with the new Coolify URL
    (Phase 5.8).
13. **Run final verification** (Phase 6) — verify both domains and the
    dashboard are working.
14. **Guide the user through Resend domain verification** (Phase 7) —
    optional but recommended for production email delivery.

> **Reminder:** The Devin agent must NEVER run git commands. All commits and
> pushes are the user's responsibility. The agent should prepare the files,
> verify the build, and tell the user what to commit and push.

> **Ordering is critical:** The phases must be executed in order. DNS must
> propagate (Phase 3) before deployment (Phase 4). Deployment must be verified
> (Phase 4) before the dashboard migration (Phase 5). Skipping ahead or
> reordering can cause SSL cert failures or dashboard downtime.
