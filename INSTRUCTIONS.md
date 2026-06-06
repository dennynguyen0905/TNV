# INSTRUCTIONS.md — LangPath Development Workflow

## Standard Development Workflow

1. Read `AGENT.md` for product context and coding rules.
2. Check `docs/PLAN.md` for the current phase and acceptance criteria.
3. Check `docs/TASKS.md` for the specific task list.
4. Inspect the relevant files before making changes.
5. Make small, incremental changes.
6. Test the change in the browser.
7. Compare local UI with the deployed reference at https://thang-nv.vercel.app/
8. Commit with a descriptive message (see commit conventions below).

---

## How to Run the Current App

The current prototype is a plain HTML file with no build step.

```bash
# Option 1 — npx serve (recommended)
npx serve .
# Open http://localhost:3000/LangPath.html

# Option 2 — Python HTTP server
python -m http.server 8080
# Open http://localhost:8080/LangPath.html

# Option 3 — VS Code Live Server extension
# Right-click LangPath.html → Open with Live Server
```

**Important:** The file must be served over HTTP, not opened as `file://`.
Babel Standalone and cross-origin script loading require HTTP.

---

## How to Compare Local UI with the Deployed Vercel UI

1. Run the local server (see above).
2. Open the local URL in one browser tab.
3. Open https://thang-nv.vercel.app/ in another tab.
4. Compare visually: layout, colors, spacing, card styles, navigation behavior.
5. If a change introduces a regression from the deployed UI, revert or justify the change.

---

## How to Add a New Language

Currently (prototype — mock data in `data/constants/languages.js`):

1. Open `data/constants/languages.js`.
2. Find `LANGUAGES_DATA` array.
3. Add a new entry:
   ```js
   { id: 'italian', name: 'Italian', meta: '200 reading texts · 80 listening texts', skills: ['Reading','Listening','Dictation','Grammar','Vocabulary'] }
   ```
4. Add a `FlagIcon` SVG case in `layout.jsx` inside the `flags` object.
5. Test by navigating to the language page via the homepage language cards.

After Next.js + database migration: insert a row in the `Language` table via seed or admin UI.

---

## How to Add a New Skill

Skills are defined in `data/constants/skills.js`:

```js
const SKILL_ICONS = { Reading: 'book', Listening: 'headphones', ... };
const SKILL_COLORS = { Reading: { bg: '...', accent: '...' }, ... };
```

1. Add the new skill to `SKILL_ICONS` and `SKILL_COLORS` in `data/constants/skills.js`.
2. Add the skill name to each language's `skills` array in `data/constants/languages.js`.
3. Add a route case in `app.jsx` if the skill needs a different page component.

After Next.js + database migration: insert a row in the `Skill` table.

---

## How to Add a New Level

CEFR levels are defined in `data/constants/levels.js`:

```js
window.LEVELS = ['A1','A2','B1','B2','C1','C2'];
```

Add the new level to the `LEVELS` array. It will appear automatically in level filters.

After Next.js + database migration: insert a row in the `Level` table.

---

## How to Add a New Lesson

Currently (prototype — mock data):

1. Open `data/mock/lessons.js`.
2. Add a new entry to `SAMPLE_LESSONS`:
   ```js
   { id: 'my-lesson-slug', title: 'My Lesson Title', summary: '...', lang: 'English', skill: 'Reading', level: 'A1', time: '8 min', free: true, questions: 5, hasPdf: false }
   ```
3. The lesson will appear in skill-list pages and home page featured sections.
4. For a full lesson detail (content + quiz), update `lesson-page.jsx` (currently hardcoded to one lesson).

After Next.js + database migration: use the admin UI to create lessons.
All admin lesson creation goes through the `AdminLessonForm` component → POST `/api/admin/lessons`.

---

## How to Add Questions and Answers

Currently (prototype — mock data in `data/mock/questions.js`):

Two ways to manage questions:

