# docs/DATA_MODEL.md — LangPath Target Data Model

## Overview

Core learning hierarchy:

```
Language → Skill → Level → Lesson → LessonContent
                                  → Question → AnswerOption
                                  → MediaAsset

User → Attempt → AttemptAnswer
User → Progress
     → WorkerJob
     → Session
```

---

## Entity Definitions

### User

**Purpose:** Represents a learner or admin account.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| email | String | Unique, indexed |
| name | String | Display name |
| passwordHash | String | bcrypt hash — never expose |
| role | Enum | LEARNER \| ADMIN |
| isPremium | Boolean | Default: false — admin toggles manually for MVP |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Business rules:**
- Passwords must be hashed with bcrypt before storage
- Never return `passwordHash` in API responses
- `isPremium` is toggled by admin manually — no payment flow in MVP
- Only one role per user in MVP

**Relations:** has many Session, Attempt, Progress

---

### Session

**Purpose:** Tracks authenticated user sessions via HTTP-only cookies.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key = session token stored in cookie |
| userId | UUID | FK → User |
| expiresAt | DateTime | |
| createdAt | DateTime | |

**Business rules:**
- Session token is stored as an HTTP-only cookie
- Session ID is random and unpredictable (UUID or CSPRNG token)
- Expired sessions are rejected
- Logout deletes the session record

**Relations:** belongs to User

---

### Language

**Purpose:** A natural language available for learning (English, German, French, Spanish, etc.)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| slug | String | Unique, URL-safe: `english`, `german` |
| name | String | Display name: `English`, `German` |
| flagCode | String | Country code for flag display: `gb`, `de` |
| isActive | Boolean | Default: true |
| sortOrder | Int | For display ordering |

**Business rules:**
- Slug must be lowercase and URL-safe
- Only active languages appear on the public site

**Relations:** has many Lesson (via Skill/Level structure), has many LanguageSkill

---

### Skill

**Purpose:** A learning skill type.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| slug | String | Unique: `reading`, `listening`, `dictation`, `grammar`, `vocabulary` |
| name | String | Display name: `Reading`, `Listening`, etc. |
| icon | String | Icon name for UI: `book`, `headphones`, etc. |
| colorBg | String | CSS variable or hex for skill card background |
| colorAccent | String | CSS variable or hex for skill card accent |
| sortOrder | Int | |

**Supported skills:** Reading, Listening, Dictation, Grammar, Vocabulary

---

### Level

**Purpose:** A CEFR proficiency level.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| code | String | Unique: A1, A2, B1, B2, C1, C2 |
| label | String | Display: `Beginner`, `Elementary`, etc. |
| sortOrder | Int | 1-6 for ordering |

---

### Lesson

**Purpose:** A single learning unit combining content, questions, and metadata.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| languageId | UUID | FK → Language |
| skillId | UUID | FK → Skill |
| levelId | UUID | FK → Level |
| title | String | Display title |
| slug | String | Unique within language+skill, URL-safe |
| summary | String | Short description for lesson cards |
| status | Enum | DRAFT \| REVIEW \| PUBLISHED \| ARCHIVED |
| isPremium | Boolean | Default: false |
| seoTitle | String | Nullable — for `<title>` tag |
| seoDesc | String | Nullable — for `<meta description>` |
| estimatedMinutes | Int | Reading time estimate |
| hasPdf | Boolean | Whether PDF is available |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| publishedAt | DateTime | Nullable — set when status → PUBLISHED |

**Indexes:**
- `(languageId, skillId, status)` — for public lesson queries
- `(languageId, skillId, levelId, status)` — for filtered level queries
- `(slug)` — unique per language+skill combination

**Business rules:**
- Only `PUBLISHED` lessons appear on the public site
- `DRAFT`, `REVIEW`, `ARCHIVED` are admin-only
- `publishedAt` is set when transitioning to PUBLISHED
- Transitioning to PUBLISHED triggers placeholder worker jobs

**Relations:** belongs to Language, Skill, Level; has many LessonContent, Question, MediaAsset; has many Attempt, Progress

---

### LessonContent

**Purpose:** The main body content of a lesson (text, transcript, etc.)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| lessonId | UUID | FK → Lesson |
| type | Enum | TEXT \| TRANSCRIPT \| VOCABULARY_LIST |
| body | Text | Markdown or plain text |
| sortOrder | Int | For ordering multiple content blocks |

**Business rules:**
- Reading lessons have `type = TEXT`
- Listening lessons have `type = TRANSCRIPT` (hidden until user reveals it)
- Vocabulary lessons have `type = VOCABULARY_LIST` (structured as JSON in body)

---

### Question

