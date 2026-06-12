# LangPath Deployment Guide

> Phase 5H — Deployment & Runtime Hardening. This is the authoritative,
> step-by-step guide for deploying and operating the **Next.js app in
> `next-app/`**. The older `docs/DEPLOYMENT_NOTES.md` covers the historical
> static prototype and migration background; this file supersedes it for
> production operation.

The app is a Next.js 15 (App Router) application backed by PostgreSQL via
Prisma 7 (using the `@prisma/adapter-pg` driver adapter). Sessions are
HTTP-only cookies. There is no external queue, object storage, search engine,
or payment provider — those remain explicit placeholders.

---

## 1. Required environment variables

See `next-app/.env.example` for the fully annotated list. Summary:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string. Use a **pooled** URL on serverless. |
| `NEXT_PUBLIC_SITE_URL` (or `NEXT_PUBLIC_APP_URL`) | **In prod** | Canonical origin for SEO (sitemap/robots/canonical/JSON-LD). No trailing slash. |
| `AUTH_SECRET` | In prod | Reserved for future token signing. Set a unique random value (`openssl rand -hex 32`). |
| `SESSION_COOKIE_NAME` | No | Defaults to `llp_session`. |
| `NODE_ENV` | Auto | Hosts set `production`; controls cookie `secure` + log level. |
| `STORAGE_DRIVER` / `LOCAL_UPLOAD_DIR` / `SEARCH_DRIVER` / `WORKER_DRIVER` | No | Deferred-subsystem placeholders. Leave defaults. |
| `PAYMENT_ENABLED` | No | **Keep `false`.** No provider is wired. |
| `BUILD_SHA` / `BUILD_TIME` | No | Optional build metadata surfaced at `/api/version`. |

The healthcheck at **`/api/health`** validates the production-critical vars and
reports `error`/`warning` counts (without leaking values).

---

## 2. Local production build

Validate the exact build that ships before deploying:

```bash
cd next-app
cp .env.example .env            # then edit DATABASE_URL etc.
docker compose up -d            # local PostgreSQL 16 on :5432
npm install                     # runs `prisma generate` via postinstall

# Apply schema + seed (Prisma 7 CLI does NOT auto-load .env — export it):
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/language_learning_platform?schema=public"
npx prisma db push
npx tsx prisma/seed.ts

npm run build                   # production build
npm run start                   # serve on http://localhost:3000
```

Smoke-check:

```bash
curl -s http://localhost:3000/api/health   | jq      # status: ok, database.ok: true
curl -s http://localhost:3000/api/version  | jq
curl -s http://localhost:3000/robots.txt
curl -s http://localhost:3000/sitemap.xml | head
```

---

## 3. PostgreSQL setup

**Local:** `docker compose up -d` (see `next-app/docker-compose.yml`) — Postgres
16, db `language_learning_platform`, user/pass `postgres`/`postgres`.

**Production:** use a managed provider — Supabase, Neon, Railway, or Vercel
Postgres. Requirements:

- Create the database and copy its connection string into `DATABASE_URL`.
- On **serverless** (Vercel), use the provider's **pooled** connection string
  (PgBouncer / Supabase pooler / Neon pooler). Serverless functions open a
  connection per invocation; an unpooled URL exhausts connections fast.
- Restrict network access (allowlist / private networking) where the provider
  supports it.

### Prisma flow (generate / push / seed)

This repo has **no `prisma/migrations/` directory** — it uses `prisma db push`
to sync the schema (documented since Phase 5A).

```bash
# Regenerate the client after any schema.prisma change (also runs on npm install):
npx prisma generate

# Sync the schema to the database (creates/updates tables):
export DATABASE_URL="...your prod url..."
npx prisma db push

# Seed baseline content + accounts (idempotent — safe to re-run):
npx tsx prisma/seed.ts          # or: npm run prisma:seed
```

> Seeded accounts: `admin@example.com` / `learner@example.com` /
> `premium@example.com`, all password `Password123!`. **Change or remove these
> before exposing a real production deployment.**

If you later adopt migration files, switch production to
`npx prisma migrate deploy` instead of `db push`.

---

## 4. Vercel deployment

1. Import the repo in Vercel. Set **Root Directory** to `next-app`.
2. Framework preset: **Next.js** (auto-detected). Build command `npm run build`,
   output `.next`, Node.js **20.x**.
