# docs/MIGRATION_MAP.md — LangPath Prototype → Next.js Migration Map

Generated during Phase 2.5. Use this as the contract when scaffolding the Next.js project.

---

## Current Files

| File | Purpose |
|------|---------|
| `LangPath.html` | Entry point — loads constants, mock data, then all Babel JSX files |
| `tokens.css` | CSS custom properties (design tokens) — colors, spacing, radius, shadow, font |
| `tweaks-panel.jsx` | Prototype-only live layout/card/density switcher — remove after migration |
| `ui.jsx` | Base UI components: Button, Badge, Input, Textarea, SelectInput, SearchInput, Card, ProgressBar, Modal, Tabs, Icon |
| `layout.jsx` | Header, Footer, Breadcrumb, AdminSidebar, FlagIcon, Logo |
| `learning.jsx` | Shared learning components: LanguageCard, SkillCard, LevelFilter, LessonCard, AudioPlayer, QuizQuestion, QuizResult, VocabularyCardComp |
| `home-page.jsx` | HomePage |
| `language-pages.jsx` | LanguageDetailPage, SkillLessonListPage |
| `lesson-page.jsx` | LessonDetailPage (reading + quiz) |
| `special-lessons.jsx` | ListeningLessonPage, DictationLessonPage, VocabularyPracticePage |
| `auth-dashboard.jsx` | LoginPage, RegisterPage, LearnerDashboard |
| `admin-pages.jsx` | AdminDashboard, AdminLessonList, AdminLessonForm (with embedded LessonQuestionsEditor), AdminQuestionsPage, AdminLanguagesPage, AdminUsersPage, AdminMediaPage, AdminJobsPage |
| `app.jsx` | App root — state-based router (16 route cases), TweaksPanel wiring, hash routing |
| `data/constants/languages.js` | LANGUAGES_DATA |
| `data/constants/skills.js` | SKILL_ICONS, SKILL_COLORS |
| `data/constants/levels.js` | LEVELS |
| `data/constants/lesson-statuses.js` | LESSON_STATUSES, LESSON_STATUS_COLORS |
| `data/constants/roles.js` | ROLES |
| `data/constants/job-types.js` | JOB_TYPES, JOB_TYPE_LABELS |
| `data/constants/job-statuses.js` | JOB_STATUSES, JOB_STATUS_COLORS |
| `data/mock/lessons.js` | SAMPLE_LESSONS, ADMIN_MOCK_LESSONS |
| `data/mock/questions.js` | QUIZ_QUESTIONS, LESSON_TEXT, VOCAB_WORDS, MOCK_QUESTIONS + helper functions |
| `data/mock/vocabulary.js` | VOCAB_PRACTICE_WORDS |
| `data/mock/users.js` | MOCK_USERS |
| `data/mock/worker-jobs.js` | MOCK_WORKER_JOBS |
| `data/mock/media-assets.js` | MOCK_MEDIA_ASSETS |

---

## Current Router

The router lives in `app.jsx` inside the `App` component as a `React.useState` value.

```js
const [route, setRoute] = React.useState(() =>
  HASH_TO_ROUTE[window.location.hash] || { page: 'home', params: {} }
);
```

Navigation is triggered by calling `navigate(page, params)` passed as a prop to every page component.

### All Route Cases (as of Phase 2.5)

| `page` key | Params | Component |
|------------|--------|-----------|
| `home` | — | `HomePage` |
| `language` | `lang` (slug string) | `LanguageDetailPage` |
| `skill-list` | `lang`, `skill` | `SkillLessonListPage` |
| `lesson` | `lang`, `skill`, `id` | `LessonDetailPage` |
| `listening-lesson` | `lang` | `ListeningLessonPage` |
| `dictation-lesson` | `lang` | `DictationLessonPage` |
| `vocabulary` | `lang` | `VocabularyPracticePage` |
| `login` | — | `LoginPage` |
| `register` | — | `RegisterPage` |
| `dashboard` | — | `LearnerDashboard` |
| `admin` | — | `AdminDashboard` |
| `admin-lessons` | — | `AdminLessonList` |
| `admin-lesson-form` | `id` (optional — undefined = create) | `AdminLessonForm` |
| `admin-questions` | — | `AdminQuestionsPage` |
| `admin-languages` | — | `AdminLanguagesPage` |
| `admin-users` | — | `AdminUsersPage` |
| `admin-media` | — | `AdminMediaPage` |
| `admin-jobs` | — | `AdminJobsPage` |

