# docs/TASKS.md — LangPath Task Checklist

## P0 — Required for MVP

### Documentation

- [x] Create README.md with project overview and setup instructions
  - Context: Developers opening the project for the first time need a clear starting point
  - Expected files: README.md
  - Acceptance criteria: Covers framework, deployment URL, installation, folder structure, commands, conventions

- [x] Create AGENT.md with AI agent context
  - Context: AI coding agents need product context, coding rules, and business rules to work safely
  - Expected files: AGENT.md
  - Acceptance criteria: Covers product vision, tech stack, coding rules, naming conventions, security rules, agent rules

- [x] Create INSTRUCTIONS.md with development workflow
  - Context: Developers need step-by-step instructions for common tasks
  - Expected files: INSTRUCTIONS.md
  - Acceptance criteria: Covers running the app, adding content, testing features, commit conventions

- [x] Create docs/PLAN.md with phased roadmap
  - Context: Planning document showing phases, tasks, acceptance criteria, risks
  - Expected files: docs/PLAN.md
  - Acceptance criteria: All 11 phases documented with tasks, affected files, acceptance criteria, risks

- [x] Create docs/TASKS.md (this file)
  - Expected files: docs/TASKS.md

- [x] Create docs/ARCHITECTURE.md
  - Expected files: docs/ARCHITECTURE.md

- [x] Create docs/DATA_MODEL.md
  - Expected files: docs/DATA_MODEL.md

- [x] Create docs/API_SPEC.md
  - Expected files: docs/API_SPEC.md

- [x] Create docs/ADMIN_TODO.md
  - Expected files: docs/ADMIN_TODO.md

- [x] Create docs/SEED_CONTENT_GUIDE.md
  - Expected files: docs/SEED_CONTENT_GUIDE.md

- [x] Create docs/UI_REFERENCE.md
  - Expected files: docs/UI_REFERENCE.md

- [x] Create docs/DEPLOYMENT_NOTES.md
  - Expected files: docs/DEPLOYMENT_NOTES.md

---

### Mock Data Normalization

- [x] Extract LANGUAGES_DATA to `data/constants/languages.js`
  - Context: Currently hardcoded in `learning.jsx`; needed by multiple pages
  - Expected files: data/constants/languages.js
  - Acceptance criteria: Import works, all language pages still render correctly

- [x] Extract SKILL_ICONS and SKILL_COLORS to `data/constants/skills.js`
  - Context: Currently hardcoded in `learning.jsx`
  - Expected files: data/constants/skills.js
  - Acceptance criteria: Skill cards and skill list pages still render with correct colors and icons

- [x] Extract LEVELS to `data/constants/levels.js`
  - Context: Currently hardcoded in `learning.jsx`
  - Expected files: data/constants/levels.js
  - Acceptance criteria: Level filter still works, all 6 levels appear

- [x] Create constants for lesson statuses, roles, job types, job statuses
  - Context: These are scattered or implicit; need a single source of truth
  - Expected files: data/constants/lesson-statuses.js, data/constants/roles.js, data/constants/job-types.js, data/constants/job-statuses.js
  - Acceptance criteria: LESSON_STATUSES, ROLES, JOB_TYPES, JOB_STATUSES all on window globals

- [x] Extract SAMPLE_LESSONS + admin lessons to `data/mock/lessons.js`
  - Context: Currently in `learning.jsx` and `admin-pages.jsx`
  - Expected files: data/mock/lessons.js
  - Acceptance criteria: All lesson list pages still render with correct data

- [x] Extract QUIZ_QUESTIONS, LESSON_TEXT, VOCAB_WORDS to `data/mock/questions.js`
  - Context: Currently hardcoded in `lesson-page.jsx`
  - Expected files: data/mock/questions.js
  - Acceptance criteria: Lesson detail page quiz still works correctly

- [x] Extract mock users, jobs, media assets to dedicated files
  - Context: Admin pages need centralized mock data
  - Expected files: data/mock/users.js, data/mock/worker-jobs.js, data/mock/media-assets.js
  - Acceptance criteria: Admin pages render with mock data from centralized files

---

### Admin Completion (Mock Level)

- [x] Build AdminLanguagesPage (language list, add/edit language form)
  - Expected files: admin-pages.jsx (AdminLanguagesPage), app.jsx (route case added)
  - Acceptance criteria: Page renders, shows language list, edit button opens modal form, active toggle works

- [x] Build AdminQuestionsPage (question list with add/edit/delete + answer options)
  - Expected files: admin-pages.jsx (AdminQuestionsPage), app.jsx (route case added)
  - Acceptance criteria: Question list with type badges, full modal editor with options, correct answer marking

