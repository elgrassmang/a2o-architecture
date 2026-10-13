# a2o Draft Assistant — handoff (2026-10-13)

## What is done

- **App**: Next.js 16 App Router, Clerk auth, allowlist authorization, Postgres via Prisma 7.
  Three output types (General Notes, Spec Section, Schedule) with a shared contract module.
  Generate workspace with editable output, copy, and .txt/.md export. Saved library with
  search, type filter, detail view with in-place editing, delete, and "use as starting point".
- **Grounding**: deterministic example selection; cache-ordered prompt (stable rules first,
  examples second, brief last) with two cache breakpoints; model-tier routing with per-type
  pins; one provider seam; per-call token/cache/latency logging to the `Generation` table.
- **Eval**: 12 fixed cases, deterministic scorer (format, required sections, no markdown,
  no preamble, no fabricated citations), `npm run eval` with live / dry / replay modes.
  Dry baseline: 97.6%.
- **Tests**: 67 tests in 12 files, incl. real-DB tests for rate limiting and library CRUD.
  Build, lint, typecheck, and tests are green.
- **Verified in a real browser** (headless Chromium against `next dev`): sign-in with a
  Clerk dev test user, device verification, allowlist provisioning (first user → ADMIN),
  generate request reaching the server and rate limiter, save to library (201), search,
  open, edit + save (PATCH 200), reuse as starting point, 404 on foreign record ids.

## What was not possible in the build environment

- **No live model calls.** The environment had no `ANTHROPIC_API_KEY`, so the live eval
  baseline is unrecorded and the generate button's success path is exercised only with
  a fake provider (unit tests) and the dry eval. First thing after cloning: add the key to
  `.env.local`, run `npm run eval`, and write the number into README → "Eval harness".
- **Clerk sign-up form** is behind Cloudflare's bot check in dev instances; the test user
  was created with `npx clerk users create` instead. Humans signing up in a browser are fine.

## What needs a2o

1. **3–5 real documents per type** (general-notes sheets, spec sections, schedules).
   These replace `prisma/seed-data/*` and are the whole point of the grounding design.
   See README → "Replacing the placeholder examples".
2. **Their drafting conventions**: heading style, numbering, how they cite codes, recurring
   phrasing. Encode in `src/lib/output-types.ts` (format rules + patterns) and
   `SYSTEM_BASE` in `src/lib/llm/prompt.ts`. The seed-contract test will flag mismatches.
3. **The allowlist**: who at a2o should have access (`ALLOWED_EMAILS`), and whether anyone
   besides the first user should be `ADMIN` (set `role` on `app_users`).
4. **Eval expectations**: rewrite `expectSections` / `expectPhrases` in `eval/cases.json`
   to match what a2o's documents actually contain; add cases from real briefs over time.

## Decisions worth knowing

- Clerk over Auth.js (Auth.js v5 still beta); Prisma 7.10 over the `8.0.0-rc` npm labels
  "latest"; `cacheComponents: false` because every page is per-user.
- Model tiers default to Sonnet 5.5 (standard) and Opus 5.5 (premium); spec sections start
  at complexity 2 so one hard signal sends them to premium. All env-configurable.
- The Schedule contract accepts room numbers (`101`) as well as marks (`D01`) in the first
  column, and requires the title line to end in `SCHEDULE` plus a `NOTES` block.
- `npm audit` findings are dev-only transitive (ESLint config chain, Prisma CLI).

## Suggested next steps

- Load a2o's examples, record the live baseline, then hill-climb the prompt against it.
- Add a "regenerate section" action (per heading) once real usage shows which sections
  get rewritten most.
- Consider Postgres full-text search on `SavedOutput` once the library passes a few
  hundred items; `ILIKE` is fine until then.