### Hash Route Map (Phase 2.5 addition)

Simple routes (no params) persist across refresh via URL hash:

| Hash | Page key |
|------|----------|
| `#/home` | `home` |
| `#/dashboard` | `dashboard` |
| `#/admin` | `admin` |
| `#/admin/lessons` | `admin-lessons` |
| `#/admin/questions` | `admin-questions` |
| `#/admin/languages` | `admin-languages` |
| `#/admin/users` | `admin-users` |
| `#/admin/media` | `admin-media` |
| `#/admin/jobs` | `admin-jobs` |
| `#/login` | `login` |
| `#/register` | `register` |

Routes with params (`language`, `skill-list`, `lesson`, `listening-lesson`, `dictation-lesson`, `vocabulary`, `admin-lesson-form`) fall back to home on refresh — migrate these first when adding Next.js dynamic routes.

---

## Target Next.js App Router Routes

| Current page key | Current params | Target Next.js route |
|------------------|----------------|----------------------|
| `home` | — | `/` |
| `language` | `lang` | `/[languageSlug]` |
| `skill-list` | `lang`, `skill` | `/[languageSlug]/[skillSlug]` |
| `lesson` | `lang`, `skill`, `id` | `/[languageSlug]/[skillSlug]/[lessonSlug]` |
| `listening-lesson` | `lang` | `/[languageSlug]/listening` |
| `dictation-lesson` | `lang` | `/[languageSlug]/dictation` |
| `vocabulary` | `lang` | `/[languageSlug]/vocabulary` |
| `login` | — | `/login` |
| `register` | — | `/register` |
| `dashboard` | — | `/dashboard` |
| `admin` | — | `/admin` |
| `admin-lessons` | — | `/admin/lessons` |
| `admin-lesson-form` (create) | — | `/admin/lessons/new` |
| `admin-lesson-form` (edit) | `id` | `/admin/lessons/[id]/edit` |
| `admin-questions` | — | `/admin/questions` |
| `admin-languages` | — | `/admin/languages` |
| `admin-users` | — | `/admin/users` |
| `admin-media` | — | `/admin/media` |
| `admin-jobs` | — | `/admin/jobs` |

---

## Component Migration Map

| Current file / export | Target Next.js location |
|-----------------------|-------------------------|
| `ui.jsx` → Button, Badge, Input, etc. | `components/ui/` |
| `layout.jsx` → Header, Footer | `components/layout/Header.tsx`, `components/layout/Footer.tsx` |
| `layout.jsx` → AdminSidebar | `components/admin/AdminSidebar.tsx` |
| `layout.jsx` → Breadcrumb | `components/ui/Breadcrumb.tsx` |
| `layout.jsx` → FlagIcon, Logo | `components/ui/FlagIcon.tsx`, `components/ui/Logo.tsx` |
| `learning.jsx` → LanguageCard, SkillCard, LessonCard | `components/catalog/` |
| `learning.jsx` → AudioPlayer | `components/lesson/AudioPlayer.tsx` |
| `learning.jsx` → QuizQuestion, QuizResult | `components/quiz/` |
| `learning.jsx` → VocabularyCardComp | `components/lesson/VocabularyCard.tsx` |
| `home-page.jsx` → HomePage | `app/(public)/page.tsx` |
| `language-pages.jsx` → LanguageDetailPage | `app/(public)/[languageSlug]/page.tsx` |
| `language-pages.jsx` → SkillLessonListPage | `app/(public)/[languageSlug]/[skillSlug]/page.tsx` |
| `lesson-page.jsx` → LessonDetailPage | `app/(public)/[languageSlug]/[skillSlug]/[lessonSlug]/page.tsx` |
| `special-lessons.jsx` → ListeningLessonPage | `app/(public)/[languageSlug]/listening/page.tsx` |
| `special-lessons.jsx` → DictationLessonPage | `app/(public)/[languageSlug]/dictation/page.tsx` |
| `special-lessons.jsx` → VocabularyPracticePage | `app/(public)/[languageSlug]/vocabulary/page.tsx` |
| `auth-dashboard.jsx` → LoginPage, RegisterPage | `app/login/page.tsx`, `app/register/page.tsx` |
| `auth-dashboard.jsx` → LearnerDashboard | `app/dashboard/page.tsx` + `components/dashboard/` |
| `admin-pages.jsx` → AdminDashboard | `app/admin/page.tsx` |
| `admin-pages.jsx` → AdminLessonList | `app/admin/lessons/page.tsx` + `components/admin/LessonTable.tsx` |
| `admin-pages.jsx` → AdminLessonForm + LessonQuestionsEditor | `app/admin/lessons/new/page.tsx`, `app/admin/lessons/[id]/edit/page.tsx` + `components/admin/LessonForm.tsx`, `components/admin/LessonQuestionsEditor.tsx` |
| `admin-pages.jsx` → AdminQuestionsPage | `app/admin/questions/page.tsx` + `components/admin/QuestionTable.tsx` |
| `admin-pages.jsx` → AdminLanguagesPage | `app/admin/languages/page.tsx` |
| `admin-pages.jsx` → AdminUsersPage | `app/admin/users/page.tsx` |
| `admin-pages.jsx` → AdminMediaPage | `app/admin/media/page.tsx` |
| `admin-pages.jsx` → AdminJobsPage | `app/admin/jobs/page.tsx` |
| `tweaks-panel.jsx` | Remove — set defaults: `layout=classic`, `cardStyle=elevated`, `density=comfortable` |
| `tokens.css` | `app/globals.css` (CSS variables) + Tailwind theme extension |
| `data/constants/*` | `lib/constants/` or `data/constants/` |
| `data/mock/*` | `data/mock/` initially, then Prisma seed |

