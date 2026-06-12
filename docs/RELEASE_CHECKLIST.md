# LangPath Release Checklist

Run through this before promoting a build to production. All commands run from
`next-app/` unless noted. See `docs/DEPLOYMENT.md` for full deployment steps.

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

## Smoke tests (against the deployed build)

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