3. Add environment variables (Project → Settings → Environment Variables):
   - `DATABASE_URL` → **pooled** Postgres URL
   - `NEXT_PUBLIC_SITE_URL` → e.g. `https://thang-nv.vercel.app`
   - `AUTH_SECRET` → random 32+ char value
   - keep `PAYMENT_ENABLED=false`
4. First deploy will run `npm install` (→ `prisma generate`) then `npm run build`.
5. **One-time** after the first deploy, apply schema + seed against the prod DB
   from your machine (Vercel build does not touch the DB):
   ```bash
   cd next-app
   export DATABASE_URL="...prod url..."
   npx prisma db push
   npx tsx prisma/seed.ts
   ```
6. Verify `/api/health` returns `200` with `database.ok: true`.

`output: "standalone"` in `next.config.ts` is ignored by Vercel — safe to keep.

---

## 5. Docker / VPS deployment

A production `Dockerfile` (multi-stage, standalone output, non-root user) and
`.dockerignore` are included in `next-app/`.

```bash
cd next-app

# Build the image:
docker build -t langpath .

# Run it against a reachable Postgres (managed, or the compose one via host net):
docker run -p 3000:3000 --env-file .env langpath
```

On a VPS without Docker:

```bash
cd next-app
npm ci
export DATABASE_URL="..."
npx prisma db push && npx tsx prisma/seed.ts
npm run build
NODE_ENV=production npm run start   # or run a process manager (pm2/systemd) on `npm run start`
```

Put a reverse proxy (nginx/Caddy) in front for TLS, and point a healthcheck /
uptime monitor at `/api/health` (it returns `503` when the DB is down so the LB
can drain the instance).

---

## 6. Rollback

**Vercel:** Deployments tab → pick the last known-good deployment →
**Promote to Production** (instant; no rebuild). Confirm with `/api/version`
(commit) and `/api/health`.

**Docker/VPS:** keep the previous image tag and redeploy it:

```bash
docker run -p 3000:3000 --env-file .env langpath:<previous-tag>
```

**Code/git:** the deployable history is on `main`. To revert a bad change:

```bash
git revert <bad-commit>     # preferred — keeps history
git push origin main        # triggers a fresh good deploy
```

**Schema rollback:** `prisma db push` is not auto-reversible. Before a risky
schema change, take a database backup (next section) and keep the prior
`schema.prisma`. To undo, restore the prior schema file and `db push` again,
or restore from backup. Avoid destructive column drops without a backup.

---

## 7. Backup & restore checklist

PostgreSQL is the only stateful component. Backups are a provider feature plus
periodic logical dumps.

**Backup (logical dump):**

```bash
pg_dump "$DATABASE_URL" -Fc -f langpath-$(date +%Y%m%d-%H%M).dump
```

**Restore:**

```bash
pg_restore --clean --if-exists -d "$DATABASE_URL" langpath-YYYYMMDD-HHMM.dump
```

Checklist:

- [ ] Managed-provider automated daily backups enabled (Supabase/Neon/Railway).
- [ ] A manual `pg_dump` taken immediately **before** any `prisma db push` that
      changes/removes columns.
- [ ] Backup stored off the database host.
- [ ] Restore tested at least once into a scratch database.
- [ ] `DATABASE_URL` for backups uses a **direct** (non-pooled) connection.

> Object storage / uploaded media are out of scope (deferred placeholder) — the
> only durable state to back up today is PostgreSQL.

---

## 8. Operational endpoints

| Endpoint | Auth | Use |
|----------|------|-----|
| `GET /api/health` | public | Liveness + DB readiness. `200` healthy, `503` DB down. No secrets. |
| `GET /api/version` | public | App name, version, short commit, environment. |

Both are disallowed in `robots.txt` (the whole `/api` path is). Neither exposes
secrets or env values.

---

## 9. Continuous integration (CI)

GitHub Actions runs the release gates automatically (Phase 5I).

**`.github/workflows/ci.yml`** — runs on every pull request and on pushes to
`main`. From `next-app/` it executes: `npm ci` → `npx prisma generate` →
`npm run lint` → `npm run typecheck` → `npm run build` → `npm test`.

- **No secrets, no real database.** A throwaway unreachable `DATABASE_URL` is set
  so Prisma generates the client and the build runs (the build makes no DB
  queries — every DB-backed page/route is `force-dynamic`). The integration test
  suite probes `SELECT 1` and **self-skips** when the DB is unreachable, so unit
  tests still run and gate the merge.
