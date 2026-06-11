# LangPath — Language Learning Platform

## Overview

* [ ] LangPath is an online language learning platform for reading, listening, dictation, grammar, and vocabulary practice. Lessons are organized by language, skill, and CEFR level (A1–C2). Learners can take quizzes, track progress, and access free and premium content.

**Deployed reference:** https://thang-nv.vercel.app/

## Current Status

- **Stage:** Phase 5G complete — production-ready Next.js app on Prisma 7 + PostgreSQL with auth, RBAC, admin CMS, learner flow, audit logging, and SEO. (The static `LangPath.html` prototype remains for reference.)
- **Framework:** Next.js 15.3.4 + React 19 + TypeScript + Tailwind CSS (see `next-app/`)
- **Database:** PostgreSQL via Prisma 7 (`@prisma/adapter-pg`); schema synced with `prisma db push` (no migrations dir); idempotent seed.
- **Auth:** HTTP-only cookie sessions, SHA-256 token hashes, server-side RBAC (`requireUser` / `requireAdmin`).
- **Admin CMS:** Prisma-backed Lessons (authoring + publish gate + preview), Questions (delete), Languages, Skills, Levels, Users, Media (metadata), Worker Jobs (placeholder), and a read-only **Audit Log**.
- **Learner:** Real quiz grading + persisted Attempts/Progress for logged-in users (anonymous attempts are scored but not saved), dashboard, premium gate.
- **SEO:** `sitemap.xml` (published content only), `robots.txt` (admin/api blocked), canonical URLs, JSON-LD on lesson pages.
- **Tests:** Zero-dep `tests/` suite via `tsx` — `npm test` (unit + DB-gated integration).
- **Payment:** Intentionally disabled (`PAYMENT_ENABLED = false`) — premium is a placeholder gate only.
- **Changelog:** See `docs/CHANGELOG.md`, `next-app/docs/DATABASE_SETUP.md`, and `docs/NEXT_MIGRATION_LOG.md`.

## Main Features (Current Prototype)

- Home page with language cards and popular lessons
- Language detail page with skill cards
- Skill lesson list with level filter and search
- Reading lesson page with quiz and vocabulary sidebar
- Listening lesson page with audio player and quiz
- Dictation lesson page with word-by-word correction
- Vocabulary flashcard practice page
- Login and register pages (mock — no real auth)
- Learner dashboard (mock data)
- **Admin — Dashboard** with stats derived from mock data
- **Admin — Lessons** full CRUD: create, edit, delete (modal), publish/unpublish, auto-slug
- **Admin — Questions** full CRUD: add/edit/delete questions, answer options, correct answer marking (standalone page)
- **Admin — Lesson Form** embeds question editor: collapsible Q&A panel scoped to the current lesson
- **Admin — Languages** list with active toggle, add/edit modal
- **Admin — Users** table with role selector, premium toggle, activate/deactivate
- **Admin — Media** asset list with delete, upload placeholder
- **Admin — Jobs** job list with status filter, cancel, trigger job modal

## Target Tech Stack

| Layer     | Technology                      |
| --------- | ------------------------------- |
| Framework | Next.js App Router              |
| Language  | TypeScript                      |
| Styling   | Tailwind CSS + shadcn/ui        |
| Forms     | React Hook Form + Zod           |
| ORM       | Prisma                          |
| Database  | PostgreSQL                      |
| Auth      | HTTP-only cookie sessions, RBAC |
| Search    | Database search for MVP         |
| Jobs      | Worker placeholder abstraction  |

## Current Folder Structure

```
LangPath.html           Entry point — loads data files then Babel JSX components
tokens.css              Design tokens and global CSS (CSS custom properties)

data/
  constants/
    languages.js        LANGUAGES_DATA — window global + LangPathConstants
    skills.js           SKILL_ICONS, SKILL_COLORS
    levels.js           LEVELS (A1–C2)
    lesson-statuses.js  LESSON_STATUSES, LESSON_STATUS_COLORS
    roles.js            ROLES (LEARNER, ADMIN, EDITOR)
    job-types.js        JOB_TYPES, JOB_TYPE_LABELS
    job-statuses.js     JOB_STATUSES, JOB_STATUS_COLORS
  mock/
    lessons.js          SAMPLE_LESSONS, ADMIN_MOCK_LESSONS
    questions.js        QUIZ_QUESTIONS, LESSON_TEXT, VOCAB_WORDS, MOCK_QUESTIONS
    vocabulary.js       VOCAB_PRACTICE_WORDS (flashcard page)
    users.js            MOCK_USERS
    worker-jobs.js      MOCK_WORKER_JOBS
    media-assets.js     MOCK_MEDIA_ASSETS

tweaks-panel.jsx        Prototype edit-mode tweaks panel (layout/card/density controls)
ui.jsx                  Base UI components: Button, Badge, Input, Textarea, SelectInput,
                        SearchInput, Card, ProgressBar, Modal, Tabs, Icon
layout.jsx              Header, Footer, Breadcrumb, AdminSidebar, FlagIcon, Logo
learning.jsx            Shared learning components (data removed — comes from data/ files):
                        LanguageCard, SkillCard, LevelFilter, LessonCard, AudioPlayer,
                        QuizQuestion, QuizResult, VocabularyCardComp
home-page.jsx           HomePage
language-pages.jsx      LanguageDetailPage, SkillLessonListPage
lesson-page.jsx         LessonDetailPage (reading + quiz)
special-lessons.jsx     ListeningLessonPage, DictationLessonPage, VocabularyPracticePage
auth-dashboard.jsx      LoginPage, RegisterPage, LearnerDashboard
admin-pages.jsx         AdminDashboard, AdminLessonList, AdminLessonForm,
                        AdminQuestionsPage, AdminLanguagesPage, AdminUsersPage,
                        AdminMediaPage, AdminJobsPage
app.jsx                 App root — router, all 16 page cases, TweaksPanel wiring
```

