# docs/ARCHITECTURE.md — LangPath Architecture

## Current Architecture (Prototype)

```
Browser
  └── LangPath.html (entry point)
       ├── tokens.css (design tokens + global styles)
       ├── tweaks-panel.jsx (prototype edit panel — via window globals)
       ├── ui.jsx (base components → window.Button, window.Badge, etc.)
       ├── layout.jsx (Header, Footer, AdminSidebar → window globals)
       ├── learning.jsx (mock data + learning components → window globals)
       ├── home-page.jsx (HomePage → window.HomePage)
       ├── language-pages.jsx (LanguageDetailPage, SkillLessonListPage)
       ├── lesson-page.jsx (LessonDetailPage — hardcoded LESSON_TEXT, QUIZ_QUESTIONS)
       ├── special-lessons.jsx (ListeningLessonPage, DictationLessonPage, VocabularyPracticePage)
       ├── auth-dashboard.jsx (LoginPage, RegisterPage, LearnerDashboard)
       ├── admin-pages.jsx (AdminDashboard, AdminLessonList, AdminLessonForm)
       └── app.jsx (App root — custom router, page rendering switch, layout wrappers)
```

**Routing:** Client-side state machine in `app.jsx` using `React.useState({ page, params })`.
Navigation calls `navigate(page, params)` which sets state and scrolls to top.

**Data sharing:** All components exported to `window` via `Object.assign(window, {...})`.
Script load order in `LangPath.html` determines dependency resolution.

**Data:** All mock — hardcoded in JSX files. No database, no API.

**Auth:** Mock — login/register forms simulate a delay then call `onLogin()` callback.

---

## Target Architecture

```
Client Browser
     │
     ▼
Next.js Web Application (Vercel Edge + Serverless Functions)
     │
     ├── Public Pages (SSR/SSG)
     │     /                          → Home
     │     /[languageSlug]            → Language detail
     │     /[languageSlug]/[skill]    → Skill lesson list
     │     /[languageSlug]/[skill]/[lesson] → Lesson detail
     │
     ├── Auth Pages (Server Components + Client Forms)
     │     /login
     │     /register
     │
     ├── Dashboard (Server Components + Protected)
     │     /dashboard
     │
     ├── Admin UI (Server Components + RBAC Protected)
     │     /admin
     │     /admin/languages, /admin/skills, /admin/levels
     │     /admin/lessons, /admin/lessons/[id]
     │     /admin/media, /admin/jobs, /admin/users
     │
     └── API Routes (Serverless Functions)
           /api/auth/*
           /api/languages, /api/skills, /api/lessons
           /api/attempts
           /api/admin/*
           /api/me
     │
     ▼
Application Services (lib/ + server/)
     │
     ├── Auth Service         (lib/auth/)
     ├── Lesson Service       (server/services/lesson.ts)
     ├── Quiz Service         (server/services/quiz.ts)
     ├── Progress Service     (server/services/progress.ts)
     ├── Admin Service        (server/services/admin.ts)
     ├── Media Service        (server/services/media.ts)
     └── Worker Job Service   (lib/jobs/queue.ts)
     │
     ▼
Repositories (server/repositories/)
     │
     ├── UserRepository
     ├── LessonRepository
     ├── AttemptRepository
     ├── ProgressRepository
     └── JobRepository
     │
     ▼
Prisma ORM + PostgreSQL
     │
     ▼
Storage / Search / Worker (Placeholder Abstractions)
     ├── Storage: lib/storage/ (local file → S3 later)
     ├── Search: lib/search/ (DB query → Typesense later)
     └── Jobs: lib/jobs/ (in-process → Redis later)
```

---

## Module Boundaries

| Module | Responsibility | Does NOT |
|--------|---------------|---------|
| `app/` pages | UI rendering, metadata, route params | Contain business logic |
| `components/` | Reusable UI components | Call database directly |
| `app/api/` routes | Validate input, call services, return JSON | Contain business logic |
| `server/services/` | Business logic, orchestrate repositories | Access DB directly |
| `server/repositories/` | Database queries via Prisma | Contain business logic |
| `lib/auth/` | Session management, role checks | Access DB directly |
| `lib/scoring/` | Quiz scoring algorithms | Access DB |
| `lib/jobs/` | Job creation/status abstraction | Process jobs (placeholder) |
| `lib/storage/` | Asset storage abstraction | Business logic |

---

## Data Flow

### Public Lesson View

```
User visits /english/reading/my-first-day-at-school
     ↓
Next.js page.tsx (server component)
     ↓
LessonRepository.getPublishedBySlug(slug)
     ↓ (filters: status=PUBLISHED, correct answers excluded)
PostgreSQL via Prisma
     ↓
Page renders with lesson content (no quiz answers in payload)
     ↓
Client: QuizQuestion components render answer options without isCorrect field
```

