# docs/ADMIN_TODO.md — LangPath Admin Area TODO

## Current Admin State (Phase 4 Complete — Next.js Mock UI)

Pages built in `next-app/` (client components with React state, no DB):
- `/admin` — Dashboard with stats
- `/admin/lessons` — table + search/filter + toggle premium + delete confirmation + Edit links
- `/admin/lessons/new` — full LessonForm (title, slug, summary, content, lang, skill, level, status, premium, SEO, embedded Q&A editor)
- `/admin/lessons/[id]/edit` — LessonForm pre-filled from ADMIN_MOCK_LESSONS + MOCK_QUESTIONS
- `/admin/questions` — table + search + type filter + delete confirmation
- `/admin/languages` — table + activate/deactivate toggle
- `/admin/users` — table + search + role filter + toggle premium + delete confirmation
- `/admin/media` — table + search + type filter + delete confirmation
- `/admin/jobs` — table + status/type filters + cancel PENDING/RUNNING + trigger job modal

All admin changes live in React state — **lost on page reload** until Prisma is connected.

---

## Admin State (Phase 2.5 Complete — Static Prototype)

Pages that exist and work (mock data, React state):
- `AdminDashboard` — stats derived from mock data, recent lessons/users lists
- `AdminLessonList` — full CRUD in state: search, filter, edit, delete (modal), publish/unpublish inline
- `AdminLessonForm` — full form with auto-slug, publish modal, unpublish modal, status badge
- `AdminQuestionsPage` — question list with type/lesson filters, full modal editor with answer options + correct marking
- `LessonQuestionsEditor` (embedded in `AdminLessonForm`) — collapsible Q&A panel with full question CRUD scoped to the current lesson
- `AdminLanguagesPage` — language list with active toggle, modal add/edit
- `AdminUsersPage` — user table with inline role selector, premium toggle, activate/deactivate
- `AdminMediaPage` — media asset list with type/search filters, delete, upload placeholder
- `AdminJobsPage` — job list with status filter, cancel button, trigger job modal

All sidebar items now lead to real pages. No undefined component errors.

---

## Admin Features — Completed

### Overview Dashboard
- [x] Stats computed from ADMIN_MOCK_LESSONS and MOCK_USERS (not hardcoded)
- [x] Total Lessons, Published, Drafts, Total Users, Premium Users, Pending Jobs
- [x] Recent Lessons list (first 4, with status badge)
- [x] Recent Users list (first 4, with role badge)
- [x] "View all" links to lesson and user pages

### Lessons
- [x] Lesson table with search, status filter, language filter
- [x] Edit button → AdminLessonForm
- [x] Delete button → confirmation modal → removes from state
- [x] Publish/Unpublish inline in list (toggles status)
- [x] New Lesson button → AdminLessonForm (create mode)
- [x] Language, Skill, Level selectors using centralized constants
- [x] Title auto-generates Slug (preserves manual edits)
- [x] Summary, Content, Audio placeholder, SEO Title, SEO Description
- [x] Premium checkbox
- [x] Status badge in form header
- [x] Save draft with visual confirmation
- [x] Publish button → confirmation modal → navigates to list
- [x] Unpublish button (shown when Published) → confirmation modal → navigates to list

### Questions
- [x] Question list filtered by Lesson and/or Type
- [x] Type badges: SINGLE_CHOICE, MULTIPLE_CHOICE, FILL_BLANK, DICTATION
- [x] Add/Edit via modal
- [x] Delete with confirmation modal
- [x] Answer options management per question
- [x] SINGLE_CHOICE: radio buttons to mark one correct answer
- [x] MULTIPLE_CHOICE: checkboxes to mark multiple correct answers
- [x] FILL_BLANK / DICTATION: text input for correct answer
- [x] Explanation field
- [x] Sort order field
- [x] Add/remove individual answer option buttons