**Purpose:** A comprehension or practice question for a lesson quiz.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| lessonId | UUID | FK → Lesson |
| type | Enum | SINGLE_CHOICE \| MULTIPLE_CHOICE \| FILL_BLANK \| DICTATION |
| prompt | String | The question text |
| explanation | String | Nullable — shown after submission |
| order | Int | Display order |

**Question types:**
- `SINGLE_CHOICE` — one correct answer from options
- `MULTIPLE_CHOICE` — multiple correct answers from options
- `FILL_BLANK` — typed answer, normalized comparison
- `DICTATION` — typed sentence, compared to audio transcript

**Relations:** belongs to Lesson; has many AnswerOption, AttemptAnswer

---

### AnswerOption

**Purpose:** A possible answer for a SINGLE_CHOICE or MULTIPLE_CHOICE question.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| questionId | UUID | FK → Question |
| text | String | Option display text |
| isCorrect | Boolean | Whether this option is the correct answer |
| order | Int | Display order |

**Business rules:**
- `isCorrect` must NEVER be sent to the client before quiz submission
- API lesson detail endpoint must exclude `isCorrect` from the response
- Only returned in the attempt response after submission

---

### Attempt

**Purpose:** Records a learner's quiz submission for a lesson.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| userId | UUID | FK → User |
| lessonId | UUID | FK → Lesson |
| score | Float | 0.0 to 1.0 (percentage as decimal) |
| passed | Boolean | score >= 0.70 |
| totalQuestions | Int | Snapshot of question count at submission time |
| correctAnswers | Int | |
| startedAt | DateTime | |
| completedAt | DateTime | |

**Business rules:**
- Each submission creates a new Attempt (history is preserved)
- Progress.bestScore is updated if this attempt's score > current best
- Progress.completed is set to true if passed = true

**Relations:** belongs to User, Lesson; has many AttemptAnswer

---

### AttemptAnswer

**Purpose:** Records the learner's specific answer for each question in an attempt.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| attemptId | UUID | FK → Attempt |
| questionId | UUID | FK → Question |
| selectedOptionId | UUID | Nullable — for SINGLE_CHOICE / MULTIPLE_CHOICE |
| textAnswer | String | Nullable — for FILL_BLANK / DICTATION |
| isCorrect | Boolean | Computed at submission time |

---

### Progress

**Purpose:** Tracks a learner's best score and completion state per lesson.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| userId | UUID | FK → User |
| lessonId | UUID | FK → Lesson |
| bestScore | Float | 0.0 to 1.0 |
| completed | Boolean | True if any attempt had passed = true |
| attemptCount | Int | Total attempts |
| lastAttemptAt | DateTime | |

**Indexes:**
- `(userId, lessonId)` — unique, for fast per-lesson progress lookup
- `(userId)` — for dashboard progress queries

**Business rules:**
- One Progress record per user per lesson
- `bestScore` updated if new attempt score > current bestScore
- `completed` never goes back to false once set to true

---

### MediaAsset

**Purpose:** Tracks audio, image, or PDF files associated with a lesson.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| lessonId | UUID | FK → Lesson |
| type | Enum | AUDIO \| IMAGE \| PDF |
| url | String | Storage URL (local path or cloud URL) |
| filename | String | Original filename |
| mimeType | String | |
| sizeBytes | Int | |
| uploadedAt | DateTime | |

---

### WorkerJob

**Purpose:** Tracks background jobs triggered by admin actions (publish, audio processing, etc.)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| type | Enum | GENERATE_PDF \| PROCESS_AUDIO \| INDEX_SEARCH \| REVALIDATE_CACHE |
| status | Enum | PENDING \| RUNNING \| COMPLETED \| FAILED \| CANCELLED |
| idempotencyKey | String | Unique — prevents duplicate jobs |
| payload | JSON | Job-specific input data |
| result | JSON | Nullable — job output or error details |
| createdAt | DateTime | |
| startedAt | DateTime | Nullable |
| completedAt | DateTime | Nullable |

**Indexes:**
- `(idempotencyKey)` — unique, for deduplication
- `(status)` — for admin job list queries
- `(type, status)` — for filtering

**Business rules:**
- Jobs are placeholder in MVP — no real processing
- `idempotencyKey` must be set to prevent duplicate jobs on retry
- Admin can view all jobs and trigger placeholder jobs manually

---

## Prisma Schema (Target)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  name         String
  passwordHash String
  role         UserRole  @default(LEARNER)
  isPremium    Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  sessions     Session[]
  attempts     Attempt[]
  progress     Progress[]
}