### Quiz Submission Flow

```
User clicks "Submit answers"
     ↓
Client POSTs to /api/attempts
  { lessonId, answers: [{ questionId, selectedOptionId | textAnswer }] }
     ↓
API route validates input (Zod)
     ↓
QuizService.scoreAttempt(lessonId, answers)
  - Fetches correct answers from DB (server-side only)
  - Calculates score per question type
  - Creates Attempt record
  - Creates AttemptAnswer records
  - Updates Progress (best score, completed if >= 70%)
     ↓
Response: { score, total, passed, answers: [{ questionId, correct, explanation }] }
     ↓
Client shows QuizResult with score and correct answers revealed
```

### Admin Publish Flow

```
Admin clicks "Publish" in AdminLessonForm
     ↓
Confirmation modal shown
     ↓
Admin confirms → PATCH /api/admin/lessons/:id { status: 'PUBLISHED' }
     ↓
AdminService.publishLesson(id)
  - Updates Lesson.status = PUBLISHED
  - Creates WorkerJob { type: INDEX_SEARCH, status: PENDING, idempotencyKey: 'index-{id}' }
  - Creates WorkerJob { type: REVALIDATE_CACHE, status: PENDING, idempotencyKey: 'cache-{id}' }
  - Creates WorkerJob { type: GENERATE_PDF, status: PENDING, idempotencyKey: 'pdf-{id}' }
     ↓
Response: { lesson, jobs }
     ↓
Admin sees updated status and job list
```

### Auth Flow

```
User submits login form
     ↓
Client POSTs to /api/auth/login { email, password }
     ↓
API validates input (Zod)
     ↓
UserRepository.findByEmail(email)
     ↓
bcrypt.compare(password, user.passwordHash)
     ↓ (on success)
Session.create(userId, role) → HTTP-only cookie set
     ↓
Response: { user: { id, email, name, role, isPremium } }
     ↓
Client redirects to /dashboard
```

---

## Storage Abstraction

```typescript
// lib/storage/index.ts
interface StorageProvider {
  upload(file: File, key: string): Promise<string>  // returns public URL
  delete(key: string): Promise<void>
  getUrl(key: string): string
}

// MVP: local filesystem or static path
// Later: S3, Cloudflare R2, Vercel Blob
```

---

## Search Abstraction

```typescript
// lib/search/index.ts
interface SearchProvider {
  indexLesson(lesson: Lesson): Promise<void>
  search(query: string, filters: SearchFilters): Promise<SearchResult[]>
}

// MVP: Prisma full-text or ILIKE query
// Later: Typesense, Algolia, or Meilisearch
```

---

## Worker Job Abstraction

```typescript
// lib/jobs/queue.ts
type JobType = 'GENERATE_PDF' | 'PROCESS_AUDIO' | 'INDEX_SEARCH' | 'REVALIDATE_CACHE'
type JobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

interface JobQueue {
  createJob(type: JobType, payload: object, idempotencyKey: string): Promise<WorkerJob>
  getJob(id: string): Promise<WorkerJob>
  listJobs(filters?: { type?: JobType, status?: JobStatus }): Promise<WorkerJob[]>
}

// MVP: database-backed, no real processing
// Later: Redis + BullMQ or similar
```

---

## SEO Strategy

- **Public pages:** Server-rendered with `generateMetadata()` for dynamic title and description
- **Semantic URLs:** `/english/reading/my-first-day-at-school` (not `/lessons/123`)
- **Sitemap:** Auto-generated from published lessons — `app/sitemap.ts`
- **Robots:** Allow all public pages, disallow `/admin` and `/api`
- **JSON-LD:** Schema.org `Course` or `LearningResource` markup on lesson pages
- **No indexing:** Admin and API routes must never appear in search results

---

## Deployment Strategy

- **Hosting:** Vercel
- **Database:** PostgreSQL (Vercel Postgres for MVP, or Supabase/Railway)
- **Environment:** Separate dev and prod databases
- **Builds:** Vercel auto-detects Next.js — `npm run build` triggered on push to main
- **Secrets:** Stored in Vercel Environment Variables (not committed to git)
- **Cache:** Next.js route-level revalidation for public pages

---

## Architecture Principles

1. **Modular monolith for MVP** — no microservices yet
2. **Clear service/repository boundaries** — pages never query DB directly
3. **Storage, search, and job layers abstracted** — swap implementations without touching business logic
4. **Server-side security** — auth and role checks happen in API routes and server components, not just the frontend
5. **No over-engineering** — placeholder abstractions are thin wrappers, not full implementations
