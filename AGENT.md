# AGENT.md — LangPath AI Agent Context File

This file is the primary context document for AI coding agents working on LangPath.
Read this before making any changes.

---

## Product Vision

LangPath is a language learning platform for reading, listening, dictation, grammar, and vocabulary.
Learners choose a language, select a skill, pick a CEFR level (A1–C2), and work through lessons.
Each lesson ends with a quiz. Scores are tracked. Progress is saved per learner.

The product is inspired by Lingua.com in structure only.
Do not copy Lingua.com content, branding, assets, or proprietary layout.

---

## Deployed UI Reference

**URL:** https://thang-nv.vercel.app/

The deployed site is the visual reference for the current prototype.
Preserve this visual direction unless a change is clearly justified.
Do not replace the existing UI without a documented reason.

---

## Current Prototype Status

- **Phase 2.5 complete** — prototype sign-off and migration preparation
- Framework: Plain HTML + React 18 (CDN) + Babel Standalone
- No build tool (no Vite, no webpack, no Next.js yet)
- No real backend, database, or auth
- Mock data centralized in `data/constants/` and `data/mock/` (plain JS, loaded as `<script>` before Babel)
- Helper functions in `data/mock/questions.js` (under `window.LangPathData`): `getQuestionsByLessonId`, `createMockQuestion`, `updateMockQuestion`, `deleteMockQuestion`
- Custom client-side router in `app.jsx` using `React.useState` — 18 route cases
- Hash routing in `app.jsx` — simple routes persist on refresh via URL hash
- All components exported via `Object.assign(window, {...})`
- `AdminLessonForm` includes embedded `LessonQuestionsEditor` — collapsible Q&A panel scoped to current lesson
- `docs/MIGRATION_MAP.md` defines the full prototype → Next.js migration contract
- Deployed as a static HTML file on Vercel

### Data Loading Pattern

Data files in `data/` are plain JavaScript (no JSX). They assign globals:
```js
window.LANGUAGES_DATA = [...];
window.LangPathConstants = window.LangPathConstants || {};
window.LangPathConstants.LANGUAGES_DATA = window.LANGUAGES_DATA;
```
These must be loaded in `LangPath.html` BEFORE any Babel JSX files. Do not add CDN or ES module imports to these files.

---

## Business Rules

1. Only PUBLISHED lessons appear on the public site.
2. DRAFT, REVIEW, and ARCHIVED lessons are admin-only.
3. Free lessons are visible to all visitors.
4. Premium lessons show a locked state for non-premium users.
5. Admin toggles `User.isPremium` manually — no payment flow.
6. Lesson.isPremium and User.isPremium are the only premium fields.
7. Passing score is 70%. Below 70% = incomplete.
8. Attempts store the submitted answers for review.
9. Progress tracks best score and completion state per lesson.
10. Admin routes and APIs must be protected server-side (not just frontend guards).
11. Passwords must be hashed before storage.
12. Correct answers must not be sent to the client before quiz submission.
13. Sessions use HTTP-only cookies.

---

## Target Tech Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- Prisma ORM + PostgreSQL
- HTTP-only cookie sessions
- Role-based access control (LEARNER, ADMIN)

---

## Coding Rules

- Prefer TypeScript when possible.
- Use strict types for domain entities.
- Keep business logic out of UI components.
- Use small, reusable components.
- Use service/repository boundaries for complex logic.
- Centralize constants in `data/constants/`.
- Centralize mock data in `data/mock/`.
- Validate all inputs at system boundaries (user input, external APIs).
- Do not over-engineer before MVP is stable.
- Do not rewrite the entire app in one pass.
- Keep changes incremental and reviewable.
- Explain meaningful architectural changes in PR descriptions.
- Do not add error handling for impossible scenarios.
- Trust framework guarantees for internal code.

---

## Naming Conventions

- Components: PascalCase (`LessonCard`, `AdminSidebar`)
- Files: kebab-case (`lesson-page.jsx`, `admin-pages.jsx`)
- Constants: UPPER_SNAKE_CASE (`LANGUAGES_DATA`, `SAMPLE_LESSONS`)
- CSS variables: `--kebab-case` (from `tokens.css`)
- Route pages (Next.js target): `page.tsx` inside descriptive folders
- API routes (Next.js target): `route.ts` inside `app/api/`

---

## File Organization

Current (prototype):
- One JSX file per page group
- All shared components in `ui.jsx`, `layout.jsx`, `learning.jsx`
- All mock data in `learning.jsx` and individual page files

Target (Next.js):
- `app/` — Next.js App Router pages and API routes
- `components/` — shared UI and feature components
- `data/mock/` — mock data
- `data/constants/` — shared constants
- `lib/` — auth, db, validators, seo, scoring, jobs, storage
- `server/` — services and repositories
- `prisma/` — schema and seed

---

## UI Conventions

- Design tokens defined in `tokens.css` — always use CSS variables, never hardcode colors
- Inter font (Google Fonts)
- Card radius: `var(--r-card)` (16px default, 12px compact)
- Button radius: `var(--r-btn)` (10px)
- Input radius: `var(--r-input)` (10px)
- Container max-width: 1200px via `.container` class
- Shadows: `var(--shadow-card)`, `var(--shadow-hover)`, `var(--shadow-modal)`
- Neutral scale: `var(--n-50)` through `var(--n-900)`
- Blue primary: `var(--blue-500)` = #2563EB
- Level badges use `color="blue"`
- Free badge uses `color="green"`, Premium badge uses `color="amber"`
- Status colors: Published = green, Draft = amber, Review = blue, Archived = gray

---

## Admin Conventions