---

## Migration Rules

1. **Preserve visual direction.** Use the deployed prototype at `https://thang-nv.vercel.app/` as the visual reference.
2. **Migrate one route at a time.** Start with `/admin/lessons` as it has the most complex form.
3. **Keep mock data in the first migration pass.** Do not add Prisma or real APIs during initial UI migration.
4. **Do not add auth during initial UI migration.** Add it in a dedicated auth phase after all pages are migrated.
5. **Do not add payment.** Not in scope.
6. **Verify each migrated route** against the deployed Vercel prototype before moving to the next.
7. **Replace `Object.assign(window, {...})` pattern** with proper ES module exports.
8. **Replace `navigate(page, params)` calls** with Next.js `Link` components or `useRouter().push()`.
9. **Remove TweaksPanel** — commit to layout defaults.
10. **Migrate CSS variables** from `tokens.css` to Tailwind theme config, or keep both during transition.

---

## Recommended Migration Order

1. Scaffold Next.js App Router project (TypeScript + Tailwind + shadcn/ui) in a new branch
2. Copy `tokens.css` variables into `app/globals.css` and Tailwind theme
3. Migrate `ui.jsx` → `components/ui/` (Button, Badge, Input, Modal, etc.)
4. Migrate `layout.jsx` → `components/layout/` and `components/ui/`
5. Migrate admin pages first (they have the most complete mock data)
   - `/admin` dashboard
   - `/admin/lessons` list + form + embedded question editor
   - `/admin/questions`
   - `/admin/languages`
   - `/admin/users`
   - `/admin/media`
   - `/admin/jobs`
6. Migrate public learner pages
   - `/` home
   - `/[languageSlug]` language detail
   - `/[languageSlug]/[skillSlug]` skill lesson list
   - `/[languageSlug]/[skillSlug]/[lessonSlug]` lesson + quiz
7. Migrate auth pages (`/login`, `/register`)
8. Migrate dashboard (`/dashboard`)
9. Replace mock data with Prisma (after all UI is migrated and visually verified)
10. Add real auth (after Prisma is working)

---

## Known Prototype Limitations to Fix During Migration

- All state is in-memory (React state) — lost on reload
- No pagination on any admin table
- Question editor state in AdminLessonForm is independent from AdminQuestionsPage state (both read from window globals at mount, changes don't cross-sync)
- No real authentication — `isLoggedIn` is a local boolean toggle
- Audio player has no real audio source
- No URL for parameterized routes (`/lesson/123`) — these fall back to home on refresh
- Admin lesson form does not persist to the lesson list (separate state)
- No form validation beyond basic disabled-button guards
