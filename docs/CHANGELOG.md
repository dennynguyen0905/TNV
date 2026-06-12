# LangPath — Phase Changelog

A high-level log of each delivery phase. For deep implementation notes see
`docs/NEXT_MIGRATION_LOG.md` and `next-app/docs/DATABASE_SETUP.md`.

---

## Phase 5I — CI/CD & staging release readiness (current)

Goal: make releases verifiable and repeatable **without** changing the 5E learner
flow, the 5F admin CMS publish workflow, or adding any deferred infrastructure
(real payments, Redis workers, object storage, PDF, audio, Typesense all remain
explicit placeholders). `PAYMENT_ENABLED` stays `false`.

### Added
- **GitHub Actions CI** `.github/workflows/ci.yml` — runs on PRs and pushes to
  `main`. From `next-app/`: `npm ci` → `prisma generate` → lint → typecheck →
  build → test. No secrets and no real database: a throwaway unreachable
  `DATABASE_URL` lets Prisma generate and the (fully dynamic) build run, while
  the integration suite self-skips. CI never seeds or mutates any DB.
- **Optional Docker build check** `.github/workflows/docker-build.yml` — separate,
  non-required workflow that builds the production image (no push, no secrets) on
  manual dispatch or when Docker-relevant files change. Kept off the merge gate
  so a slow/flaky image build never blocks PRs.
- **Smoke test** `next-app/scripts/smoke.ts` + `npm run smoke` — zero-dep checks
  of `/api/health` (must be `200`), `/api/version`, `/robots.txt`, `/sitemap.xml`,
  and the public home page against `SMOKE_BASE_URL` (default
  `http://localhost:3000`). Optional admin-login check only when
  `SMOKE_ADMIN_EMAIL` + `SMOKE_ADMIN_PASSWORD` are provided. No credentials
  required by default; never mutates data.

### Updated
- **`/api/version`** — also reads `GITHUB_SHA` / `GIT_COMMIT_SHA` for the commit
  (in addition to `BUILD_SHA` / `VERCEL_GIT_COMMIT_SHA`). Missing metadata still
  reports `null`; local dev unaffected.
- **`docs/DEPLOYMENT.md`** — new sections: CI, a local-vs-staging-vs-production
  matrix, and a staging setup + verification guide (env vars, separate staging
  DB, Prisma push/seed, admin test login, learner smoke test).
- **`docs/RELEASE_CHECKLIST.md`** — CI note on the gates, an automated
  `npm run smoke` step, a full staging-release flow (merge → deploy staging →
  smoke → health → SEO → manual login/quiz → approve prod), and app + database
  rollback notes (incl. `db push` non-reversibility).

### Unchanged (verified)
- 5E learner flow, 5F publish gate / preview / worker placeholders, quiz scoring,
  premium access, public lesson visibility, seed data, and all deferred-subsystem
  placeholders. Gates: lint 0 warnings, typecheck 0 errors, build 0 errors
  (30 routes), 26 tests pass; `PAYMENT_ENABLED=false`.

---

## Phase 5H — Deployment & runtime hardening

Goal: prepare the app for safe production deployment and operation **without**
changing the 5E learner flow, the 5F admin CMS publish workflow, or introducing
any paid/background-job/object-storage infrastructure. `PAYMENT_ENABLED` stays
`false`.

### Added
- **Healthcheck** `GET /api/health` — liveness + DB readiness (`SELECT 1`) and an
  env-config severity summary. `200` healthy, `503` when the database is
  unreachable. No secrets exposed.
- **Build info** `GET /api/version` — app name, version, short commit
  (`BUILD_SHA`/`VERCEL_GIT_COMMIT_SHA`), environment. Useful for confirming the
  live build after deploy/rollback.
- **Server logger** `lib/logger.ts` — scoped, zero-dependency structured logging
  over `console` with a `describeError()` helper. No external vendor. API routes
  (`login`, `register`, `attempts`) now log via it and never leak internals.
- **Env validation** `lib/env.ts` — pure `checkEnv()` / `assertProductionEnv()`
  for production-critical vars (DATABASE_URL required; SITE_URL / AUTH_SECRET /
  PAYMENT_ENABLED advisory). Does not crash on import. Surfaced via `/api/health`.