- Admin header shows Logo + "Admin" badge + "View site" button + user avatar
- Admin layout: full-width flex with `<AdminSidebar>` (240px) + `<main>` (flex: 1)
- Admin sidebar items: Dashboard, Languages, Lessons, Questions, Media, Users, Jobs
- Admin pages use `padding: 32px` inside main content area
- Admin tables use `<table>` with consistent header/row/cell padding
- Status badges in tables always use the `statusColor` map
- Forms use white card panels with `padding: 24px`, `borderRadius: 16`
- Each form section (Basic Info, Content, SEO) is its own card panel
- Publish button triggers a confirmation Modal before changing status

---

## Auth Conventions

- Login form: email + password
- Register form: name + email + password + confirm + terms checkbox
- After login/register: navigate to dashboard
- Logout: clear session state, navigate to home
- Admin access: checked on the server side (not just `isAdmin` frontend flag)
- HTTP-only cookie session in target implementation
- Roles: LEARNER, ADMIN (stored in User.role)

---

## Data Model Overview

Core hierarchy: Language → Skill → Level → Lesson

Key entities:
- User (id, email, name, passwordHash, role, isPremium)
- Language (id, slug, name)
- Skill (id, name: Reading/Listening/Dictation/Grammar/Vocabulary)
- Level (id, code: A1/A2/B1/B2/C1/C2)
- Lesson (id, languageId, skillId, levelId, title, slug, status, isPremium, seoTitle, seoDesc)
- LessonContent (id, lessonId, type, body)
- Question (id, lessonId, type, prompt, order)
- AnswerOption (id, questionId, text, isCorrect)
- Attempt (id, userId, lessonId, score, completedAt)
- AttemptAnswer (id, attemptId, questionId, selectedOptionId, textAnswer)
- Progress (id, userId, lessonId, bestScore, completed)
- MediaAsset (id, lessonId, type, url)
- WorkerJob (id, type, status, idempotencyKey, payload, createdAt)

See `docs/DATA_MODEL.md` for full field definitions.

---

## API Conventions

- RESTful JSON APIs under `/api/`
- Public endpoints: no auth required, return only PUBLISHED lessons
- Auth endpoints under `/api/auth/`
- Admin endpoints under `/api/admin/` — require ADMIN role server-side
- Error responses: `{ error: string, code?: string }`
- Validation with Zod on all POST/PATCH bodies
- Correct answers never sent in lesson detail response — only returned after attempt submission

---

## Security Rules

- Hash passwords with bcrypt before storing
- Use HTTP-only cookies for session tokens
- Validate all inputs with Zod at API boundaries
- Check role on the server for every admin endpoint
- Never expose `isCorrect` on AnswerOption before quiz submission
- Never hardcode secrets — use environment variables
- Never commit `.env` files
- Admin routes must be protected server-side, not just in frontend routing

---

## SEO Rules

- Public pages must have dynamic `<title>` and `<meta description>`
- Semantic URL structure: `/english/reading/my-first-day-at-school`
- Add `sitemap.xml` for public pages
- `robots.txt`: allow `/`, disallow `/admin` and `/api`
- JSON-LD placeholder for educational content (ScholarlyArticle or Course)
- Admin and API routes must never be indexed

---

## Payment Deferred Rules

Do NOT implement any of these in MVP:
- Stripe, PayPal, MoMo, VNPay, ZaloPay, or any payment provider
- Checkout flows, invoices, subscriptions, coupons, refunds, tax
- Payment webhooks

Only use:
- `Lesson.isPremium` (boolean)
- `User.isPremium` (boolean)
- Admin can toggle `User.isPremium` manually for testing

---

## Content Rules

**Never copy content from Lingua.com or any other learning platform.**

- Do not copy reading texts, listening transcripts, audio files, images, or PDFs
- Write all sample content from scratch
- Keep content short and clearly marked as demo content
- See `docs/SEED_CONTENT_GUIDE.md` for writing guidelines

---

## Pre-Commit Checklist

Before committing code changes:

- [ ] No hardcoded hex colors — using CSS variables from `tokens.css`
- [ ] No copyrighted content from external sources
- [ ] No payment integration code
- [ ] No real secrets or API keys committed
- [ ] Mock data changes are isolated in `data/mock/` (after normalization)
- [ ] Constants changes are in `data/constants/`
- [ ] Admin-only functionality has a server-side guard (after backend is added)
- [ ] Quiz answers are not exposed before submission (after backend is added)
- [ ] UI matches the deployed visual direction (no accidental regressions)
- [ ] TypeScript compiles without errors (after migration)

---

## Rules for AI Agents

1. **Inspect before editing.** Read the relevant files before modifying anything.
2. **Prefer small, safe changes.** Do not rewrite entire files unless necessary.
3. **Do not delete existing UI without a documented reason.** If replacing something, explain why.
4. **Do not rewrite the whole project in one pass.** Work incrementally.
5. **Do not introduce large dependencies without explaining why.**
6. **Do not integrate payment.** Not in scope for MVP.
7. **Do not copy copyrighted content.** All content must be original.
8. **Keep business logic separate from UI.** Services and repositories are separate from components.
9. **Centralize mock data and constants.** Do not hardcode data inside components.
10. **Document assumptions.** Leave a comment or note if you make an architectural assumption.
11. **Preserve prototype behavior** unless you are intentionally refactoring it with a clear plan.
12. **Follow the safe refactor roadmap** in `docs/PLAN.md` — do not skip phases.
13. **Check `docs/ADMIN_TODO.md`** before adding or modifying admin pages.
14. **Never send correct answers to the client** before quiz submission.
15. **Always check the deployed UI reference** at https://thang-nv.vercel.app/ when in doubt about visual direction.
16. **Before starting Next.js migration**, read `docs/MIGRATION_MAP.md` for the full route and component mapping contract.
