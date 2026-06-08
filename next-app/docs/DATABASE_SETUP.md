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
- 2 users (`admin@example.com` / `learner@example.com`, both with password `Password123!`)
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