## Target Folder Structure (after Next.js migration)

```
app/
  (public)/
    page.tsx
    [languageSlug]/
      page.tsx
      [skillSlug]/
        page.tsx
        [lessonSlug]/page.tsx
  admin/
    page.tsx
    languages/ skills/ levels/ lessons/ media/ jobs/ users/
  dashboard/page.tsx
  login/page.tsx
  register/page.tsx
  api/
    auth/ languages/ skills/ lessons/ attempts/ admin/
components/
  ui/ layout/ lesson/ quiz/ admin/ dashboard/
data/
  mock/ constants/
lib/
  auth/ db/ permissions/ validators/ seo/ scoring/ jobs/ storage/
server/
  services/ repositories/
prisma/
  schema.prisma
  seed.ts
docs/
```

## How to Run

### Static prototype (no build step)

```bash
npx serve .
# open http://localhost:3000/LangPath.html
```

### Next.js app (production stack — Prisma + PostgreSQL)

```bash
cd next-app
docker compose up -d          # local PostgreSQL (langpath-postgres on :5432)
cp .env.example .env
npm install                   # postinstall runs `prisma generate`

# The Prisma CLI does NOT auto-load .env — export DATABASE_URL first.
# PowerShell:  $env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/language_learning_platform?schema=public"
# bash:        export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/language_learning_platform?schema=public"
npx prisma db push            # sync schema (no migrations directory)
npx tsx prisma/seed.ts        # idempotent seed (or: npm run prisma:seed)

npm run dev                   # http://localhost:3000
```

See `next-app/docs/DATABASE_SETUP.md` for full setup, the Prisma 7 `DATABASE_URL`
CLI note, and per-phase database details.

### Seed test accounts

| Email | Password | Role | Premium |
|-------|----------|------|---------|
| admin@example.com | Password123! | ADMIN | yes |
| learner@example.com | Password123! | LEARNER | no |
| premium@example.com | Password123! | LEARNER | yes |

### Admin CMS workflow

1. Log in as `admin@example.com` → the **Admin** area is at `/admin` (server-side RBAC).
2. **Lessons** → *New Lesson*: fill title/slug/skill/level, add body content (Reading/Grammar
   require it), and author questions in the embedded quiz editor.
3. Save as **Draft** or **Review** while incomplete. Drafts/review/archived lessons are
   hidden from the public site and the sitemap; preview any status at
   `/admin/lessons/<id>/preview`.
4. **Publish** runs the publish gate (content-complete + every question valid) and enqueues
   placeholder worker jobs (index / revalidate / PDF). Publish, unpublish, archive,
   question deletes, and user role/premium changes are recorded in **Audit Log** (`/admin/audit`).

### Checks & tests

```bash
cd next-app
npm run lint          # 0 warnings
npm run typecheck     # 0 errors
npm run build         # 0 errors
npm test              # unit + integration (integration self-skips without a DB)
```

### Test admin lesson form

```
http://localhost:3000/admin/lessons/new
http://localhost:3000/admin/lessons/1/edit
```

### Test interactive quiz

```
http://localhost:3000/english/reading/first-day-school
http://localhost:3000/english/listening/morning-routine
http://localhost:3000/english/dictation/simple-sentences
```

## Environment Variables (placeholder — needed after backend is added)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/langpath
SESSION_SECRET=your-secret-here
NEXT_PUBLIC_SITE_URL=https://thang-nv.vercel.app
```

## Planned Test Accounts

| Role    | Email                | Password    |
| ------- | -------------------- | ----------- |
| Learner | learner@langpath.dev | password123 |
| Admin   | admin@langpath.dev   | password123 |

## Development Conventions

- Component names: PascalCase
- File names: kebab-case
- Constants: UPPER_SNAKE_CASE
- Use CSS variables from `tokens.css` — no hardcoded hex colors in components
- Mock data must be centralized in `data/mock/` (target structure)
- Constants must be centralized in `data/constants/` (target structure)
- Business logic must be separate from UI components
- No payment integration in MVP

## Deferred Features / Explicit Placeholders

These are intentionally **not** implemented; the code keeps explicit placeholders
rather than half-working integrations:

- **Payment** (Stripe, PayPal, MoMo, VNPay, ZaloPay) — `PAYMENT_ENABLED = false`; premium is a gate only.
- **Worker queue** — `WorkerJob` rows are created on publish, but no live worker/Redis processes them.
- **Object storage** (R2/S3) — Media stores URL/path **metadata only**; no file uploads.
- **PDF generation** — lesson worksheet button is a "coming soon" placeholder.
- **Audio processing** — listening lessons reference an `audioUrl` only.
- **Full-text search** (Typesense/Elasticsearch) — search is database-backed `INDEX_SEARCH` placeholder jobs only.
- **Email notifications** and **third-party auth providers**.

## Copyright Rules

**Do NOT copy content from Lingua.com or any other learning platform.**

- Do not copy reading texts, listening transcripts, audio files, images, or PDFs from any external source
- All sample content must be original, written specifically for LangPath
- See `docs/SEED_CONTENT_GUIDE.md` for content creation rules

## Deployment

- Currently deployed to Vercel as a static site
- Entry point: `LangPath.html`
- No build step required for the current prototype
- After Next.js migration, Vercel will auto-detect Next.js and build correctly
- See `docs/DEPLOYMENT_NOTES.md` for full deployment notes
