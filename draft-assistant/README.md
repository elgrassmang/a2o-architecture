# a2o Draft Assistant

Internal web app for a2o Architecture (Key West). It drafts the firm's repetitive
construction-document text — **General Notes**, **Specification Sections**, and
**Schedules** — as clean, editable, copyable text, grounded on a2o's own past
examples so the output matches their voice and formatting.

> Status: under construction. Sections below fill in as each build step lands.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript + Tailwind 4 + shadcn/ui | Current stable; one deployable on Vercel |
| Auth | Clerk (`@clerk/nextjs` 7) | Stable App Router support; httpOnly session cookies verified server-side; no password hashing in this codebase. Auth.js v5 is still beta after two years. |
| Authorization | App-level allowlist (`ALLOWED_EMAILS` → `app_users` table) | Clerk proves *who*; the app decides *whether*. Checked on every protected page and route. |
| DB | Postgres via Prisma 7 (`@prisma/adapter-pg`) | Same provider in dev and prod; point `DATABASE_URL` at Supabase/Neon to deploy |
| LLM | Anthropic API via `@anthropic-ai/sdk` | Server-side only; one module, swappable |
| Validation | zod 4 at every boundary | Env, API routes, forms |
| Tests | Vitest 5 against a real Postgres | No mock database |

## Setup

```bash
cd draft-assistant
npm install
cp .env.example .env.local        # fill in values; see comments in the file
npm run db:migrate                # applies prisma/migrations to DATABASE_URL
npm run db:seed                   # loads the PLACEHOLDER example library (step 2+)
npm run dev                       # http://localhost:3000
```

Local Postgres: any Postgres 14+ works. Create `a2o_draft` (dev) and `a2o_draft_test` (tests).

Clerk: leave the two Clerk keys empty in dev and `next dev` runs Clerk's **keyless** mode,
which provisions a temporary dev instance on first start (claim it from the banner it shows).
For production, create an application at dashboard.clerk.com and set both keys.

Test user: add the address to `ALLOWED_EMAILS`, then sign up with it through the app.
The first allowlisted person to sign in becomes `ADMIN`; later ones are `MEMBER`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next dev server |
| `npm run build` | `prisma generate` + `next build` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | applies migrations to `TEST_DATABASE_URL`, then `vitest run` |
| `npm run db:migrate` / `db:deploy` | create+apply a migration (dev) / apply pending (prod) |
| `npm run db:seed` | seed the placeholder example library |
| `npm run eval` | run the prompt eval set and print a score |

## Environment

Every variable is documented in `.env.example`. `.env*` files are gitignored except the example.
Secrets only ever reach server code (`src/env.ts` validates them with zod on first use).

## Security notes

- Model calls and the Anthropic key live only in server modules (`src/lib/llm/*`, route handlers).
- Sessions: Clerk httpOnly cookies; `src/lib/auth.ts` verifies and authorizes on every request.
- Rate limiting on `POST /api/generate` is DB-backed (works across serverless instances).
- `npm audit` currently reports only dev-time transitive findings (`braces` under the ESLint
  config chain; `mysql2`/`deepmerge-ts` under the Prisma CLI). None ship in the runtime bundle.
