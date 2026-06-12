# LangPath Release Checklist

Run through this before promoting a build to production. All commands run from
`next-app/` unless noted. See `docs/DEPLOYMENT.md` for full deployment steps.

> **CI runs the pre-release gates for you.** `.github/workflows/ci.yml` executes
> lint → typecheck → build → test on every PR and on pushes to `main` (no
> secrets, no real DB). A green CI check covers the gates below; run them locally
> when iterating or when CI is unavailable.

---

## Pre-release gates (must all pass)

Run in order; stop on the first failure.

```bash
cd next-app

# 1. Lint — 0 warnings expected
npm run lint

# 2. Type check — 0 errors expected
npm run typecheck

# 3. Production build — 0 errors expected
npm run build

# 4. Tests — unit always run; integration self-skips without a DB
#    (export DATABASE_URL first to exercise the integration suite)
npm test

# 5. Prisma client generates cleanly
npx prisma generate
```

- [ ] `npm run lint` — 0 warnings
- [ ] `npm run typecheck` — 0 errors
- [ ] `npm run build` — succeeds, expected route count
- [ ] `npm test` — unit pass; integration pass (DB up) or self-skip (no DB)
- [ ] `npx prisma generate` — succeeds

---

## Database

- [ ] Target `DATABASE_URL` set (pooled URL for serverless).
- [ ] Connectivity check passes:
      ```bash
      curl -s http://localhost:3000/api/health | jq '.checks.database'
      # expect { "ok": true, "latencyMs": <n> }
      ```
- [ ] Schema applied: `npx prisma db push` (with `DATABASE_URL` exported).
- [ ] Seed run (first deploy only / when intended): `npx tsx prisma/seed.ts`.
- [ ] Fresh backup taken if this release changes `schema.prisma`.

---

## SEO / crawl surface

- [ ] `curl -s $SITE/robots.txt` — disallows `/admin`, `/api`, `/dashboard`,
      `/login`, `/register`; lists the sitemap.
- [ ] `curl -s $SITE/sitemap.xml` — builds and lists only **published** lessons
      (no draft/review/archived).
- [ ] `NEXT_PUBLIC_SITE_URL` resolves to the real production origin in both
      (no `localhost`).

---

## Runtime / config

- [ ] `curl -s $SITE/api/health` → `200` with `status: "ok"`.
- [ ] `curl -s $SITE/api/version` → correct version + commit.
- [ ] Health env check: `errors: 0` (warnings acceptable, review them).
- [ ] `PAYMENT_ENABLED` is `false`.
- [ ] `AUTH_SECRET` is set to a unique value (not the placeholder).

---

## Automated smoke test (against the deployed build)

Run the smoke script against the deployed origin (staging first, then prod):

```bash
cd next-app
SMOKE_BASE_URL=https://staging-langpath.vercel.app npm run smoke
```

- [ ] `/api/health` → `200` (script fails on `503` = DB down).
- [ ] `/api/version` responds with a version.
- [ ] `/robots.txt` and `/sitemap.xml` build and serve.
- [ ] Public home page serves.
- [ ] (Optional) admin login: set `SMOKE_ADMIN_EMAIL` + `SMOKE_ADMIN_PASSWORD`.

---

## Manual smoke tests (against the deployed build)

- [ ] **Admin login:** sign in at `/login` as an admin → reach `/admin`;
      a non-admin is redirected away from `/admin`.
- [ ] **Learner quiz:** open a published lesson, submit the quiz as a logged-in
      learner → score returns and the attempt is saved (visible on `/dashboard`).
- [ ] **Anonymous quiz:** submit a free lesson quiz while logged out → scored
      but `saved: false` (no attempt persisted).
- [ ] **Access control:** `/admin` and `/dashboard` redirect to `/login` when
      logged out; premium lesson blocked for non-premium learner.
- [ ] **Publish gate:** an admin cannot publish a lesson with an invalid quiz.

---

## Post-release

- [ ] `/api/version` reports the new commit.
- [ ] `/api/health` is `200` and wired to the uptime monitor.
- [ ] Known-good previous deployment identified for one-click rollback
      (see `docs/DEPLOYMENT.md` §6).

---

## Staging release flow

Promote through staging before production. Stop at the first red step.

1. [ ] **Merge the PR** to `main` (CI green — see top of this file).
2. [ ] **Deploy to staging** (separate project/host + separate DB; never the prod
       DB). Apply schema/seed if needed — `docs/DEPLOYMENT.md` §11.
3. [ ] **Run smoke tests:** `SMOKE_BASE_URL=<staging> npm run smoke` → all pass.
4. [ ] **Verify healthcheck:** `/api/health` → `200`, `database.ok: true`,
       env `errors: 0`.
5. [ ] **Verify SEO surface:** `/robots.txt` disallows `/admin /api /dashboard
       /login /register`; `/sitemap.xml` lists only published lessons; site URL
       is the staging origin (no `localhost`).
6. [ ] **Verify login manually:** admin reaches `/admin`; a learner is redirected
       away from `/admin`.
7. [ ] **Verify learner quiz manually:** submit a published lesson's quiz as a
       logged-in learner → scored and saved (shows on `/dashboard`).
8. [ ] **Approve production release** only when steps 3–7 are all green. Deploy
       prod, then re-run the smoke test and healthcheck against the prod origin
       and confirm `/api/version` shows the new commit.

---

## Rollback

**App rollback (fast, safe):**

- **Vercel:** Deployments → previous known-good → **Promote to Production**
  (instant, no rebuild). Confirm with `/api/version` + `/api/health`.
- **Docker/VPS:** redeploy the previous image tag
  (`docker run ... langpath:<previous-tag>`).
- **Git:** `git revert <bad-commit> && git push origin main` triggers a fresh
  good deploy (preferred over force-push — keeps history).

**Database rollback (limited — read before a schema change):**

- Schema sync uses `prisma db push`, which is **not auto-reversible**. There are
  no migration files to step back through.
- **Before** any release that changes `schema.prisma` (esp. dropping/renaming
  columns), take a `pg_dump` backup (`docs/DEPLOYMENT.md` §7) and keep the prior
  `schema.prisma`.
- To undo: restore the prior `schema.prisma` and `db push` again, or restore the
  backup with `pg_restore`. **Rolling back app code does not roll back the
  database** — a schema change already applied stays applied until you reverse it
  explicitly.
- Additive, backward-compatible schema changes (new nullable columns/tables) let
  an app rollback succeed without a DB rollback; destructive changes do not.
