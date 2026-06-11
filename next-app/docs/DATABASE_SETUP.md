# Database Setup — Phase 5A / 5B / 5C

## What Phase 5A Adds

- Prisma ORM with PostgreSQL provider
- Full schema: User, Language, Skill, Level, Lesson, Question, QuestionOption, Attempt, AttemptAnswer, Progress, Media, WorkerJob
- Seed script with original sample data (languages, skills, levels, users, lessons, questions, media, worker jobs)
- Prisma singleton client (`lib/prisma.ts`)
- Docker Compose for local PostgreSQL
- `.env.example` with all required environment variables

The admin and learner UI **remains mock-driven** after Phase 5A. Prisma reads/writes replace the mock layer in Phase 5B.

---

## Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL) — or any PostgreSQL 14+ server
- npm

---

## Local Setup (Step by Step)

### 1. Start PostgreSQL

**With Docker (recommended):**

```bash
cd next-app
docker compose up -d
```

This starts a PostgreSQL 16 container named `langpath-postgres` on port `5432`.

**Without Docker:** create a local PostgreSQL database named `language_learning_platform` and a user with password.

---

### 2. Create Your `.env` File

```bash
cp .env.example .env
```

The default `DATABASE_URL` in `.env.example` matches the Docker Compose configuration exactly:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/language_learning_platform?schema=public"
```

If you use a different PostgreSQL server, update this value.

---

### 3. Install Dependencies

```bash
npm install
```

`postinstall` automatically runs `prisma generate`.

---

### 4. Generate Prisma Client

If you need to regenerate manually:

```bash
npx prisma generate
```

---

### 5. Run Migrations

```bash
npx prisma migrate dev --name init
```

This creates all tables in the `language_learning_platform` database.

---

### 6. Seed the Database

```bash
npx prisma db seed
```

Seeds:
- 4 languages (English, German, French, Spanish)
- 5 skills (Reading, Listening, Dictation, Grammar, Vocabulary)
- 6 levels (A1–C2)
- 3 users (`admin@example.com`, `learner@example.com`, `premium@example.com`, all with password `Password123!`; admin and premium have `isPremium=true`)
- 5 English A1 lessons with questions and media
- 3 worker job placeholders

---

### 7. Open Prisma Studio (Optional)

```bash
npx prisma studio
```

Opens a browser-based database explorer at `http://localhost:5555`.

---

### 8. Verify the App

```bash
npm run lint    # must pass with 0 errors
npm run build   # must pass cleanly
npm run dev     # start dev server on http://localhost:3000
```

---

## Package Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run prisma:generate` | `prisma generate` | Regenerate Prisma Client after schema changes |
| `npm run prisma:migrate` | `prisma migrate dev` | Create and apply a new migration |
| `npm run prisma:seed` | `prisma db seed` | Run the seed script |
| `npm run prisma:studio` | `prisma studio` | Open database browser |
| `npm run db:reset` | `prisma migrate reset` | Reset DB and re-run all migrations + seed |

---

## Production Deployment

1. Use Vercel Postgres, Supabase, or Railway for the hosted database.
2. Set `DATABASE_URL` in Vercel → Project → Settings → Environment Variables.
3. Use connection pooling (PgBouncer / Supabase pooler) because Vercel serverless opens a new connection per request.
4. Run migrations with `prisma migrate deploy` (not `migrate dev`) in production CI/CD.
5. Run seed once: `npx prisma db seed` — seeding twice is safe (upserts).

---

## Schema Overview

```
User            — LEARNER | ADMIN, with hashed password
Language        — en/de/fr/es, isActive, sortOrder
Skill           — reading/listening/dictation/grammar/vocabulary
Level           — A1–C2 CEFR codes
Lesson          — unique(languageId, skillId, slug), DRAFT→PUBLISHED lifecycle
Question        — SINGLE_CHOICE | MULTIPLE_CHOICE | FILL_BLANK | DICTATION
QuestionOption  — belongs to Question, isCorrect flag
Attempt         — nullable userId (anonymous allowed), score + status
AttemptAnswer   — selectedOptionIds as JSON array, textAnswer for FILL_BLANK/DICTATION
Progress        — unique(userId, lessonId), bestPercentage, NOT_STARTED→COMPLETED
Media           — AUDIO | IMAGE | PDF | OTHER, nullable lessonId
WorkerJob       — GENERATE_PDF | PROCESS_AUDIO | INDEX_SEARCH | REVALIDATE_CACHE
```

---

## Phase 5B Changes (current)

Phase 5B replaced all mock reads/writes with Prisma in:

1. **Public lesson catalog** — home page, language page, skill page, lesson detail page (server components, `force-dynamic`)
2. **Admin lesson CRUD** — list, create, edit, archive (server actions + `revalidatePath`)
3. **Quiz persistence** — `POST /api/attempts` grades server-side, creates Attempt + AttemptAnswer; correct answers never exposed to client before submit
4. **Progress** — updated when a user ID is available (Phase 5C adds real auth)

### New architecture

```
server/repositories/   — raw Prisma queries
server/services/       — business logic (lessonService, quizService, adminLessonService, progressService)
server/mappers/        — Prisma → UI type conversion (lessonMapper, questionMapper)
lib/validators.ts      — Zod schemas for all mutations
app/admin/lessons/actions.ts  — server actions (create, update, archive, publish, togglePremium)
app/api/attempts/route.ts     — quiz grading + Attempt persistence
components/quiz/QuizRunnerDB.tsx — client quiz runner that POSTs to /api/attempts
```

### Security note