- [x] Build AdminMediaPage (placeholder asset list + upload placeholder)
  - Expected files: admin-pages.jsx (AdminMediaPage), app.jsx (route case added)
  - Acceptance criteria: Shows asset list with type, filename, size; delete works; upload placeholder button

- [x] Build AdminUsersPage (user list with role and premium toggle)
  - Expected files: admin-pages.jsx (AdminUsersPage), app.jsx (route case added)
  - Acceptance criteria: User table with role selector, premium toggle, activate/deactivate button

- [x] Build AdminJobsPage (job list with trigger modal)
  - Expected files: admin-pages.jsx (AdminJobsPage), app.jsx (route case added)
  - Acceptance criteria: Job list with type/status badges, trigger modal adds PENDING job to table

- [x] Add question editor to AdminQuestionsPage (standalone page)
  - Expected files: admin-pages.jsx
  - Acceptance criteria: Full CRUD for questions with answer options and correct answer marking

- [x] Add answer options editor with correct answer marking
  - Expected files: admin-pages.jsx
  - Acceptance criteria: SINGLE_CHOICE uses radio, MULTIPLE_CHOICE uses checkboxes, FILL_BLANK/DICTATION uses text input

- [x] Embed question editor inside AdminLessonForm (Phase 2.5)
  - Expected files: admin-pages.jsx (LessonQuestionsEditor component)
  - Acceptance criteria: Collapsible "Questions & Answers" section in lesson form; add/edit/delete questions scoped to the lesson; all 4 question types; correct answer marking; empty state; standalone AdminQuestionsPage still works

- [x] Add unpublish action to AdminLessonForm and AdminLessonList
  - Expected files: admin-pages.jsx
  - Acceptance criteria: Published lessons show Unpublish button with confirmation modal; also inline in list

- [x] Add delete confirmation modal to AdminLessonList
  - Expected files: admin-pages.jsx
  - Acceptance criteria: Delete button opens modal with lesson name; confirmed delete removes from state

- [x] Auto-generate slug from title in AdminLessonForm
  - Expected files: admin-pages.jsx
  - Acceptance criteria: Typing in Title auto-fills Slug; manual edits to Slug are preserved

---

### Deployment

---

### Phase 2.5 — Prototype Sign-off and Migration Preparation

- [x] Embed question editor into AdminLessonForm
  - Expected files: admin-pages.jsx
  - Acceptance criteria: LessonQuestionsEditor component collapsible section; scoped to current lesson; full question CRUD; all 4 types; correct answer marking

- [x] Improve lesson/question mock data relationship
  - Expected files: data/mock/questions.js
  - Acceptance criteria: Helper functions on window.LangPathData: getQuestionsByLessonId, createMockQuestion, updateMockQuestion, deleteMockQuestion

- [x] Add hash-based URL routing for simple routes
  - Expected files: app.jsx
  - Acceptance criteria: Admin and top-level pages persist on refresh via URL hash; browser back/forward works for hash routes; parameterized routes fall back gracefully

- [x] Create docs/MIGRATION_MAP.md
  - Expected files: docs/MIGRATION_MAP.md
  - Acceptance criteria: All current files documented, all route cases mapped, target Next.js routes listed, component migration map complete, migration order documented

- [x] Update all existing docs for Phase 2.5
  - Expected files: README.md, AGENT.md, INSTRUCTIONS.md, docs/TASKS.md, docs/ADMIN_TODO.md, docs/UI_REFERENCE.md, docs/DEPLOYMENT_NOTES.md

---

### Deployment

- [ ] Verify Vercel deployment still works after any changes
  - Context: Prototype is a static HTML file — changes must not break the Vercel deployment
  - Expected files: LangPath.html (and any new script files added to it)
  - Acceptance criteria: https://thang-nv.vercel.app/ loads correctly after push

---

## P1 — Should Have

### TypeScript Migration (after Next.js)

- [x] Scaffold Next.js App Router project with TypeScript and Tailwind (Phase 3)
  - Expected files: next-app/package.json, tsconfig.json, next.config.ts, tailwind.config.ts, app/layout.tsx
  - Acceptance criteria: `npm run build` passes — ✅ 19 routes, 0 errors

- [x] Define domain types in `data/types.ts` (Phase 3)
  - Expected files: next-app/data/types.ts
  - Acceptance criteria: 16 types exported — ✅ done

