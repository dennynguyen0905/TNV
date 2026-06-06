# docs/NEXT_MIGRATION_LOG.md — Next.js Migration Log

## Phase 5A — Prisma + PostgreSQL Foundation

**Date:** 2026-06-06
**Status:** Schema, seed, singleton client, Docker helper, docs — build passing, UI still mock

### What Was Done in Phase 5A

**Schema (`prisma/schema.prisma`):**
- 9 enums: `UserRole`, `UserStatus`, `LessonStatus`, `QuestionType`, `ProgressStatus`, `AttemptStatus`, `MediaType`, `WorkerJobType`, `WorkerJobStatus`
- 11 models: `User`, `Language`, `Skill`, `Level`, `Lesson`, `Question`, `QuestionOption`, `Attempt`, `AttemptAnswer`, `Progress`, `Media`, `WorkerJob`
- Compound unique on Lesson: `@@unique([languageId, skillId, slug])`
- Cascade deletes on Question → QuestionOption and Attempt → AttemptAnswer
- Indexes on all foreign keys and common filter columns

**Seed (`prisma/seed.ts`):**
- 4 languages (English, German, French, Spanish)
- 5 skills (Reading, Listening, Dictation, Grammar, Vocabulary)
- 6 CEFR levels (A1–C2)
- 2 users: `admin@example.com` / `learner@example.com` (password: `Password123!`, bcrypt hash)
- 5 English A1 lessons with original content (no copyrighted material)
- Questions covering all 4 types: SINGLE_CHOICE, MULTIPLE_CHOICE, FILL_BLANK, DICTATION
- 3 media placeholders (audio + PDF)
- 3 worker job placeholders (INDEX_SEARCH, REVALIDATE_CACHE, GENERATE_PDF)
- Idempotent — safe to run multiple times (upserts throughout)

**Client (`lib/prisma.ts`):**
- Standard Next.js singleton pattern (avoids too-many-connections during hot reload)
- Development: logs queries, errors, warnings
- Production: logs errors only

**Infrastructure:**
- `docker-compose.yml` — local PostgreSQL 16 on port 5432
- `.env.example` — all required env vars with safe defaults
- `docs/DATABASE_SETUP.md` — step-by-step local setup guide

**`package.json` changes:**
- Added scripts: `prisma:generate`, `prisma:migrate`, `prisma:seed`, `prisma:studio`, `db:reset`
- Added `postinstall: "prisma generate"` for Vercel and CI compatibility
- Added `prisma.seed` config pointing to `tsx prisma/seed.ts`
- Added dependencies: `bcryptjs`, `tsx`, `@types/bcryptjs`

**Build:**
```
npm run lint   → ✓ No ESLint warnings or errors
npm run build  → ✓ routes compiled, 0 TypeScript errors
```

### Known State After Phase 5A

- Admin and learner UI still reads from `data/mock/` — Prisma is not wired to any page yet
- Auth is still placeholder (no real session)
- Migration requires a running PostgreSQL — see `docs/DATABASE_SETUP.md`

### Commands to Initialize the Database

```bash
cp .env.example .env                        # configure DATABASE_URL
docker compose up -d                        # start local PostgreSQL
npm install                                 # also runs prisma generate via postinstall
npx prisma migrate dev --name init          # create all tables
npx prisma db seed                          # load seed data
npx prisma studio                           # optional: browse data in browser
```

---

## Phase 4 — Mock UI Complete

**Date:** 2026-06-06
**Status:** Interactive admin forms, quiz runner, special lesson types — build passing

### What Was Done in Phase 4

**Admin:**
- `components/admin/LessonForm.tsx` — full lesson create/edit form (client component) with embedded Q&A editor supporting all 4 question types
- `/admin/lessons` — search + skill/status filters + toggle premium + delete confirmation
- `/admin/questions` — search + type filter + delete confirmation
- `/admin/languages` — activate/deactivate toggle
- `/admin/users` — search + role filter + toggle premium + delete confirmation
- `/admin/media` — search + type filter + delete confirmation
- `/admin/jobs` — status+type filters + cancel PENDING/RUNNING + trigger job modal

