# Handoff Document: Dumavena-Next Deployment to Coolify/Hetzner

> **Purpose:** This document is for a fresh Devin session opened in the
> `/Users/knez/Documents/WebDev/dumavena/dumavena-next` project directory. It
> contains everything that session needs to: (1) enhance the local project with
> AI tooling (MCP servers, skills, AGENTS.md), (2) deploy the site to the
> existing Coolify instance on the Hetzner VPS, and (3) transfer the
> `dumavena.com` domain from DigitalOcean to Hetzner so the new Next.js site
> goes live.

---

## Table of Contents

1. [Project Context](#1-project-context)
2. [Infrastructure Summary](#2-infrastructure-summary)
3. [Phase 1: Local AI Enhancement Setup](#phase-1-local-ai-enhancement-setup)
4. [Phase 2: Prepare dumavena-next for Docker Deployment](#phase-2-prepare-dumavena-next-for-docker-deployment)
5. [Phase 3: Deploy to Coolify](#phase-3-deploy-to-coolify)
6. [Phase 4: Domain Transfer from DigitalOcean to Hetzner](#phase-4-domain-transfer-from-digitalocean-to-hetzner)
7. [Phase 5: Post-Deployment Verification](#phase-5-post-deployment-verification)
8. [Reference: VectorMatch Coolify Application Config](#reference-vectormatch-coolify-application-config)

---

## 1. Project Context

**Dumavena-Next** is a portfolio website for Dumavena LLC (Dusan Knezevic's
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

### What the site contains

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
| **Public IP** | `157.180.68.189` |
| **SSH alias** | `vectormatch-vps` (configured in `~/.ssh/config`) |
| **SSH user** | `root` (key-based auth via `~/.ssh/id_ed25519`) |
| **OS** | Linux (Debian/Ubuntu-based) |
| **Coolify version** | 4.1.2 |
| **Proxy** | Traefik v3.6.21 (managed by Coolify) |
| **Coolify dashboard** | `https://admin.vectormatch.dev` |
| **Coolify MCP endpoint** | `https://admin.vectormatch.dev/mcp` |

### Current DNS state

| Domain | NS | A Record | Points to | Status |
|---|---|---|---|---|
| `vectormatch.dev` | Cloudflare (`lou.ns.cloudflare.com`, `aitana.ns.cloudflare.com`) | Cloudflare proxy IPs | Hetzner VPS (157.180.68.189) | **Live, proxied through Cloudflare** |
| `admin.vectormatch.dev` | Cloudflare | Cloudflare proxy IPs | Hetzner VPS (Coolify dashboard) | **Live, proxied through Cloudflare** |
| `dumavena.com` | DigitalOcean (`ns1/2/3.digitalocean.com`) | `157.245.210.218` | DigitalOcean droplet (old Laravel) | **Live on DigitalOcean, to be migrated** |

### Coolify current state

- **1 server:** `localhost` (the Hetzner VPS itself — Coolify runs on the same host)
- **1 project:** `VectorMatch` (uuid: `auf5w48fd3wriug75oei3d8o`)
- **1 application:** `vectormatch:main` (running:healthy, FQDN: `https://vectormatch.dev`)
- **3 services:** flaresolverr, filebrowser, wordpress+mariadb
- **1 database:** PostgreSQL (container `z10g6zz09soe0ddwgpizteq2`, for VectorMatch)
- **1 Redis:** (container `fynhnv9ws1q1kkk9ufy9d71p`, for VectorMatch rate limiting)

### Running containers on the VPS (as of Sep 3 2026)

```
coolify-proxy          — Traefik v3.6, ports 80/443/8080
coolify                — Coolify dashboard, port 8000
coolify-realtime       — WebSocket server, ports 6001-6002
coolify-redis          — Coolify's internal Redis
coolify-db             — Coolify's internal PostgreSQL
coolify-sentinel       — Monitoring agent
o13urtthlj1q3md70gqeuca2 — VectorMatch Next.js app (port 3000 internal)
z10g6zz09soe0ddwgpizteq2 — VectorMatch PostgreSQL (port 25432 external)
fynhnv9ws1q1kkk9ufy9d71p — VectorMatch Redis
flaresolverr           — Cloudflare bypass (port 8191)
filebrowser            — File manager (port 80 internal)
wordpress + mariadb    — WordPress site
```

### Key takeaway

The Hetzner VPS already runs Coolify with Traefik handling SSL/TLS via
Let's Encrypt (HTTP-01 challenge). Adding a new application is straightforward
— Coolify will configure Traefik automatically to route the new domain and
provision certificates. **No manual Traefik or nginx configuration is needed.**

---

## Phase 1: Local AI Enhancement Setup

The dumavena-next project currently has a minimal `AGENTS.md` (just the
auto-generated Next.js warning block). To give the Devin agent full access to
resources and latest documentation, the following enhancements are needed.

### 1.1 Create `.devin/` directory and MCP config

The `.devin/` directory is already in `.gitignore` (line: `.devin/`), so it
won't be committed. Create the MCP configuration file:

**File: `.devin/mcp_config.json`**

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

**File: `.devin/mcp_config.local.json`** (contains real secrets — already
gitignored via `.devin/`)

```json
{
  "mCPServers": {
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

> **Note:** The `mcp_config.local.json` overrides the `${COOLIFY_BASE_URL}`
> and `${COOLIFY_MCP_TOKEN}` placeholders from `mcp_config.json` with the
> actual Coolify MCP endpoint and token. This token is the same one used by
> the VectorMatch project — it's a team-level Coolify API token.

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

#### Already available globally (no action needed — Devin loads these automatically)

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
- **Coolify dashboard:** `https://admin.vectormatch.dev`
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
   verify the agent can see the Coolify setup.

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

---

## Phase 3: Deploy to Coolify

### 3.1 Create a new Coolify project (optional but recommended)

For cleanliness, create a separate Coolify project for Dumavena (rather than
adding it to the VectorMatch project). This can be done via the Coolify
dashboard at `https://admin.vectormatch.dev`:

1. Log in to `https://admin.vectormatch.dev`
2. Click **"New Project"** → Name it **"Dumavena"** → Create

Alternatively, the Dumavena app can be added to the existing "VectorMatch"
project. The choice is organizational — Coolify projects are just groupings.

### 3.2 Create a new application in Coolify

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

### 3.3 Configure the application

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
| **Redirect** | `both` (HTTP → HTTPS, www → non-www or vice versa) |

### 3.4 Set environment variables in Coolify

In the Coolify application's **"Environment Variables"** tab, add:

```
RESEND_API_KEY=<the actual key from the local .env file>
CONTACT_FROM_EMAIL=Dumavena <noreply@dumavena.com>
CONTACT_TO_EMAIL=info@dumavena.com
```

> **Note on `CONTACT_FROM_EMAIL`:** If `dumavena.com` is not yet verified in
> Resend, use the testing sender: `Dumavena <onboarding@resend.dev>`. After
> the domain is verified in Resend (see Phase 4), switch to
> `Dumavena <noreply@dumavena.com>`.

### 3.5 Deploy

1. Click **"Deploy"** in the Coolify dashboard
2. Watch the build logs — the Docker build should complete in 1-3 minutes
3. Once deployed, Coolify's Traefik proxy will automatically:
   - Route `dumavena.com` traffic to the container on port 3000
   - Provision a Let's Encrypt SSL certificate (via HTTP-01 challenge)
4. The health check should pass within 30 seconds

> **Important:** At this point, the site is live on Coolify but only accessible
> via the Hetzner VPS IP directly (e.g., `http://157.180.68.189:3000` if port
> mapping is exposed, or via the Coolify preview URL). The domain won't resolve
> to the Hetzner VPS until the DNS is updated in Phase 4.

### 3.6 Verify via Coolify MCP

The Devin agent can verify the deployment status using the Coolify MCP server:

```
# List all applications to find the new dumavena app
mcp_call_tool("coolify", "list_applications", {})

# Get details of the new application (use the UUID from the list)
mcp_call_tool("coolify", "get_application", {"uuid": "<uuid>"})
```

Check that:
- `status` is `running:healthy`
- `fqdn` is `https://dumavena.com`
- `git_repository` is `knezdusan/dumavena-next`
- `git_branch` is `main`

---

## Phase 4: Domain Transfer from DigitalOcean to Hetzner

This is the most critical step — it makes `https://dumavena.com` point to the
new Next.js site on Hetzner instead of the old Laravel site on DigitalOcean.

### Current DNS state

- **dumavena.com NS:** `ns1/2/3.digitalocean.com` (DigitalOcean DNS)
- **dumavena.com A record:** `157.245.210.218` (DigitalOcean droplet)
- **Target:** Point `dumavena.com` to `157.180.68.189` (Hetzner VPS)

### Two approaches (choose one)

#### Option A: Keep DigitalOcean DNS, change A record (simplest, fastest)

This is the quickest path — just update the A record in the DigitalOcean DNS
dashboard to point to the Hetzner VPS IP.

**Steps:**
1. Log in to DigitalOcean dashboard → **Networking** → **Domains** → `dumavena.com`
2. Find the **A record** for `dumavena.com` (and `www.dumavena.com`)
3. Change the IP from `157.245.210.218` → `157.180.68.189`
4. Save
5. Wait for DNS propagation (usually 5-30 minutes for DigitalOcean's TTL;
   up to 48 hours globally)
6. Verify: `dig dumavena.com A` should return `157.180.68.189`

**Pros:** Simple, no NS migration, no downtime risk
**Cons:** DNS stays on DigitalOcean (not consolidated with Cloudflare where
vectormatch.dev lives)

#### Option B: Migrate DNS to Cloudflare (recommended for consistency)

This consolidates all domains under Cloudflare, matching how
`vectormatch.dev` is managed. Also gives CDN, DDoS protection, and caching.

**Steps:**
1. **In Cloudflare:**
   - Log in to Cloudflare dashboard
   - Click **"Add a site"** → enter `dumavena.com`
   - Select the **Free plan** (or Pro if desired)
   - Cloudflare will scan existing DNS records — verify the A record for
     `dumavena.com` points to `157.180.68.189` (change it from the
     DigitalOcean IP)
   - Also add/verify: `www.dumavena.com` → `157.180.68.189` (A record,
     proxied)
   - Cloudflare will assign nameservers (e.g., `xxx.ns.cloudflare.com`)

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
   - `dig dumavena.com A` should show Cloudflare proxy IPs
   - `https://dumavena.com` should load the new Next.js site

**Pros:** Consolidated DNS management, CDN, DDoS protection, matches
vectormatch.dev setup
**Cons:** Longer migration time (NS propagation), more steps

### 4.1 Important: Resend domain verification

If using `noreply@dumavena.com` as the sender (not the testing
`onboarding@resend.dev`), the domain `dumavena.com` must be verified in
Resend. This requires adding DNS records (SPF, DKIM, DMARC) to the domain's
DNS.

**After DNS migration is complete:**
1. Log in to Resend → **Domains** → **Add Domain** → `dumavena.com`
2. Resend will provide DNS records to add (TXT, CNAME records for SPF/DKIM)
3. Add these records to the DNS provider (DigitalOcean DNS if Option A,
   Cloudflare if Option B)
4. Wait for verification (usually 5-30 minutes)
5. Update `CONTACT_FROM_EMAIL` in Coolify from
   `Dumavena <onboarding@resend.dev>` to `Dumavena <noreply@dumavena.com>`

### 4.2 Decommission the old DigitalOcean droplet (optional, after verification)

**Only after confirming the new site is fully working:**
1. Verify `https://dumavena.com` loads the Next.js site (not Laravel)
2. Verify the contact form works
3. Verify all pages load correctly
4. Then — at the user's discretion — power off or destroy the DigitalOcean
   droplet serving the old Laravel site

> **Do NOT destroy the DigitalOcean droplet until the user explicitly
> confirms the new site is working and they want the old one removed.**

---

## Phase 5: Post-Deployment Verification

After the domain is pointing to Hetzner and the Coolify app is running:

### 5.1 Functional checks

- [ ] `https://dumavena.com` loads the homepage
- [ ] `https://dumavena.com/about` loads
- [ ] `https://dumavena.com/faq` loads
- [ ] `https://dumavena.com/privacy-policy` loads
- [ ] `https://dumavena.com/terms-of-services` loads
- [ ] SSL certificate is valid (no browser warnings)
- [ ] `https://www.dumavena.com` redirects to `https://dumavena.com` (or
      vice versa, depending on Coolify redirect setting)
- [ ] HTTP redirects to HTTPS

### 5.2 Contact form check

- [ ] Submit the contact form with valid data → success message appears
- [ ] Email is received at `info@dumavena.com`
- [ ] Submit with empty fields → validation errors appear
- [ ] Submit with invalid email → validation error appears
- [ ] Submit 4 times rapidly → rate limit message appears (3 per 10 min)

### 5.3 Performance and SEO checks

- [ ] Page load is fast (no obvious delays)
- [ ] Fonts load correctly (Fraunces + Geist)
- [ ] Images load from `/images/` path
- [ ] Metadata is correct (view page source — title, description, OpenGraph)
- [ ] `robots.txt` and `sitemap.xml` if applicable

### 5.4 Coolify health check

- [ ] Coolify dashboard shows the dumavena app as `running:healthy`
- [ ] Health check is passing (green indicator)

---

## Reference: VectorMatch Coolify Application Config

The existing VectorMatch application on Coolify serves as a reference for how
a Next.js app is configured. Here are its key settings:

| Setting | VectorMatch Value | Dumavena Target Value |
|---|---|---|
| UUID | `o13urtthlj1q3md70gqeuca2` | (new UUID) |
| Name | `vectormatch:main-o13urtthlj1q3md70gqeuca2` | `dumavena:main` |
| FQDN | `https://vectormatch.dev` | `https://dumavena.com` |
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

---

## Quick Reference: All Commands

```bash
# === Phase 1: Local AI setup ===
# Create .devin directory structure
mkdir -p .devin/skills

# Copy relevant skills from VectorMatch
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/next-best-practices .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/next-cache-components .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/shadcn .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/vitest-best-practices .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/playwright-e2e .devin/skills/
cp -r /Users/knez/Documents/WebDev/vectormatch/.devin/skills/fallow .devin/skills/

# === Phase 2: Docker build verification ===
# Build and test locally
docker build -t dumavena-next .
docker run -p 3001:3000 --env-file .env dumavena-next
# Open http://localhost:3001

# === Phase 3: Coolify (via dashboard at https://admin.vectormatch.dev) ===
# Create app → set FQDN, build pack, env vars → deploy

# === Phase 4: DNS ===
# Option A: DigitalOcean DNS — change A record to 157.180.68.189
# Option B: Cloudflare — add domain, change NS, set A record to 157.180.68.189

# === Phase 5: Verify ===
dig dumavena.com A
curl -I https://dumavena.com
```

---

## Summary: What the Devin Agent in the New Session Should Do

1. **Read this document first** — it contains all context needed.
2. **Set up `.devin/` directory** with MCP configs and skills (Phase 1).
3. **Update `AGENTS.md`** with the full project-specific content (Phase 1.3).
4. **Create `Dockerfile` and `.dockerignore`** (Phase 2.2, 2.3).
5. **Update `next.config.ts`** to add `output: "standalone"` (Phase 2.1).
6. **Verify the Docker build locally** (Phase 2.4).
7. **Remind the user to commit and push** the new files to GitHub (Phase 2.5).
8. **Guide the user through Coolify dashboard setup** (Phase 3) — the agent
   can use the Coolify MCP to verify deployment status but cannot create
   applications (the MCP is read-only).
9. **Guide the user through DNS migration** (Phase 4) — this is a manual step
   the user performs in the DigitalOcean/Cloudflare dashboard.
10. **Verify the deployment** (Phase 5) — the agent can curl the site and
    check Coolify MCP status.

> **Reminder:** The Devin agent must NEVER run git commands. All commits and
> pushes are the user's responsibility. The agent should prepare the files,
> verify the build, and tell the user what to commit and push.
