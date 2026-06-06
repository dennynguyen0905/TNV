# docs/UI_REFERENCE.md — LangPath UI Reference

## Deployed Reference

**URL:** https://thang-nv.vercel.app/
**Product name:** LangPath — Language Learning Platform

This file documents the current UI as found in the codebase. Since the deployed site is the source of truth for visual direction, always compare local changes against the deployed URL before shipping.

> Note: The deployed UI was inspected indirectly via the source files. If a visual detail is uncertain, check the live site directly.

---

## Design Token System

All visual values are defined as CSS custom properties in `tokens.css`. Never hardcode colors, radii, or shadows in components — always reference the tokens.

**Color palette:**

| Token | Value | Use |
|-------|-------|-----|
| `--blue-500` | #2563EB | Primary actions, links, active states |
| `--blue-50` | #EEF2FF | Primary light backgrounds |
| `--green-500` | #059669 | Success, free badge, published status |
| `--amber-500` | #D97706 | Premium badge, draft status, warning |
| `--red-500` | #DC2626 | Error, danger, wrong answers |
| `--n-900` | #0F172A | Primary text |
| `--n-600` | #475569 | Secondary text, nav labels |
| `--n-400` | #94A3B8 | Muted text, metadata |
| `--n-200` | #E2E8F0 | Borders |
| `--n-50` | #F8FAFC | Page background, hover states |
| `--bg-card` | #FFFFFF | Card backgrounds |

**Typography:**
- Font: Inter (Google Fonts, weights 400/500/600/700/800)
- Base size: 16px
- Heading weight: 800
- Body weight: 400/500

**Spacing scale:** `--sp-xs` (4px) → `--sp-4xl` (96px)

**Border radius:**
- Buttons: `--r-btn` = 10px
- Cards: `--r-card` = 16px (12px in compact mode)
- Inputs: `--r-input` = 10px
- Badges: `--r-badge` = 999px (pill)
- Large containers: `--r-lg` = 24px

**Shadows:**
- Card: subtle, multi-layer (`--shadow-card`)
- Hover: elevated (`--shadow-hover`)
- Modal overlay: `--shadow-modal`

---

## Layout Variants

The prototype supports three layout modes controlled by the TweaksPanel:

| Mode | Description |
|------|-------------|
| `classic` | Default — two-column layout with sidebar on lesson and skill list pages |
| `wide` | Two-column hero on home page, 4-column lesson grid, no sidebar |
| `compact` | Reduced spacing, smaller headings, 2-column grids |

Container max-width: 1200px via `.container` class.

---

## Navigation

**Public header:**
- Sticky, white background, 64px height (56px compact)
- Logo (left) → navigates home
- Nav links (center): Languages, Reading, Listening, Dictation
- Auth buttons (right): "Log in" (ghost) + "Start learning" (primary) when logged out
- "Dashboard" (ghost) + avatar icon when logged in

**Admin header:**
- Logo + "Admin" gray badge
- "View site" ghost button (right)
- User avatar circle (right)
- No nav links

**Admin sidebar:**
- 240px wide, white background, `border-right: 1px solid var(--border)`
- Items: Dashboard, Languages, Lessons, Questions, Media, Users, Jobs
- Active item: `background: var(--blue-50)`, `color: var(--blue-600)`, blue icon
- Inactive item: transparent background, `color: var(--n-600)`, gray icon

**Breadcrumb:**
- Shows hierarchy: Home → Language → Skill → Lesson
- Non-terminal items are links (`color: var(--n-500)`, hover → blue-500)
- Terminal item is bold (`color: var(--n-700)`)

**Footer:**
- Dark background (`var(--n-900)`)
- 5 columns: Logo+description, Languages, Skills, Platform, Legal
- Bottom bar: copyright + Terms/Privacy links

---

## Card Conventions

**LanguageCard:**
- Hover: lift + shadow
- Contains: flag icon, language name, meta text (reading/listening counts), skill badges
- Used on: home page, skill list sidebar

**LessonCard:**
- Hover: lift + shadow
- Contains: Free/Premium badge, level badge, PDF badge (optional), title, summary, time + question count, language+skill footer
- "Start lesson →" link at bottom right
- Used on: home page featured section, skill list page, dashboard recommended

**SkillCard:**
- Contains: colored icon in square, skill name, description, "Start practice →" link
- Used on: language detail page

---

## Badge Conventions

| Color | Use |
|-------|-----|
| `color="green"` | Free lessons, Published status |
| `color="amber"` | Premium lessons, Draft status |
| `color="blue"` | Level (A1, A2, ...), Review status, skill tags |
| `color="gray"` | PDF indicator, Archived status, generic metadata |
| `color="red"` | Errors, wrong answers |

---

## Button Conventions

| Variant | Use |
|---------|-----|
| `primary` | Main CTA — blue background, white text |
| `secondary` | Secondary CTA — blue-50 background, blue text |
| `outline` | Neutral action — transparent background, border |
| `ghost` | Subtle action — transparent background, no border |
| `success` | Positive action — green background |
| `danger` | Destructive action — red background |

Sizes: `sm` (8px/16px padding), `md` (10px/20px), `lg` (14px/28px)

---

## Form Conventions

**Input:**
- 10px border radius, 10px/14px padding
- Focus: blue border (`var(--blue-500)`)
- Error: red border with error message below
- Label above input (14px, 500 weight)

**Textarea:**
- Same style as Input, resizable vertically
- 4 rows default

**SelectInput:**
- Same style as Input, native `<select>` appearance

**SearchInput:**
- Search icon inline left, 42px left padding
- Focus: blue border