**Learner:**
- `components/quiz/QuizRunner.tsx` — interactive client component, all 4 question types, score + pass/fail, explanations after submit, retry
- `components/lesson/DictationPractice.tsx` — per-sentence practice with check/retry
- `components/lesson/VocabCards.tsx` — tap-to-reveal flashcards with Known toggle
- Lesson detail page: skill-based routing (Listening = audio placeholder + transcript, Dictation = DictationPractice, Vocabulary = VocabCards, Reading/Grammar = text + QuizRunner)

**Build:**
```
npm run lint   → ✓ No ESLint warnings or errors
npm run build  → ✓ 19 routes compiled, 0 TypeScript errors
```

---

## Phase 3 — Next.js App Router Scaffold

**Date:** 2026-06-06
**Status:** Scaffold complete, build passing

---

## What Was Done

Created `next-app/` as a parallel Next.js App Router application. The static prototype at `LangPath.html` is **untouched**.

### Stack

- Next.js 15.3.4 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 3
- ESLint (next/core-web-vitals)

### Build Status

```
npm run build  →  ✓ 19 routes compiled, 0 errors
npm run typecheck  →  0 TypeScript errors
```

---

## next-app/ Folder Structure

```
next-app/
  package.json            deps: next, react, tailwindcss, typescript
  tsconfig.json           strict TS, @/* alias
  next.config.ts
  tailwind.config.ts      mirrors tokens.css color tokens
  postcss.config.mjs
  .eslintrc.json

  app/
    layout.tsx            root layout with Inter font metadata
    page.tsx              home page with language cards + featured lessons
    globals.css           CSS variables from tokens.css + Tailwind base
    dashboard/page.tsx
    admin/
      layout.tsx          admin header + sidebar layout
      page.tsx            dashboard stats + recent lessons/users
      lessons/
        page.tsx          lessons table with status/premium badges
        new/page.tsx      (shell — form migration pending)
        [id]/edit/page.tsx
      questions/page.tsx  questions table with type badges
      languages/page.tsx  languages table with flag icons
      users/page.tsx      users table with role/premium/status badges
      media/page.tsx      media assets table
      jobs/page.tsx       worker jobs table with type/status badges
    login/page.tsx
    register/page.tsx
    [languageSlug]/page.tsx
    [languageSlug]/[skillSlug]/page.tsx
    [languageSlug]/[skillSlug]/[lessonSlug]/page.tsx

  components/
    ui/
      Badge.tsx           color-mapped badge (blue/green/amber/red/gray/purple)
      Button.tsx          primary/secondary/ghost/danger × sm/md/lg
      Card.tsx            shadow-card with optional hover state
      Icon.tsx            inline SVG icon library (20+ icons)
      Input.tsx           Input, Textarea, SelectInput with labels + error states
      Modal.tsx           overlay modal with ESC close
      ProgressBar.tsx     animated progress with color variants
    layout/
      Header.tsx          sticky site header with nav + auth CTAs
      Footer.tsx          minimal footer with logo + copyright
      AdminSidebar.tsx    client component with active-route highlighting
      Logo.tsx            wordmark link to /
      FlagIcon.tsx        inline SVG flags for English/German/French/Spanish

  data/
    types.ts              all domain types exported
    constants/
      languages.ts
      skills.ts
      levels.ts
      lesson-statuses.ts
      roles.ts
      job-types.ts
      job-statuses.ts
    mock/
      lessons.ts          SAMPLE_LESSONS + ADMIN_MOCK_LESSONS
      questions.ts        MOCK_QUESTIONS + QUIZ_QUESTIONS + LESSON_TEXT + helpers
      users.ts
      vocabulary.ts
      worker-jobs.ts
      media-assets.ts

  lib/
    utils.ts              cn(), slugify(), formatDate()
```

---

## Routes Scaffolded