### Embedded Question Editor in Lesson Form (Phase 2.5)
- [x] LessonQuestionsEditor component embedded below SEO & Settings card in AdminLessonForm
- [x] Collapsible toggle (chevron icon) with question count badge
- [x] Scoped to current lesson's questions (loaded from MOCK_QUESTIONS by lessonId)
- [x] Empty state with "Add first question" prompt when lesson has no questions
- [x] Question table: sort order, type badge, prompt, option count, Edit / Del actions
- [x] Add/Edit via modal (same form structure as standalone AdminQuestionsPage)
- [x] Correct answer marking: radio (SINGLE_CHOICE), checkbox (MULTIPLE_CHOICE), text (FILL_BLANK/DICTATION)
- [x] Add/remove answer options per question
- [x] Explanation and sort order fields
- [x] Delete with confirmation modal
- [x] New-lesson placeholder (shows "save first" message when lessonId is not yet set)

### Languages
- [x] Language list with flag icon, name, slug, content summary, skill badges, active toggle
- [x] Active/inactive toggle (visual switch)
- [x] Modal add/edit with name, slug (auto-from name), content meta, active checkbox
- [x] "Add Language" button

### Users
- [x] User table: avatar, name, email, role selector, premium toggle, status, lessons done, joined date
- [x] Search by name or email
- [x] Role filter dropdown
- [x] Inline role selector (LEARNER / EDITOR / ADMIN)
- [x] Premium toggle switch (amber = premium)
- [x] Activate/Deactivate button per user

### Media
- [x] Media asset list: type icon, file name, MIME type, size, lesson link, uploaded date
- [x] Search by filename or lesson title
- [x] Type filter
- [x] Delete button with confirmation modal
- [x] Upload placeholder button (no real upload — mock only)

### Jobs
- [x] Job table with type badge, status badge, idempotency key, timestamps
- [x] Status filter
- [x] Cancel button for PENDING/RUNNING jobs
- [x] Trigger Job modal: type selector, JSON payload textarea, adds PENDING job to table
- [x] idempotencyKey auto-generated on trigger

---

## Known Limitations (Mock Phase)

- All changes (create/edit/delete) live in React state — lost on page navigation or reload
- No real backend, auth, or database
- Upload button is UI-only — no real file handling
- Slug uniqueness not validated
- No pagination on any table
- Question state in AdminLessonForm (LessonQuestionsEditor) is independent from AdminQuestionsPage — changes in one do not reflect in the other (both initialize from the MOCK_QUESTIONS global at mount time)
- No vocabulary editor on lessons yet
- Stats on Dashboard are live from mock data arrays (not from a real DB query)
- Admin lesson form changes do not persist back to the lesson list (independent React state)

---

## Remaining TODO (Next Phases)

- [ ] Persist admin changes with real database (Phase 5+)
- [ ] Vocabulary items editor on AdminLessonForm
- [ ] Pagination for all tables
- [ ] Bulk actions (bulk delete, bulk publish)
- [ ] Admin action logging/audit trail
- [ ] Real file upload for audio and PDFs
- [ ] Admin search across all content types

---

## Admin UX Rules (unchanged)

1. White card panels: `padding: 24px`, `borderRadius: 16`, `border: 1px solid var(--border)`
2. Table headers: 12px, uppercase, `color: var(--n-500)`, `letterSpacing: 0.04em`
3. Table rows: 14px, hover background `var(--n-50)`
4. Status badges: Published=green, Draft=amber, Review=blue, Archived=gray (from LESSON_STATUS_COLORS)
5. Forms use `<SelectInput>`, `<Input>`, `<Textarea>` from `ui.jsx`
6. Destructive actions require a confirmation `<Modal>`
7. Admin header: Logo + "Admin" Badge + "View site" ghost button + user avatar
8. Sidebar active item: `background: var(--blue-50)`, `color: var(--blue-600)`
9. Constants from `data/constants/` — never re-declare in component files
10. No payment features in admin