- **Auth rate limiting** `lib/rateLimit.ts` — in-memory fixed-window limiter
  (zero-dep). Login 10/5min, register 5/hour per IP → `429` + `Retry-After`.
  Per-instance only; Redis is the documented upgrade path.
- **Deployment docs** — new `docs/DEPLOYMENT.md` (local prod build, PostgreSQL,
  Prisma generate/push/seed, Vercel, Docker/VPS, rollback, backup/restore) and
  `docs/RELEASE_CHECKLIST.md` (pre-release gates + smoke tests).
- **Optional Docker** — `next.config.ts` `output: "standalone"` (Vercel ignores
  it), production multi-stage `Dockerfile`, `.dockerignore`, `public/.gitkeep`.
- **Tests** — 5 new zero-dep unit tests for the rate limiter and env checker
  (now 26 total; integration still self-skips without a DB).

### Updated
- `.env.example` fully annotated (required vs. required-in-prod vs. optional).

### Unchanged (verified)
- 5E learner flow, 5F publish gate / preview / worker placeholders, quiz scoring,
  public lesson visibility rules, seed data. Gates: lint 0 warnings, typecheck 0
  errors, build 0 errors (30 routes), 26 tests pass.

---

## Phase 5G — Production polish & documentation

Goal: production-readiness and documentation **without** changing the 5E learner
flow or the 5F admin CMS workflow.

### Added
- **Audit logging** — new `AuditLog` Prisma model + `server/services/auditService.ts`.
  Records sensitive admin mutations: publish / unpublish / archive (status) a lesson,
  delete a question, change a user role, toggle a user's premium flag. Best-effort
  (a logging failure never breaks the action). Read-only viewer at `/admin/audit`.
- **Admin Questions page** converted from mock to Prisma-backed, with a real
  `deleteQuestionAction` (server-side RBAC + Zod + audit). Answered questions
  cascade-delete their `AttemptAnswer` rows.
- **Consistent empty / error UI** — shared `EmptyState` and `Alert` components used
  across admin lessons, jobs, media, users, questions, the learner dashboard, and
  public lesson lists. Distinguishes "no data yet" from "no filter match".
- **SEO** — `sitemap.xml` (published content only; drafts/review/archived excluded),
  `robots.txt` (blocks `/admin`, `/api`, `/dashboard`, `/login`, `/register`),
  canonical URLs on every public route, and JSON-LD `LearningResource` on lesson
  pages. Site origin from `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL` via
  `lib/config.ts`.
- **Tests** — zero-dependency `tests/` suite run with `tsx`: `npm run test:unit`
  (publish gate, invalid-quiz blocking, premium access — no DB) and
  `npm run test:integration` (anonymous quiz not saved, learner quiz saved,
  admin-only preview visibility, worker-job idempotency — DB-gated, self-skips
  when no database is reachable). `npm test` runs both.

### Schema
- `AuditLog` model (actorId nullable + `onDelete: SetNull`, actorEmail snapshot,
  action / entityType / entityId / summary / metadata / createdAt). Applied with
  `prisma db push`.

### Unchanged (by design)
- 5E learner quiz/progress/premium flow.
- 5F publish gate, admin preview, worker/media placeholders.
- Payment stays disabled (`PAYMENT_ENABLED = false`).

### Known limitations / still placeholders
- No real payment, Redis queue, object storage (R2/S3), Typesense search, PDF
  generation, or audio processing. Worker jobs are DB rows only — no live worker.

---

## Phase 5F — Admin CMS lesson-authoring + publish hardening
- Publish gate (content-complete + valid quiz), admin preview route, Prisma-backed
  worker jobs and media, lesson filters, question counts, user activity counts.
- Schema: `AttemptAnswer.question` → `onDelete: Cascade`.

## Phase 5E — Learner flow hardening
- `Progress.lastPercentage` added. Anonymous quiz submissions scored but not
  persisted. `gradeAndPersist` enforces PUBLISHED + premium access.

## Phase 5A–5D — Database, auth, admin CMS foundation
- Prisma 7 + PostgreSQL schema/seed/adapter, Docker Compose.
- HTTP-only cookie sessions, server-side RBAC, learner dashboard, premium gate.
- Admin CMS for users, languages, skills, levels (premium placeholder).

See `next-app/docs/DATABASE_SETUP.md` for setup and per-phase database details.