| Route | Status | Notes |
|-------|--------|-------|
| `/` | ✅ Full | Language cards + featured lessons |
| `/dashboard` | ✅ Shell | Mock progress, stats, lesson list |
| `/login` | ✅ Shell | Form UI (no real auth) |
| `/register` | ✅ Shell | Form UI (no real auth) |
| `/admin` | ✅ Full | Stats cards + recent lessons/users |
| `/admin/lessons` | ✅ Full | Table with status/premium badges + Edit links |
| `/admin/lessons/new` | ✅ Shell | Placeholder — form migration pending |
| `/admin/lessons/[id]/edit` | ✅ Shell | Shows lesson info — form migration pending |
| `/admin/questions` | ✅ Full | Table with type badges |
| `/admin/languages` | ✅ Full | Table with flag icons + skill badges |
| `/admin/users` | ✅ Full | Table with role/premium/status badges |
| `/admin/media` | ✅ Full | Media assets table |
| `/admin/jobs` | ✅ Full | Worker jobs table with type/status badges |
| `/[languageSlug]` | ✅ Full | Language hero + skill cards |
| `/[languageSlug]/[skillSlug]` | ✅ Full | Filtered lesson cards |
| `/[languageSlug]/[skillSlug]/[lessonSlug]` | ✅ Partial | Full for first-day-school (text + quiz + vocab), shell for others |

---

## Components Migrated

| Prototype | Next.js |
|-----------|---------|
| `ui.jsx` → Button | `components/ui/Button.tsx` |
| `ui.jsx` → Badge | `components/ui/Badge.tsx` |
| `ui.jsx` → Input, Textarea, SelectInput | `components/ui/Input.tsx` |
| `ui.jsx` → Card | `components/ui/Card.tsx` |
| `ui.jsx` → Modal | `components/ui/Modal.tsx` |
| `ui.jsx` → ProgressBar | `components/ui/ProgressBar.tsx` |
| `ui.jsx` → Icon | `components/ui/Icon.tsx` |
| `layout.jsx` → Header | `components/layout/Header.tsx` |
| `layout.jsx` → Footer | `components/layout/Footer.tsx` |
| `layout.jsx` → AdminSidebar | `components/layout/AdminSidebar.tsx` |
| `layout.jsx` → Logo | `components/layout/Logo.tsx` |
| `layout.jsx` → FlagIcon | `components/layout/FlagIcon.tsx` |
| `tokens.css` | `app/globals.css` + `tailwind.config.ts` |
| All `data/constants/*.js` | `data/constants/*.ts` |
| All `data/mock/*.js` | `data/mock/*.ts` |

---

## Data Migrated

All data files converted from `window` globals to typed TypeScript ES modules:

- `data/types.ts` — 16 domain types
- `data/constants/` — 7 constant files
- `data/mock/` — 6 mock data files

---

## Known Gaps (after Phase 4)

1. **Lesson content** — Only `first-day-school` has real text. All other lessons show a placeholder until Prisma + DB are connected.
2. **Mock state only** — Admin CRUD (create/edit/delete) resets on page reload. No persistence.
3. **Auth** — Login/register forms submit to nowhere. No session management.
4. **Admin table metadata** — Client component pages lost their `<title>` metadata export (acceptable for mock phase; add server wrapper in Phase 5).
5. **Vocabulary lesson quiz** — Vocab cards show but no quiz follows (no MOCK_QUESTIONS for vocab lessons).
6. **Grammar skill** — Falls through to Reading UI (no dedicated grammar section).
7. **No pagination** — All tables show all rows.
8. **Question state isolation** — Questions edited in LessonForm and questions shown in `/admin/questions` are independent in-memory state.

---

## Recommended Next Steps (Phase 5)

1. `npm install prisma @prisma/client`
2. Create `prisma/schema.prisma` matching `docs/DATA_MODEL.md`
3. Set up PostgreSQL (local or Vercel Postgres)
4. Run `npx prisma migrate dev --name init`
5. Create `prisma/seed.ts` with original sample content
6. Replace `data/mock/` reads with Prisma Client queries in server components
7. Add real auth (HTTP-only cookie sessions)

---

## How to Run

### Static prototype (unchanged)

```bash
npx serve .
# open http://localhost:3000/LangPath.html
```

### Next.js app

```bash
cd next-app
npm install
npm run dev
# open http://localhost:3000
```
