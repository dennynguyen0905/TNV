# Database Setup — Phase 5A

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

## What Comes Next (Phase 5B)

Replace mock data reads/writes with Prisma in:

1. Public lesson catalog (server components)
2. Admin CRUD operations (server actions)
3. Auth (real session-based login/register)
4. Quiz submission persistence (Attempt + AttemptAnswer)
5. Learner dashboard (real Progress data)
