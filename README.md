# LangPath — Language Learning Platform

## Overview

LangPath is an online language learning platform for reading, listening, dictation, grammar, and vocabulary practice. Lessons are organized by language, skill, and CEFR level (A1–C2). Learners can take quizzes, track progress, and access free and premium content.

**Deployed reference:** https://thang-nv.vercel.app/

## Current Status

- **Stage:** Prototype (Phase 2.5 complete — prototype sign-off and migration preparation)
- **Framework:** Plain HTML + React 18 (CDN) + Babel Standalone (no build tool)
- **Deployment:** Vercel (static HTML file)
- **Auth:** Mock only — no real backend yet
- **Data:** Centralized in `data/constants/` and `data/mock/` with helper functions
- **Admin:** All sidebar pages built — Dashboard, Lessons (with embedded question editor), Questions, Languages, Users, Media, Jobs
- **Routing:** Hash-based URL routing for simple routes (admin pages persist on refresh)
- **Migration:** See `docs/MIGRATION_MAP.md` for the Next.js migration contract

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

| Layer | Technology |
|-------|-----------|
| Framework | Next.js App Router |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | HTTP-only cookie sessions, RBAC |
| Search | Database search for MVP |
| Jobs | Worker placeholder abstraction |

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

## Installation (Current Prototype)

The prototype requires no installation — it runs directly in a browser over HTTP.

```bash
# Clone the repo
git clone <repo-url>
cd ThangNV

# Serve locally (file:// does not work — must use HTTP)
npx serve .
# Open http://localhost:3000/LangPath.html
```

## Development Commands (Current)

```bash
npx serve .           # serve prototype locally
python -m http.server 8080  # alternative — open http://localhost:8080/LangPath.html
```

## Development Commands (After Next.js Migration)

```bash
npm install
npm run dev           # start Next.js dev server
npm run build         # production build
npm run lint          # ESLint
npm run typecheck     # TypeScript check
npm run db:push       # push Prisma schema to database
npm run db:seed       # seed database with sample content
```

## Environment Variables (placeholder — needed after backend is added)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/langpath
SESSION_SECRET=your-secret-here
NEXT_PUBLIC_SITE_URL=https://thang-nv.vercel.app
```

## Planned Test Accounts

| Role | Email | Password |
|------|-------|---------|
| Learner | learner@langpath.dev | password123 |
| Admin | admin@langpath.dev | password123 |

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