- [x] Migrate shared UI components to TypeScript (Phase 3 — partial)
  - Expected files: next-app/components/ui/*.tsx
  - Acceptance criteria: Button, Badge, Input, Card, Icon, Modal, ProgressBar — ✅ done

- [x] Migrate layout components to TypeScript (Phase 3)
  - Expected files: next-app/components/layout/*.tsx
  - Acceptance criteria: Header, Footer, AdminSidebar, Logo, FlagIcon — ✅ done

- [x] Migrate AdminLessonForm to Next.js (Phase 4)
  - Expected files: next-app/components/admin/LessonForm.tsx
  - Acceptance criteria: Full form with title/slug/summary/content/lang/skill/level/status/premium/SEO; embedded question editor supporting all 4 types — ✅ done

- [x] Add quiz client component with state + scoring (Phase 4)
  - Expected files: next-app/components/quiz/QuizRunner.tsx
  - Acceptance criteria: Answer selection, submit, score display (≥70% pass), explanations, retry — ✅ done

- [x] Add special lesson UI (Listening, Dictation, Vocabulary) (Phase 4)
  - Expected files: next-app/components/lesson/DictationPractice.tsx, next-app/components/lesson/VocabCards.tsx
  - Acceptance criteria: Listening audio placeholder + transcript, Dictation sentence practice, Vocabulary tap-to-reveal cards — ✅ done

- [x] Make admin tables interactive with mock state (Phase 4)
  - Expected files: next-app/app/admin/*/page.tsx
  - Acceptance criteria: Search/filter, delete confirmation, premium toggle, status toggle, cancel job, trigger job — ✅ done

---

### Database and Auth

- [x] Write Prisma schema matching docs/DATA_MODEL.md (Phase 5A)
  - Expected files: prisma/schema.prisma
  - Acceptance criteria: Schema matches target data model, migrations run — ✅ 11 models, 9 enums

- [x] Write seed script with original sample content (Phase 5A)
  - Expected files: prisma/seed.ts
  - Acceptance criteria: Seed loads all languages, skills, levels, and sample lessons without errors; no copyrighted content — ✅ done

- [ ] Implement register, login, logout, and /api/me endpoints
  - Expected files: app/api/auth/*/route.ts, lib/auth/session.ts
  - Acceptance criteria: Learner can register and log in, session persists in HTTP-only cookie

- [ ] Protect admin pages and API routes with ADMIN role check
  - Expected files: app/admin/layout.tsx (or middleware), app/api/admin/*/route.ts
  - Acceptance criteria: Non-admin requests to /admin and /api/admin/ return 403

---

### Public Catalog

- [ ] Connect public language list to database
  - Expected files: app/(public)/page.tsx, app/api/languages/route.ts
  - Acceptance criteria: Languages fetched from DB, only render languages with published lessons

- [ ] Connect lesson list to database with status filter
  - Expected files: app/(public)/[languageSlug]/[skillSlug]/page.tsx
  - Acceptance criteria: Only PUBLISHED lessons appear; level filter and search work

- [ ] Implement quiz submission and scoring
  - Expected files: app/api/attempts/route.ts, lib/scoring.ts
  - Acceptance criteria: Attempt stored, score calculated, correct answers returned after submission

---

## P2 — Later

### SEO

- [ ] Add generateMetadata to all public pages
  - Expected files: all app/(public)/**/page.tsx
  - Acceptance criteria: Each page has unique title and meta description

- [ ] Create sitemap.ts
  - Expected files: app/sitemap.ts
  - Acceptance criteria: Sitemap includes all published lesson URLs

- [ ] Create robots.ts
  - Expected files: app/robots.ts
  - Acceptance criteria: Disallows /admin and /api

---

### Worker Placeholders

- [ ] Add WorkerJob model to Prisma schema
  - Expected files: prisma/schema.prisma
  - Acceptance criteria: WorkerJob table exists with type, status, idempotencyKey, payload fields

- [ ] Create job queue abstraction in lib/jobs/queue.ts
  - Expected files: lib/jobs/queue.ts
  - Acceptance criteria: createJob(), getJob(), listJobs() functions exported; placeholder only

- [ ] Trigger placeholder jobs on lesson publish
  - Expected files: server/services/admin.ts, lib/jobs/queue.ts
  - Acceptance criteria: Publishing a lesson creates INDEX_SEARCH, REVALIDATE_CACHE, GENERATE_PDF job records

---

### Progress and Dashboard

- [ ] Connect learner dashboard to real progress data
  - Expected files: app/dashboard/page.tsx
  - Acceptance criteria: Real completed lesson count and best scores shown per language

- [ ] Mark lesson complete when score >= 70%
  - Expected files: lib/scoring.ts, server/services/quiz.ts
  - Acceptance criteria: Progress.completed set to true when passing score is achieved

---

### QA

- [ ] End-to-end test of learner flow: register → browse → take quiz → view dashboard
  - Expected files: test results documented
  - Acceptance criteria: Full flow works without errors

- [ ] End-to-end test of admin flow: login → create lesson → publish → view in public catalog
  - Expected files: test results documented
  - Acceptance criteria: Published lesson appears on public site

- [ ] Run npm run build and fix all errors
  - Expected files: package.json scripts
  - Acceptance criteria: Build passes cleanly
