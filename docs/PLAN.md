# docs/PLAN.md — LangPath Implementation Roadmap

## Phase 0: Audit and Documentation ✓

**Goal:** Understand the current codebase. Create documentation and planning files.

**Tasks:**
- [x] Inspect current framework and file structure
- [x] Identify reusable UI components
- [x] Identify hardcoded data that needs extraction
- [x] Identify missing admin features
- [x] Create README.md, AGENT.md, INSTRUCTIONS.md
- [x] Create docs/ folder with all planning documents
- [x] Document deployed Vercel reference URL

**Files affected:**
- README.md, AGENT.md, INSTRUCTIONS.md
- docs/PLAN.md, docs/TASKS.md, docs/ARCHITECTURE.md
- docs/DATA_MODEL.md, docs/API_SPEC.md, docs/ADMIN_TODO.md
- docs/SEED_CONTENT_GUIDE.md, docs/UI_REFERENCE.md, docs/DEPLOYMENT_NOTES.md

**Acceptance criteria:**
- Audit summary exists in this document
- All required docs are created
- No destructive code changes were made

**Risks:**
- None — documentation only phase

---

## Phase 1: Normalize UI and Mock Data

**Goal:** Make the prototype easier to maintain before adding a backend.

**Tasks:**
- [ ] Create `data/constants/languages.js` — extract LANGUAGES_DATA
- [ ] Create `data/constants/skills.js` — extract SKILL_ICONS, SKILL_COLORS
- [ ] Create `data/constants/levels.js` — extract LEVELS
- [ ] Create `data/constants/statuses.js` — lesson statuses, roles, job types/statuses
- [ ] Create `data/mock/lessons.js` — extract SAMPLE_LESSONS
- [ ] Create `data/mock/quiz.js` — extract QUIZ_QUESTIONS, LESSON_TEXT, VOCAB_WORDS
- [ ] Create `data/mock/admin.js` — extract admin mock lesson and user data
- [ ] Update all JSX files to import from the new data files
- [ ] Extract repeated inline style blocks into shared helper objects
- [ ] Verify UI still renders identically after refactor
- [ ] Compare local UI with deployed Vercel reference