enum UserRole {
  LEARNER
  ADMIN
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Language {
  id        String   @id @default(uuid())
  slug      String   @unique
  name      String
  flagCode  String
  isActive  Boolean  @default(true)
  sortOrder Int      @default(0)
  lessons   Lesson[]
}

model Skill {
  id          String   @id @default(uuid())
  slug        String   @unique
  name        String
  icon        String
  colorBg     String
  colorAccent String
  sortOrder   Int      @default(0)
  lessons     Lesson[]
}

model Level {
  id        String   @id @default(uuid())
  code      String   @unique
  label     String
  sortOrder Int
  lessons   Lesson[]
}

model Lesson {
  id               String        @id @default(uuid())
  languageId       String
  skillId          String
  levelId          String
  title            String
  slug             String
  summary          String
  status           LessonStatus  @default(DRAFT)
  isPremium        Boolean       @default(false)
  seoTitle         String?
  seoDesc          String?
  estimatedMinutes Int           @default(5)
  hasPdf           Boolean       @default(false)
  publishedAt      DateTime?
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  language         Language      @relation(fields: [languageId], references: [id])
  skill            Skill         @relation(fields: [skillId], references: [id])
  level            Level         @relation(fields: [levelId], references: [id])
  content          LessonContent[]
  questions        Question[]
  mediaAssets      MediaAsset[]
  attempts         Attempt[]
  progress         Progress[]

  @@unique([languageId, skillId, slug])
  @@index([languageId, skillId, status])
  @@index([languageId, skillId, levelId, status])
}

enum LessonStatus {
  DRAFT
  REVIEW
  PUBLISHED
  ARCHIVED
}

model LessonContent {
  id        String      @id @default(uuid())
  lessonId  String
  lesson    Lesson      @relation(fields: [lessonId], references: [id])
  type      ContentType
  body      String
  sortOrder Int         @default(0)
}

enum ContentType {
  TEXT
  TRANSCRIPT
  VOCABULARY_LIST
}

model Question {
  id          String         @id @default(uuid())
  lessonId    String
  lesson      Lesson         @relation(fields: [lessonId], references: [id])
  type        QuestionType
  prompt      String
  explanation String?
  order       Int            @default(0)
  options     AnswerOption[]
  answers     AttemptAnswer[]
}

enum QuestionType {
  SINGLE_CHOICE
  MULTIPLE_CHOICE
  FILL_BLANK
  DICTATION
}

model AnswerOption {
  id         String          @id @default(uuid())
  questionId String
  question   Question        @relation(fields: [questionId], references: [id])
  text       String
  isCorrect  Boolean
  order      Int             @default(0)
  answers    AttemptAnswer[]
}

model Attempt {
  id             String          @id @default(uuid())
  userId         String
  lessonId       String
  score          Float
  passed         Boolean
  totalQuestions Int
  correctAnswers Int
  startedAt      DateTime        @default(now())
  completedAt    DateTime?
  user           User            @relation(fields: [userId], references: [id])
  lesson         Lesson          @relation(fields: [lessonId], references: [id])
  answers        AttemptAnswer[]
}

model AttemptAnswer {
  id               String        @id @default(uuid())
  attemptId        String
  questionId       String
  selectedOptionId String?
  textAnswer       String?
  isCorrect        Boolean
  attempt          Attempt       @relation(fields: [attemptId], references: [id])
  question         Question      @relation(fields: [questionId], references: [id])
  selectedOption   AnswerOption? @relation(fields: [selectedOptionId], references: [id])
}

model Progress {
  id            String   @id @default(uuid())
  userId        String
  lessonId      String
  bestScore     Float    @default(0)
  completed     Boolean  @default(false)
  attemptCount  Int      @default(0)
  lastAttemptAt DateTime?
  user          User     @relation(fields: [userId], references: [id])
  lesson        Lesson   @relation(fields: [lessonId], references: [id])

  @@unique([userId, lessonId])
  @@index([userId])
}

model MediaAsset {
  id         String    @id @default(uuid())
  lessonId   String
  lesson     Lesson    @relation(fields: [lessonId], references: [id])
  type       AssetType
  url        String
  filename   String
  mimeType   String
  sizeBytes  Int
  uploadedAt DateTime  @default(now())
}

enum AssetType {
  AUDIO
  IMAGE
  PDF
}

model WorkerJob {
  id             String    @id @default(uuid())
  type           JobType
  status         JobStatus @default(PENDING)
  idempotencyKey String    @unique
  payload        Json
  result         Json?
  createdAt      DateTime  @default(now())
  startedAt      DateTime?
  completedAt    DateTime?

  @@index([status])
  @@index([type, status])
}

enum JobType {
  GENERATE_PDF
  PROCESS_AUDIO
  INDEX_SEARCH
  REVALIDATE_CACHE
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}
```
