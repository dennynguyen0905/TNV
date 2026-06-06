# LangPath — Language Learning Platform

## Overview

* [ ] LangPath is an online language learning platform for reading, listening, dictation, grammar, and vocabulary practice. Lessons are organized by language, skill, and CEFR level (A1–C2). Learners can take quizzes, track progress, and access free and premium content.

**Deployed reference:** https://thang-nv.vercel.app/

## Current Status

- **Stage:** Phase 4 complete — Next.js mock UI with interactive admin forms, quiz runner, and special lesson types.
- **Framework (production target):** Next.js 15.3.4 + React 19 + TypeScript + Tailwind CSS (see `next-app/`)
- **Framework (static prototype):** Plain HTML + React 18 (CDN) + Babel Standalone — untouched
- **Deployment:** Vercel (static HTML file — Next.js deploy pending Prisma setup)
- **Auth:** Mock only — no real backend yet
- **Data:** Typed mock data in `next-app/data/`; no database connected
- **Admin (Next.js):** Full mock CRUD — LessonForm with embedded Q&A editor, interactive tables with search/filter/delete/toggle
- **Learner (Next.js):** Interactive QuizRunner (all 4 question types), Listening/Dictation/Vocabulary lesson UI
- **Routing:** Next.js App Router, all routes pass `npm run build`
- **Migration:** See `docs/MIGRATION_MAP.md` and `docs/NEXT_MIGRATION_LOG.md`

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

### Next.js app (Phase 3 scaffold)

```bash
cd next-app
npm install
npm run dev
# open http://localhost:3000
```

### Next.js build check

```bash
cd next-app
npm run lint         # 0 warnings, 0 errors
npm run build        # 19 routes, 0 TS errors, 0 lint errors
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

## Deferred Features

- Real payment (Stripe, PayPal, MoMo, VNPay, ZaloPay — all deferred)
- Third-party auth providers
- Real audio file storage and streaming
- Real PDF generation
- Full-text search (Elasticsearch/Typesense)
- Email notifications
- Redis-backed job queue

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
