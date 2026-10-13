# a2o Draft Assistant

Internal web app for a2o Architecture (Key West). It drafts the firm's repetitive
construction-document text — **General Notes**, **Specification Sections**, and
**Schedules** — as clean, editable, copyable plain text, grounded on a2o's own past
examples so the output matches their voice and formatting instead of generic boilerplate.

Lives in the Keys2TheWeb / a2o repo as Phase 0 of the Revit transition proposal
(`../docs/proposals/`). Deploy target: Vercel + Postgres (Supabase or Neon).

## Contents

1. [Stack](#stack)
2. [Setup](#setup)
3. [Environment variables](#environment-variables)
4. [How generation works](#how-generation-works)
5. [Replacing the placeholder examples with a2o's real ones](#replacing-the-placeholder-examples-with-a2os-real-ones)
6. [Eval harness and baseline](#eval-harness-and-baseline)
7. [Testing](#testing)
8. [Security](#security)
9. [Deploying to Vercel](#deploying-to-vercel)
10. [Project layout](#project-layout)

## Stack

All versions were checked against npm on 2026-10-13 and are the current stable releases.

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js 16.4 (App Router) · React 19.3 · TypeScript 5.9 · Tailwind 4 · shadcn/ui 4 | Current stable; one deployable unit on Vercel. Next 16 renamed `middleware.ts` to `proxy.ts`; `cacheComponents` is off because every page is per-user. |
| Auth | **Clerk** (`@clerk/nextjs` 7.9) | Picked over Auth.js: Auth.js v5 has been `5.0.0-beta` for two years and v4 is legacy for the App Router. Clerk is stable, stores sessions in httpOnly cookies verified server-side on every request, and keeps password hashing and MFA out of this codebase. |
| Authorization | App-level allowlist → `AppUser` table (`ADMIN` / `MEMBER`) | Clerk proves *who*; `src/lib/auth.ts` decides *whether*, on every protected page and route. Library records are owner-scoped; admins see all. |
| Database | Postgres via Prisma 7.10 + `@prisma/adapter-pg` | Prisma 7 uses driver adapters, so dev, test, and prod are all Postgres and pointing at Supabase/Neon is an env-var change. (npm tags `prisma@8.0.0-rc` as latest; an RC is not a production pin.) |
| LLM | Anthropic API via `@anthropic-ai/sdk` 0.133 | One provider module behind one interface; swappable. Server-side only. |
| Validation | zod 4.6 | Env at startup, every API body, every search param. |
| Tests | Vitest 5 against a real Postgres | No mock database. |

## Setup

Prerequisites: Node 20.9+ (22 recommended) and Postgres 14+.

```bash
cd draft-assistant
npm install
cp .env.example .env.local           # then edit — see "Environment variables"

createdb a2o_draft && createdb a2o_draft_test   # or create them any other way
npm run db:migrate                   # applies prisma/migrations to DATABASE_URL
npm run db:seed                      # loads the PLACEHOLDER example library
npm run dev                          # http://localhost:3000
```

**Clerk keys.** Run `npx clerk@latest init --accountless --framework next` once; it writes
temporary development keys into `.env.local` with no Clerk account needed. (Leaving the
keys unset makes the app refuse to start, by design.) To promote the dev instance to a
real Clerk application later, run `npx clerk auth login` and it is claimed automatically.

**Test user.** Put the address in `ALLOWED_EMAILS`, then create the user either by signing
up in the app (dev instances show a bot check; use a real browser) or with the Clerk CLI:

```bash
npx clerk users create --email test.user@a2oarchitecture.example --password '<strong password>' --yes
```

The first allowlisted person to sign in becomes `ADMIN`; later ones are `MEMBER`.
Clerk dev instances treat `anything+clerk_test@example.com` as a test address whose
email verification code is always `424242`.

## Environment variables

Every variable is documented inline in [`.env.example`](.env.example). Summary:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection for the app (pooled URL on Supabase/Neon) |
| `DIRECT_URL` | prod only | Non-pooled URL the Prisma CLI uses for migrations |
| `TEST_DATABASE_URL` | for `npm test` | Separate database the test suite migrates and writes to |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | yes | Clerk instance keys (`clerk init` writes dev ones) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | yes | `/sign-in` |
| `ALLOWED_EMAILS` | yes | Comma-separated allowlist; the authorization gate |
| `ANTHROPIC_API_KEY` | for generation | Server-side only; checked when the first model call is made |
| `MODEL_STANDARD`, `MODEL_PREMIUM` | defaults | `claude-sonnet-5-5` / `claude-opus-5-5` |
| `MODEL_GENERAL_NOTES`, `MODEL_SPEC_SECTION`, `MODEL_SCHEDULE` | optional | Pin a type to one model, bypassing routing |
| `LLM_EFFORT` | default `medium` | `low` / `medium` / `high` |
| `GROUNDING_EXAMPLE_COUNT` | default `3` | Reference examples per prompt |
| `RATE_LIMIT_GENERATE_MAX`, `RATE_LIMIT_GENERATE_WINDOW_SECONDS` | defaults `30` / `3600` | Per-user limit on `POST /api/generate` |

`src/env.ts` validates all of this with zod on first use and throws a readable message
listing exactly what is wrong. `.env*` is gitignored except `.env.example`.

## How generation works

Everything behind `POST /api/generate` goes through one function,
`generateDraft(input, userId, deps)` in `src/lib/llm/generator.ts`. Its dependencies
(provider, example loader, usage logger, model config) are injected, so tests and the eval
harness run the identical pipeline with a fake model.

1. **Validate** the request (`src/lib/validation.ts`): output type, brief, project
   parameters (name, scope, occupancy, jurisdiction, free-text specifics), optional
   starting-point text. Control characters are stripped; lengths are bounded.
2. **Select examples** (`src/lib/grounding/select-examples.ts`). Every stored example of
   the requested type is scored against the request: project type inferred from
   occupancy/scope (+3), jurisdiction match (+2), occupancy match (+2), tag overlap with the
   brief (+1 each, max 4), title-word overlap, and a small bonus for real (non-placeholder)
   examples. Ties break on id, so the same request always picks the same examples.
   The top `GROUNDING_EXAMPLE_COUNT` go into the prompt. This is retrieval plus few-shot,
   not fine-tuning: a2o's voice comes from the examples present at request time.
3. **Assemble the prompt** (`src/lib/llm/prompt.ts`) in cache-friendly order:
   - system block 1: the fixed system prompt + the type's format rules and required
     headings (`src/lib/output-types.ts`). Byte-identical for every request of a type.
     Carries a cache breakpoint.
   - system block 2: the selected reference examples. Identical whenever the same
     examples are selected. Carries a cache breakpoint.
   - user message: project parameters, the brief, and the optional starting point. Last,
     never cached.
   Both breakpoints are above the 512-token cache minimum (tested). Edits to
   `SYSTEM_BASE` or the format rules invalidate the cache for everyone until it re-warms,
   so treat them as code (see the eval harness).
4. **Route to a model tier** (`src/lib/llm/routing.ts`). A complexity score starts at the
   type's base (spec sections start at 2), adds 1–2 for long briefs, and adds 1 per hard
   signal up to 3: historic/HARC, flood zone, zoning or change of use, commercial or
   mixed use, existing-structure work, wind/impact/product approval. Score ≥ 3 goes to
   `MODEL_PREMIUM`, otherwise `MODEL_STANDARD`. A per-type pin overrides the heuristic.
   The decision and its reasons are returned to the UI.
5. **Call the provider** (`src/lib/llm/anthropic-provider.ts`): `beta.messages.create`
   with the system blocks, `output_config.effort`, and `fallbacks: "default"` so a policy
   refusal re-runs on a sibling model inside the same call. A final refusal surfaces as a
   422 with the category.
6. **Log usage**: one `Generation` row per call (model, tier, example ids, input/output
   tokens, cache read/write tokens, latency, stop reason) plus a one-line server log.
   `cacheReadTokens` is how you confirm caching is working in production.
7. **Return** the text, routing decision, usage, and any required headings the model
   omitted. The UI shows a warning for missing headings rather than hiding them.

The output types and their contracts (required headings, numbering patterns, rules) are
defined once in `src/lib/output-types.ts` and used by the prompt, the UI, the seed-data
tests, and the eval scorer.

## Replacing the placeholder examples with a2o's real ones

The seeded examples are generic, clearly marked `PLACEHOLDER`, and only exist so the
pipeline has something to select. Replacing them is the single highest-leverage change:

1. Collect 3–5 of a2o's own documents per type: general-notes sheets, spec sections,
   door/window/finish schedules. Plain text is ideal; strip project-identifying details
   if they should not be reused verbatim.
2. Add each as an entry in `prisma/seed-data/*.ts` (same shape as the placeholders) with
   a unique `key`, the right `type`, `projectType` (`residential` / `light_commercial` /
   `mixed_use`), `occupancy`, `jurisdiction`, and tags that describe when it applies
   (`historic`, `elevated`, `pool`, `storefront`, …). Tags drive selection.
   Or insert rows into the `Example` table directly with `isPlaceholder = false`.
3. Run `npm test`: `tests/output-types.test.ts` checks every seed entry against its type's
   required headings and format patterns, so a2o's documents will immediately tell you
   where the placeholder *format rules* diverge from a2o's actual conventions.
4. Update `formatRules`, `requiredSections`, and `formatPatterns` in
   `src/lib/output-types.ts` to match a2o's real numbering, heading, and layout habits.
   Update `SYSTEM_BASE` in `src/lib/llm/prompt.ts` with any firm-wide phrasing rules.
5. Re-seed (`npm run db:seed` upserts by key) and delete the `PLACEHOLDER` rows once real
   ones exist for that type. Real examples outrank placeholders in selection anyway.
6. Run `npm run eval` before and after and keep the change only if the score moves the
   right way. Rewrite the eval cases' `expectSections` / `expectPhrases` to reflect what
   a2o's documents actually contain.

## Eval harness and baseline

Prompts are code; `npm run eval` is their test suite. `eval/cases.json` holds 12 fixed
cases (4 per type) with briefs, parameters, and scored expectations.
`eval/score.ts` checks each output deterministically:

- non-empty; required headings for the type; case-specific extra sections
- the type's format patterns (numbering, lettered paragraphs, `END OF SECTION`, pipe columns…)
- no markdown markup; no preamble or commentary
- **no fabricated code citations**: any section/table number, ASTM/ASCE standard, product
  approval number, or edition year in the output must already appear in the brief,
  parameters, or reference examples
- expected phrases present; forbidden phrases absent

Modes:

```bash
npm run eval               # live: calls the configured models, prints per-case score, cache hits, totals
npm run eval -- --dry      # offline: fake provider echoes the top-selected example; checks pipeline + selection + scorer
npm run eval -- --replay eval/results/<file>.json   # re-score recorded outputs after changing the scorer
npm run eval -- --only gn-02-historic-harc          # one case, any mode
```

Each run writes `eval/results/<timestamp>-<mode>.json` (gitignored). Rename a run to
`baseline-*.json` to commit it.

**Baseline (recorded 2026-10-13, `--dry`, placeholder library): 97.6% over 12 cases**
(General Notes 100%, Spec Section 96.4%, Schedule 96.4%). See
`eval/results/baseline-2026-10-13-dry.json`. The two misses are cases with no matching
placeholder example (an exterior-trim spec and a plumbing-fixture schedule), which is the
harness doing its job: it flags gaps in the example library.

**A live baseline has not been recorded yet.** The build environment had no
`ANTHROPIC_API_KEY`. Run `npm run eval` once the key is in `.env.local` and record the
number here; expect a lower first score than the dry run, since the model now has to
*write* the document rather than echo one.

## Testing

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # migrates TEST_DATABASE_URL, then vitest run (67 tests, 12 files)
npm run build       # prisma generate + next build
```

What is covered (`tests/`): authorization rules, env parsing, input validation, example
selection and project-type inference, prompt assembly and cache ordering, model routing,
the generator contract with a fake provider, the Anthropic provider's request shape and
refusal handling with a fake client, the eval scorer, the output-type contracts (every
seed example must satisfy its own type), the DB-backed rate limiter, and library CRUD
with ownership rules. The rate-limit and library tests hit the real test database.

Model tests never assert exact model text; they assert the contract (sections, usage
logged, routing) on replayed fixtures, per the no-flaky-LLM-tests rule.

## Security

- **Secrets** come only from environment variables (`src/env.ts`). Nothing is hardcoded;
  `.env*` is gitignored except the documented example.
- **No model call or key on the client.** The SDK is imported only by
  `src/lib/llm/anthropic-provider.ts`, used only from route handlers.
- **Sessions** are Clerk httpOnly cookies, verified server-side by `clerkMiddleware` in
  `src/proxy.ts` and again by `getSessionUser()` in every page and route.
- **Authorization, not just authentication**: allowlist + `AppUser` row required; library
  records are owner-scoped (`canAccessRecord`); admins can see everything.
- **Input validation** with zod on every API body and query; control characters stripped;
  length bounds everywhere. The model prompt treats user text as data under fixed rules.
- **Rate limiting** on `POST /api/generate`: DB-backed sliding window per user, so it holds
  across Vercel instances. Returns 429 with `Retry-After`.
- `npm audit` (2026-10-13) reports only dev-time transitive findings: `braces` under the
  ESLint config chain, and `mysql2` / `deepmerge-ts` under the Prisma CLI. None are in the
  runtime bundle. Re-check after upgrades.

## Deploying to Vercel

1. Create a Postgres database (Supabase or Neon). Set `DATABASE_URL` to the pooled URL
   and `DIRECT_URL` to the direct URL.
2. Create a production Clerk application (or claim the dev instance with
   `npx clerk auth login`), then set the two Clerk keys and `NEXT_PUBLIC_CLERK_SIGN_IN_URL`.
3. Set `ALLOWED_EMAILS`, `ANTHROPIC_API_KEY`, and any model overrides.
4. In the Vercel project, set **Root Directory** to `draft-assistant`. The default build
   command (`npm run build`) already runs `prisma generate`.
5. Apply migrations from your machine against the production database:
   `DIRECT_URL=<direct url> npm run db:deploy`, then `DATABASE_URL=<url> npm run db:seed`
   (or load a2o's real examples instead of the placeholders).

## Project layout

```
prisma/
  schema.prisma          AppUser, Example, SavedOutput, Generation, RateLimitEvent
  migrations/            applied with prisma migrate
  seed.ts, seed-data/    placeholder example library (upserts by key)
src/
  env.ts                 zod-validated server environment
  proxy.ts               Clerk middleware (Next 16 "proxy")
  app/                   pages (generate, library, library/[id], sign-in, sign-up, not-authorized)
  app/api/generate       POST: auth → validate → rate limit → generate
  app/api/library        GET/POST; [id]: GET/PATCH/DELETE
  components/            workspace, output editor, save control, library list, detail view
  lib/
    auth.ts, authz.ts    session + authorization (authz is pure and tested)
    output-types.ts      the three output contracts
    validation.ts        zod schemas for every boundary
    grounding/           example selection
    llm/                 prompt assembly, routing, provider seam, Anthropic provider, generator
    library.ts           saved outputs CRUD with ownership rules
    rate-limit.ts        DB-backed sliding window
    export.ts            .txt / .md export helpers
eval/
  cases.json, score.ts, run.ts, results/
tests/                   vitest suite (real Postgres for DB tests)
```
