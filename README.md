# Dumavena — Next.js

Portfolio website for [Dumavena LLC](https://dumavena.com), Dusan Knezevic's personal web-dev portfolio, rebuilt from the original
Laravel/Blade application into a modern Next.js stack.

## Tech stack

- **Next.js 16** (App Router, Turbopack, React Compiler)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS v4**
- **Motion** (framer-motion successor) for animations
- **Biome** for formatting and linting
- **Resend** for transactional email delivery
- **Zod** for server-side form validation

## Pages

| Route                 | Purpose                          |
| --------------------- | -------------------------------- |
| `/`                   | Homepage with services, portfolio, testimonials, contact |
| `/about`              | About the company                |
| `/faq`                | Frequently asked questions       |
| `/privacy-policy`     | Privacy policy                   |
| `/terms-of-services`  | Terms of service                 |

## Getting started

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable             | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `RESEND_API_KEY`     | Resend API key for sending email. Get one at resend.com/api-keys.  |
| `CONTACT_FROM_EMAIL` | Sender address. Must be verified in Resend.                       |
| `CONTACT_TO_EMAIL`   | Recipient address for contact form submissions.                   |

See `.env.example` for details and testing vs. production sender options.

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server                 |
| `npm run build`   | Production build                     |
| `npm run start`   | Run the production build             |
| `npm run lint`    | Run Biome checks                     |
| `npm run format`  | Format files with Biome              |

## Contact form

The contact form uses a Next.js Server Action (`app/actions.ts`) with:

- **Zod validation** — name, email, message, plus a honeypot field for bot protection.
- **Resend** for email delivery — sends a formatted HTML email to the configured recipient.
- **Rate limiting** — 3 submissions per 10 minutes per IP (in-memory).
- **Structured error handling** — maps Resend error codes to user-friendly messages.

## Deployment

The easiest deployment path is [Vercel](https://vercel.com):

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add the environment variables (`RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`) in the Vercel project settings.
4. Deploy.

Any other Node.js host works too — run `npm run build && npm run start` behind a reverse proxy.

## Project structure

```
app/
  actions.ts          # Contact form server action
  layout.tsx          # Root layout, fonts, metadata
  page.tsx            # Homepage
  about/              # About page
  faq/                # FAQ page
  privacy-policy/     # Privacy policy page
  terms-of-services/  # Terms of service page
  globals.css         # Global styles, design tokens
components/
  header.tsx          # Sticky header with mobile nav
  footer.tsx          # Footer
  sections/           # Homepage sections (hero, services, portfolio, etc.)
  scroll-effects.tsx  # Scroll-driven effects
lib/
  content.ts          # Site content (services, portfolio, testimonials, nav)
public/
  images/             # Site imagery (hero, services, portfolio, testimonials)
  favicon.ico
```

## Design

Editorial dark theme with:

- Deep charcoal base (`#0c0c0e`)
- Amber/gold accent (`#d4a24e`)
- Fraunces display typeface paired with Geist body text
- Scroll-driven motion and entrance animations
- Fully responsive desktop and mobile layouts

## License

Proprietary — Dumavena LLC.
