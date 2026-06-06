# docs/NEXT_MIGRATION_LOG.md — Phase 3 Next.js Migration Log

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

## Known Gaps

1. **AdminLessonForm** — `/admin/lessons/new` and `/admin/lessons/[id]/edit` are shells only. The full form (Basic Info, Content, SEO, embedded Question Editor) is not yet migrated.
2. **Admin interactivity** — Tables are read-only (no delete modals, no inline edit). The prototype's full CRUD is pending client-side state.
3. **Lesson detail** — Only `first-day-school` has the full text + quiz + vocabulary. All other lessons show placeholder text.
4. **Auth** — Login/register forms submit to nowhere. No session management.
5. **Quiz submission** — No state management, no score calculation. Needs React client component.
6. **ListeningLessonPage, DictationLessonPage, VocabularyPracticePage** — Not yet migrated (no routes under `/[languageSlug]/listening`, `/[languageSlug]/dictation`, `/[languageSlug]/vocabulary`).
7. **TweaksPanel** — Removed (committed to defaults: layout=classic, cardStyle=elevated, density=comfortable).

---

## Recommended Next Migration Steps

1. Migrate `AdminLessonForm` into `components/admin/LessonForm.tsx` (client component) — this is the most complex piece
2. Add `"use client"` quiz component with React state for submission and scoring
3. Migrate `ListeningLessonPage`, `DictationLessonPage`, `VocabularyPracticePage` routes
4. Add interactivity to admin tables (delete modals, status toggles) as client components
5. Add real auth after all UI is migrated

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