**Form sections in admin:**
- Each section is a white card panel (background: #fff, borderRadius: 16, border: 1px solid var(--border), padding: 24px)
- Section title: 16px, 700 weight, margin-bottom: 20px

---

## Lesson Page Conventions

**Layout (classic mode):**
- Two-column: main content (flex: 1) + sidebar (320px)
- Sidebar contains: lesson progress bar, audio player, vocabulary, download PDF, related lessons

**Layout (wide/compact modes):**
- Single column, no sidebar
- Audio player appears inline above reading text
- Vocabulary appears as 2-column grid below reading text

**Reading text display:**
- White card with 32px padding (40px wide)
- 16px font size, 1.8 line height, `color: var(--n-700)`

**Quiz:**
- Each question in white card with 24px padding
- Question number in blue, prompt in dark text
- Options as full-width buttons with left-aligned radio circle
- Selected: blue border + blue-50 background
- Correct (after submit): green border + green-50 background + check icon
- Wrong: red border + red-50 background + X icon
- Submit disabled until all questions answered
- QuizResult centered card: trophy icon, score %, pass/fail message, two action buttons

**Dictation:**
- Progress bar at top showing sentence progress
- AudioPlayer (compact mode)
- Textarea for typed input
- Correction display: word-by-word color coding (green=correct, red=wrong, amber=missing)

**Vocabulary flashcard:**
- Centered card, max-width 480px
- Front: large word + pronunciation in monospace
- Back (tap to flip): word + meaning + italic example sentence
- Two buttons: "Need practice" (amber) + "I know this" (green)

---

## Dashboard Conventions

**Continue learning banner:**
- Blue-50 gradient background, border: blue-100
- Left: label "Continue learning", lesson title, subject line, progress bar, percent label
- Right: "Resume lesson" primary button

**Progress cards:**
- 3-column grid (2-column compact)
- Each card: flag icon + language name + level badge, completed count, best score

**Recent activity list:**
- White card with dividers between rows
- Each row: lesson title + type/level (left), score + date (right)
- Score colored: green for ≥80%, amber for <80%

**Recommended section:**
- 3-column lesson card grid

---

## Admin UI Conventions

**Admin dashboard:**
- 3-column stat card grid (6 cards)
- 2-column panel row: Recent Lessons + Recent Users
- Each panel: header with title + "View all" ghost button, divider rows

**Admin lesson list:**
- Full-width table inside white card
- Filters row: search input (flex: 1) + status dropdown + language dropdown
- Table columns: Title, Language, Skill, Level, Status, Premium, Updated, Actions
- Actions: Edit (ghost) + Del (ghost, red text)

**Admin lesson form (Phase 2.5 updated):**
- Max-width 900px
- Sections as white card panels: Basic Information, Content, SEO & Settings
- **Questions & Answers collapsible panel** (below SEO & Settings, above Actions row)
  - Chevron icon toggle (expanded by default); question count Badge in header
  - "Add Question" primary button in header (visible when expanded)
  - Empty state: book icon + "No questions yet" message + "Add first question" outline button
  - Question table: sort order, type badge (SINGLE/MULTIPLE/FILL/DICTATION), prompt, option count, Edit/Del
  - Add/Edit via modal (same form as standalone Questions page but without Lesson selector)
  - Delete with confirmation modal
  - New-lesson mode: shows "Save the lesson first" placeholder instead of the table
- Status badge shown next to heading
- Title input auto-generates Slug (preserves manual edits)
- Actions row: Cancel (ghost) + Save draft (outline) + Publish (primary) OR Unpublish (amber outline if published)
- "Draft saved" confirmation text appears on Save draft

**Admin questions page:**
- Filter row: Lesson selector + Type selector
- Table: sort order, lesson title, type badge, prompt, option count, Actions (Edit | Del)
- Modal editor: Lesson selector, Type selector, Sort order, Prompt textarea
  - SINGLE_CHOICE/MULTIPLE_CHOICE: option list with radio/checkbox correct markers, add/remove option buttons
  - FILL_BLANK/DICTATION: single correct answer text input
  - Explanation textarea
- Delete confirmation modal

**Admin languages page:**
- Table: flag, name, slug (monospace), content meta, skill badges, active toggle, Edit button
- Active toggle is a visual switch (green = active)
- Modal: name (auto-fills slug), slug, content meta, active checkbox

**Admin users page:**
- Table: avatar, name, email, inline role SelectInput, premium toggle switch, status badge, lessons count, joined date, Activate/Deactivate button
- Search by name or email
- Role filter dropdown

**Admin media page:**
- Table: type icon, filename, MIME type, size, lesson link, uploaded date, Del button
- Upload placeholder button (no real upload)
- Filter by type (audio / application / image)

**Admin jobs page:**
- Table: job ID (monospace), type badge, status badge, idempotency key (monospace), created, updated, Cancel button (for PENDING/RUNNING)
- Status filter dropdown
- Trigger Job button → modal with type selector + JSON payload textarea

---

## What Should Not Be Changed Without Reason

- The Inter font and the CSS design token system in `tokens.css`
- The blue-500 primary color (#2563EB)
- The card border-radius and shadow system
- The sticky white header with Logo + nav + auth buttons
- The dark footer with multi-column link layout
- The breadcrumb navigation pattern
- The Free (green) / Premium (amber) / Level (blue) badge colors
- The quiz option button design (radio circle + color on submit)
- The QuizResult trophy card layout
- The admin sidebar structure and active state style

---

## What Can Be Improved Safely

- Mobile responsiveness (current prototype is desktop-first)
- Adding a mobile hamburger menu to the header
- Improving the lesson card with a thumbnail image slot
- Adding skeleton loaders for async content
- Improving the audio player with waveform visualization
- Adding a dark mode (using CSS variable overrides)
- Improving accessibility (ARIA labels, keyboard navigation, focus rings)
- Adding micro-animations to page transitions