**Files affected:**
- learning.jsx, lesson-page.jsx, special-lessons.jsx
- admin-pages.jsx, auth-dashboard.jsx
- New: data/constants/*.js, data/mock/*.js

**Acceptance criteria:**
- UI still renders correctly in browser
- Mock data is centralized — no duplicates across files
- Components are easier to reuse and test
- No visual regression from the deployed Vercel UI

**Risks:**
- Script load order matters in the current plain HTML setup — constants files must load before components that use them
- The `Object.assign(window, {...})` pattern means constants shared via window globals work, but proper module imports require a build tool

---

## Phase 2: Complete Admin Prototype

**Goal:** Finish the admin area at mock-data level before any backend integration.

**Tasks:**
- [ ] Add AdminLanguagesPage (list + simple edit)
- [ ] Add AdminQuestionsPage (list questions per lesson, add/edit/delete)
- [ ] Add AdminMediaPage (placeholder — file drop zone + list)
- [ ] Add AdminUsersPage (user list, role selector, premium toggle)
- [ ] Add AdminJobsPage (job list with status, trigger placeholder button)
- [ ] Add question editor panel to AdminLessonForm
- [ ] Add answer options editor to AdminLessonForm (per question)
- [ ] Add correct answer marker to answer options
- [ ] Add unpublish flow to AdminLessonForm
- [ ] Add admin route cases in app.jsx for new pages
- [ ] Add sidebar navigation items for new pages
- [ ] Verify all admin sidebar items navigate to working pages

**Files affected:**
- admin-pages.jsx (add new page components)
- app.jsx (add new route cases)
- layout.jsx (AdminSidebar — already has items, just needs working routes)

**Acceptance criteria:**
- All admin sidebar items navigate to a working page
- Admin can add/edit/delete questions and answer options in the lesson form
- Admin can view mock user list with role and premium toggle
- Admin can view placeholder job list and trigger a placeholder job
- Admin UI follows the current visual direction (white cards, 32px padding, etc.)

**Risks:**
- Without a build tool, adding new files means adding new `<script type="text/babel">` tags to LangPath.html
- The `window` global sharing pattern becomes unwieldy with many files — consider bundling in Phase 3

---

## Phase 3: Migrate to TypeScript (If on Next.js)

**Goal:** Improve type safety before adding data models and APIs.

**Tasks:**
- [ ] Add TypeScript config (tsconfig.json)
- [ ] Define domain types: User, Language, Skill, Level, Lesson, Question, AnswerOption, Attempt, Progress, WorkerJob
- [ ] Convert key lib/ files to TypeScript (auth, validators, scoring)
- [ ] Convert components gradually — start with shared UI components
- [ ] Add strict null checks
- [ ] Avoid changing UI behavior during conversion

**Files affected:**
- tsconfig.json (new)
- All .jsx/.js files converted to .tsx/.ts gradually

**Acceptance criteria:**
- TypeScript compiles without errors on converted files
- Core domain types exist in `types/` or `lib/types.ts`
- No UI regression during conversion

**Risks:**
- Premature TypeScript migration before framework migration wastes effort
- This phase is only relevant after the Next.js migration (Phase 4)

---

## Phase 4: Next.js App Router Architecture

**Goal:** Move to the target application structure.

**Tasks:**
- [ ] Scaffold Next.js App Router project: `npx create-next-app@latest --typescript --tailwind --app`
- [ ] Define route structure mirroring the current pages
- [ ] Migrate page components from current JSX files to Next.js page.tsx files
- [ ] Set up `components/` folder structure
- [ ] Set up `data/mock/` and `data/constants/` folders
- [ ] Configure Tailwind CSS with the current design token values
- [ ] Replace CDN React with bundled React
- [ ] Remove Babel Standalone dependency
- [ ] Remove TweaksPanel (prototype tooling — not needed in production)
- [ ] Add layout.tsx with Header/Footer/AdminSidebar using Next.js patterns
- [ ] Verify all existing routes work after migration
- [ ] Deploy to Vercel and verify against old deployed reference

**Files affected:**
- All current .jsx files → migrated to Next.js app/ structure
- New: package.json, tsconfig.json, next.config.ts, tailwind.config.ts

**Acceptance criteria:**
- All existing routes work in the Next.js app
- No visual regression from the current prototype
- TypeScript compiles
- Build passes (`npm run build`)
- Deployed to Vercel successfully

**Risks:**
- Large migration effort — must be done in a dedicated branch
- Visual regression risk from Tailwind vs. current CSS variable system
- TweaksPanel removal — layout/card/density defaults need to be chosen before removing it
- Babel Standalone JSX features not available in standard Next.js (use TSX instead)

---

## Phase 5: Database and Prisma Schema

**Goal:** Add real data persistence.

**Tasks:**
- [ ] Add Prisma: `npm install prisma @prisma/client`
- [ ] Create `prisma/schema.prisma` with all target entities
- [ ] Set up PostgreSQL connection (local dev + Vercel prod)
- [ ] Run initial migration: `npx prisma migrate dev`
- [ ] Create `prisma/seed.ts` with original sample content
- [ ] Seed the database: `npm run db:seed`
- [ ] Verify data is accessible via Prisma Client in a test API route

**Files affected:**
- prisma/schema.prisma (new)
- prisma/seed.ts (new)
- .env (new — gitignored)
- package.json (add db:push, db:seed scripts)

**Acceptance criteria:**
- Prisma schema matches the target data model in `docs/DATA_MODEL.md`
- Migrations run without errors
- Seed script loads successfully with original content
- No copyrighted seed content

**Risks:**
- PostgreSQL connection required — developers need a local Postgres instance or a cloud dev database
- Schema migrations are destructive if run on wrong database
- Seed content must be original — no Lingua.com content

---

## Phase 6: Auth, Session, and RBAC

**Goal:** Add real authentication and authorization.

**Tasks:**
- [ ] Create `/api/auth/register` route with Zod validation and password hashing
- [ ] Create `/api/auth/login` route — verify password, set HTTP-only cookie session
- [ ] Create `/api/auth/logout` route — clear session cookie
- [ ] Create `/api/me` route — return current user from session
- [ ] Create `lib/auth/session.ts` — session read/write helpers
- [ ] Create `lib/auth/permissions.ts` — role check helpers
- [ ] Add server-side auth check to admin pages (redirect non-admins)
- [ ] Add server-side auth check to dashboard page
- [ ] Protect all `/api/admin/` routes with ADMIN role check
- [ ] Update LoginPage and RegisterPage to call real APIs
- [ ] Test with seeded test accounts

**Files affected:**
- app/api/auth/register/route.ts (new)
- app/api/auth/login/route.ts (new)
- app/api/auth/logout/route.ts (new)
- app/api/me/route.ts (new)
- lib/auth/session.ts (new)
- lib/auth/permissions.ts (new)
- app/login/page.tsx, app/register/page.tsx

**Acceptance criteria:**
- Learner can register and log in
- Admin can log in with ADMIN role
- Admin pages reject non-admin users (server-side)
- Auth is checked server-side, not just frontend
- Passwords are hashed (bcrypt)
- Session uses HTTP-only cookies

**Risks:**
- Session secret must be set in environment variables — not committed
- bcrypt adds a dependency — verify it works in the Vercel serverless environment

---

## Phase 7: Public Lesson Catalog

**Goal:** Connect public learning pages to real database data.

**Tasks:**
- [ ] Connect `/api/languages` to Prisma Language query
- [ ] Connect language detail page to real language + skills data
- [ ] Connect skill lesson list to real lessons filtered by skill, level, status=PUBLISHED
- [ ] Connect lesson detail page to real lesson content
- [ ] Add premium locked state to lesson detail for non-premium users
- [ ] Add level filter to skill lesson list (server-side or client-side)
- [ ] Implement SEO metadata for language and lesson pages

**Files affected:**
- app/(public)/page.tsx
- app/(public)/[languageSlug]/page.tsx
- app/(public)/[languageSlug]/[skillSlug]/page.tsx
- app/(public)/[languageSlug]/[skillSlug]/[lessonSlug]/page.tsx
- app/api/languages/route.ts
- app/api/lessons/route.ts, app/api/lessons/[id]/route.ts

**Acceptance criteria:**
- Public catalog fetches from database
- Only PUBLISHED lessons appear publicly
- Premium locked state works for non-premium users
- Level filter works
- SEO metadata renders correctly in page `<head>`

**Risks:**
- Database queries on public pages — add appropriate caching
- Premium locked state requires auth check on server-rendered pages

---

## Phase 8: Quiz, Attempts, and Progress

**Goal:** Implement real learning activity tracking.

**Tasks:**
- [ ] Create `POST /api/attempts` — submit quiz answers, score, store attempt
- [ ] Create `lib/scoring.ts` — scoring logic for all question types
- [ ] Store AttemptAnswer rows for each submitted answer
- [ ] Update Progress record (best score, completed flag) after attempt
- [ ] Correct answers returned in attempt response (after submission only)
- [ ] Update dashboard to fetch real progress from database
- [ ] Show lesson completion state on lesson cards if user is logged in

**Files affected:**
- app/api/attempts/route.ts (new)
- lib/scoring.ts (new)
- server/services/quiz.ts (new)
- server/repositories/attempt.ts, progress.ts (new)

**Acceptance criteria:**
- Quiz can be submitted via API
- Score calculated correctly for all question types
- Attempt is stored with submitted answers
- Progress updated — best score and completion state
- Correct answers only returned after submission
- Dashboard shows real progress

**Risks:**
- Must not send correct answers to client before submission
- Multiple concurrent submissions for same lesson — handle idempotency

---

## Phase 9: SEO, Sitemap, and Robots

**Goal:** Make public pages search-engine friendly.

**Tasks:**
- [ ] Add dynamic `generateMetadata()` to public pages
- [ ] Create `app/sitemap.ts` — include all published language and lesson URLs
- [ ] Create `app/robots.ts` — allow /, disallow /admin and /api
- [ ] Add JSON-LD placeholder for educational content
- [ ] Verify `<title>` and `<meta description>` render on all public pages

**Files affected:**
- app/sitemap.ts (new)
- app/robots.ts (new)
- All public page.tsx files (add generateMetadata)

**Acceptance criteria:**
- All public pages have unique title and meta description
- /admin and /api are excluded from robots.txt
- sitemap.xml lists all published public pages
- JSON-LD appears on lesson detail pages

**Risks:**
- Sitemap generation requires database access — add revalidation strategy

---

## Phase 10: Worker Placeholders

**Goal:** Add abstraction for future background jobs.

**Tasks:**
- [ ] Create WorkerJob Prisma model
- [ ] Create `lib/jobs/queue.ts` — job creation service
- [ ] Add placeholder trigger calls in publish flow (IndexSearch, RevalidateCache, GeneratePdf)
- [ ] Create `POST /api/admin/jobs` — trigger a job
- [ ] Create `GET /api/admin/jobs` — list jobs
- [ ] Complete AdminJobsPage to show real job list and trigger button

**Files affected:**
- prisma/schema.prisma (add WorkerJob model)
- lib/jobs/queue.ts (new)
- server/services/jobs.ts (new)
- app/api/admin/jobs/route.ts (new)
- admin pages (update job list)

**Acceptance criteria:**
- Jobs can be created with idempotencyKey
- Jobs have PENDING/RUNNING/COMPLETED/FAILED/CANCELLED status
- Admin can view job list
- Admin can trigger placeholder jobs
- No real PDF/audio/search processing required

**Risks:**
- Worker jobs are placeholders only — do not build real Redis queue yet

---

## Phase 11: QA, Build, and Deployment

**Goal:** Stabilize the MVP before launch.

**Tasks:**
- [ ] Run `npm run lint` and fix all errors
- [ ] Run `npm run typecheck` and fix all errors
- [ ] Run `npm run build` and fix all errors
- [ ] Manually test all core user flows
- [ ] Manually test all admin flows
- [ ] Compare UI with deployed Vercel reference — fix regressions
- [ ] Update README.md with accurate installation and deployment steps
- [ ] Update DEPLOYMENT_NOTES.md
- [ ] Set up Vercel environment variables for production

**Files affected:**
- All files (QA pass)
- README.md, docs/DEPLOYMENT_NOTES.md

**Acceptance criteria:**
- Build passes with no errors
- TypeScript passes
- ESLint passes
- All core learner flows work end-to-end
- All admin flows work end-to-end
- UI matches the deployed reference visual direction
- README is accurate

**Risks:**
- Vercel PostgreSQL connection — verify serverless function connection pooling
- Environment variable management for multiple environments