- Admin pages are currently **not protected by server-side auth** (Phase 5C TODO).
- Quiz answers are **never sent to the client** before submission — the `PublicQuestion` type in `server/mappers/questionMapper.ts` contains only id, type, prompt, options text, sortOrder.
- Payment remains disabled (`PAYMENT_ENABLED=false`).

## Phase 5C Changes (current)

Phase 5C adds HTTP-only cookie session auth, server-side RBAC, learner dashboard, and premium gating.

### New migration

```bash
npx prisma migrate dev --name phase5c_auth
npx prisma db seed
```

The migration adds the `Session` table (tokenHash stored as SHA-256 hash, raw token in cookie).

### Auth endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new LEARNER account |
| POST | `/api/auth/login` | Log in, set HTTP-only session cookie |
| POST | `/api/auth/logout` | Clear session cookie + delete DB record |
| GET  | `/api/me` | Return current user info or 401 |

### Test credentials (from seed)

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | Password123! | ADMIN |
| learner@example.com | Password123! | LEARNER |

### RBAC

- `/admin/**` — server-side guard in `app/admin/layout.tsx` via `requireAdmin()`; redirects to `/login` if unauthenticated, `/` if not ADMIN.
- All admin server actions (`createLessonAction`, `updateLessonAction`, etc.) reject non-admin callers with `{ ok: false, error: "Unauthorized" }`.
- `/dashboard` — requires login via `requireUser()`; redirects to `/login` if unauthenticated.
- Anonymous users can browse public lessons and submit quizzes (attempt persists with `userId = null`).

### Premium gate

- Free lessons visible to everyone.
- Premium lessons visible only to ADMIN or users with `isPremium = true`.
- Non-premium authenticated users see a locked card with a "Browse free lessons" CTA.

### Session security

- Raw token: 32 random bytes hex-encoded, stored in HTTP-only cookie (`llp_session` by default).
- Stored token: SHA-256 hash of the raw token — never the raw token itself.
- Cookie flags: `httpOnly`, `sameSite: lax`, `path: /`, `secure` in production.
- Sessions expire after 30 days; expired sessions are deleted on next access.

## Phase 5D Changes (current)

Phase 5D expands the admin CMS so an admin can manage **users** and the core learning **taxonomy** (languages, skills, levels) directly from the database. It builds on the Phase 5C auth/RBAC and follows the same repository → service → mapper → server-action pattern used for lessons. **No schema migration is required** — all needed columns already exist (`User.role/status/isPremium`, `Language/Skill.isActive/sortOrder/description`). Levels are managed with their existing fields (`code`, `name`, `sortOrder`).

### New admin CMS pages

| Path | Purpose |
|------|---------|
| `/admin` | Dashboard — real DB summary cards (users, premium users, languages active/total, skills, levels, lessons, published lessons) + recent users/lessons |
| `/admin/users` | List + manage users |
| `/admin/languages` | List + create/edit + activate/deactivate languages |
| `/admin/skills` | List + create/edit + activate/deactivate skills |
| `/admin/levels` | List + create/edit CEFR levels |

The sidebar (`components/layout/AdminSidebar.tsx`) now includes **Skills** and **Levels** alongside the existing items.

### User management

From `/admin/users` an admin can:

- **Change role** between `ADMIN` and `LEARNER`. A self-demotion guard prevents the logged-in admin from removing their own admin role.
- **Toggle `isPremium`** on any user (premium placeholder — see below).
- **Deactivate / reactivate** (`UserStatus` `ACTIVE` ⟷ `DISABLED`). Admins cannot disable their own account. A disabled user is treated as logged out by `getCurrentUser()` and loses all access on the next request.
- **Edit name and email**. Email is normalized to lowercase and checked for uniqueness; a clash returns a clear "Email already in use" error.

Password hashes and session tokens are **never** sent to the client — the admin-safe DTO is produced by `server/mappers/userMapper.ts`.

### Language / Skill / Level management

- Languages and skills support **create, edit, and active/inactive toggle**. Slugs are normalized to lowercase kebab-case (`slugify`) and must be unique (language code is also unique). Public pages keep reading **active** records only, so deactivating hides a language/skill from the public site without deleting content.
- Levels support **create and edit** (`code`, `name`, `sortOrder`); CEFR ordering is preserved via `sortOrder`. Level `code` is uppercased and must be unique.
- Hard deletes are intentionally not exposed for taxonomy that lessons depend on; prefer deactivation (languages/skills).

### Premium placeholder

- `User.isPremium` is toggled from the users page; `Lesson.isPremium` continues to work from the lessons page.
- Premium lesson access is unchanged from Phase 5C: ADMINs and `isPremium` users can open premium lessons; free lessons are open to everyone; other learners see a locked/preview state.
- **Real payment remains deferred.** `lib/config.ts` exports `PAYMENT_ENABLED = false`. No checkout, subscriptions, webhooks, or payment providers (Stripe/PayPal/MoMo/VNPay/ZaloPay) are implemented.

### Commands

```bash
npm run lint          # 0 warnings
npm run build         # 0 errors
npm run prisma:seed   # idempotent — safe to re-run
# No migration needed: schema is unchanged in Phase 5D.
```

### Test credentials (from seed)

| Email | Password | Role | Premium |
|-------|----------|------|---------|
| admin@example.com | Password123! | ADMIN | yes |
| learner@example.com | Password123! | LEARNER | no |
| premium@example.com | Password123! | LEARNER | yes |

### Still deferred

- Payments / subscriptions (`PAYMENT_ENABLED=false`).
- Media upload to cloud storage, real PDF generation, real audio processing.
- Search indexing (Typesense), background queues (Redis).
- The `/admin/questions`, `/admin/media`, and `/admin/jobs` pages remain placeholders.