**1. Via the embedded question editor in AdminLessonForm:**
- Navigate to Admin → Lessons → Edit a lesson
- Scroll down to the "Questions & Answers" collapsible section
- Click "Add Question" to add a new question scoped to this lesson
- Changes are in React state only (lost on navigation)

**2. Via the standalone AdminQuestionsPage:**
- Navigate to Admin → Questions
- Filter by lesson; add/edit/delete questions across all lessons

**3. To add mock data permanently:**
- Open `data/mock/questions.js`
- Add a new object to `MOCK_QUESTIONS` with the correct `lessonId`
- Use `window.LangPathData.createMockQuestion(fields)` as a shape reference

After Next.js + database migration: use the embedded question editor in `AdminLessonForm`. Correct answers are only stored server-side and never sent to the client during lesson display.

---

## How to Test Quizzes

1. Navigate to any reading lesson (e.g., Home → English → Reading → "My First Day at School").
2. Read the text.
3. Select answers for all questions.
4. Click "Submit answers".
5. Verify the score display (green for ≥70%, amber for <70%).
6. Click "Review answers" to check which answers were correct.
7. Click "Continue learning" to return to the lesson list.

For listening quizzes: navigate to English → Listening → "Morning Routine".
For dictation: navigate to English → Dictation → "Simple Sentences".

---

## How to Test Admin Features

1. From any page, navigate to admin via URL hash: open `LangPath.html#/admin`
   - Or open browser console and run: `window.__nav('admin')`
2. Verify the admin dashboard stats and recent lessons/users panels.
3. Navigate to Lessons in the sidebar.
4. Click "Edit" on any lesson to test the edit form.
5. Scroll down to the "Questions & Answers" collapsible section — verify questions for that lesson appear.
6. Click "Add Question" — fill in prompt, set type, mark correct answer, save.
7. Click "New Lesson" to test the create form — verify the Questions & Answers section shows "Save the lesson first" placeholder.
8. Fill in Basic Info, Content, and SEO fields.
9. Click "Publish" — verify the confirmation modal appears.
10. Click "Confirm Publish" — verify navigation back to lesson list.

All admin sidebar pages are now functional. See `docs/ADMIN_TODO.md` for details.

---

## How to Handle Premium Placeholders

In the current prototype:
- Lesson cards show a "Premium" amber badge when `lesson.free === false`.
- No locked state is implemented yet on lesson detail pages.

To test premium placeholders:
1. In `SAMPLE_LESSONS` (learning.jsx), find a lesson with `free: false`.
2. Verify it shows the "Premium" badge on lesson cards.

After backend migration:
- `Lesson.isPremium` controls the badge and locked state.
- `User.isPremium` controls access (toggleable by admin).
- Non-premium users see a preview or a locked overlay on premium lessons.

---

## How to Seed Data

Currently: no seed script exists (all data is hardcoded mock data).

After Prisma migration:
```bash
# Push schema
npm run db:push

# Run seed script
npm run db:seed
```

The seed script will be at `prisma/seed.ts`. It must use only original content — no copied content from external sources. See `docs/SEED_CONTENT_GUIDE.md`.

---

## How to Check Builds

Current prototype (no build):
```bash
npx serve .
# Visual check in browser
```

After Next.js migration:
```bash
npm run build
# Check for TypeScript errors and build failures
npm run typecheck
npm run lint
```

---

## Commit Message Convention

Format: `type: short description`

Types:
- `feat:` — new feature or page
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code restructuring without behavior change
- `style:` — CSS/visual changes
- `data:` — mock data or constants changes
- `admin:` — admin-specific changes
- `chore:` — tooling, config, dependencies

Examples:
```
feat: add admin users page with role selector
fix: vocabulary flashcard shows wrong word on next click
docs: update PLAN.md with Phase 2 acceptance criteria
data: centralize LANGUAGES_DATA into data/constants/languages.ts
admin: add question editor panel to AdminLessonForm
style: adjust lesson card padding for compact layout
```
