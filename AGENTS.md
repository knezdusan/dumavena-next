<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

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
- **Coolify dashboard:** `https://admin.dumavena.com`
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