- CI never seeds or mutates any database and never deploys.

**`.github/workflows/docker-build.yml`** — **optional**, in a separate workflow so
it is not a required merge gate. It builds the production image (no push, no
registry login, no secrets) and runs only on manual dispatch or when
Docker-relevant files change. Keep it out of branch-protection "required checks"
so a slow/flaky image build never blocks merges — the fast `ci.yml` job is the
gate. You can always verify the image locally instead:

```bash
cd next-app && docker build -t langpath .
```

---

## 10. Environments: local vs staging vs production

| Aspect | Local | Staging | Production |
|--------|-------|---------|------------|
| Purpose | Develop & run tests | Pre-release verification of a real build | Live users |
| Database | Docker Postgres on `:5432` | **Separate** managed Postgres (never prod) | Managed Postgres (pooled) |
| `NODE_ENV` | `development` | `production` | `production` |
| Site URL | `http://localhost:3000` | staging origin, e.g. `https://staging-langpath.vercel.app` | production origin |
| Seed accounts | OK | OK (test data only) | **Remove/rotate** seeded demo logins |
| `PAYMENT_ENABLED` | `false` | `false` | `false` |
| Smoke test | `npm run smoke` | `SMOKE_BASE_URL=<staging> npm run smoke` | `SMOKE_BASE_URL=<prod> npm run smoke` |

> **Golden rule:** staging gets its **own** database and its **own**
> `NEXT_PUBLIC_SITE_URL`. Never point staging at the production database.

---

## 11. Staging setup & verification

Staging is a full production build wired to a disposable database. On Vercel,
create a second project (or a preview environment) with Root Directory
`next-app`; on Docker/VPS, deploy the image to a staging host.

**1. Required staging env vars** (set in the host, not committed):

| Variable | Staging value |
|----------|---------------|
| `DATABASE_URL` | Staging Postgres connection string (pooled on serverless). **Not** production. |
| `NEXT_PUBLIC_SITE_URL` | The staging origin (no trailing slash). Drives sitemap/robots/canonical. |
| `AUTH_SECRET` | A unique random value (`openssl rand -hex 32`) — distinct from prod. |
| `NODE_ENV` | `production` (set automatically by most hosts). |
| `PAYMENT_ENABLED` | `false`. |

**2. Apply schema + seed to the staging database** (Prisma 7 CLI does not
auto-load `.env` — export the URL first):

```bash
cd next-app
export DATABASE_URL="...staging url..."
npx prisma generate
npx prisma db push          # create/update tables on staging DB
npx tsx prisma/seed.ts      # baseline content + demo accounts (idempotent)
```

> Seeded demo logins (all password `Password123!`):
> `admin@example.com` (admin), `learner@example.com`, `premium@example.com`.
> Fine for staging; **remove or rotate before production.**

**3. Automated smoke test** against the deployed staging URL:

```bash
cd next-app
SMOKE_BASE_URL=https://staging-langpath.vercel.app npm run smoke
```

This checks `/api/health` (must be `200`), `/api/version`, `/robots.txt`,
`/sitemap.xml`, and the public home page. It needs **no credentials**. To also
verify admin login, opt in:

```bash
SMOKE_BASE_URL=https://staging-langpath.vercel.app \
SMOKE_ADMIN_EMAIL=admin@example.com \
SMOKE_ADMIN_PASSWORD='Password123!' \
npm run smoke
```

**4. Manual smoke tests** (cannot be fully automated — do these on staging):

- **Admin test login:** sign in at `/login` as `admin@example.com` → land on
  `/admin`; confirm a learner account is redirected away from `/admin`.
- **Learner smoke test:** open a published lesson, submit the quiz as a
  logged-in learner → score returns and the attempt appears on `/dashboard`.

Only promote to production once staging is green. See
`docs/RELEASE_CHECKLIST.md` for the full staging-release flow.

---

## 12. Known limitations (by design this phase)

- **Rate limiting is per-instance** (in-memory). On multi-instance/serverless
  hosts the auth limit is enforced per lambda, not globally. Upgrade path: a
  shared store (Redis) — deferred.
- **No external log/metrics vendor.** Logs go to stdout/stderr via `lib/logger`.
- **No background queue / object storage / search engine / PDF / audio
  processing / payments** — explicit placeholders, unchanged this phase.
- **Schema sync uses `db push`**, not migration files.

See `docs/RELEASE_CHECKLIST.md` for the pre-release gate sequence.
