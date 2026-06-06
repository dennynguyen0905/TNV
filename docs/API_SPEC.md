# docs/API_SPEC.md — LangPath Target API Specification

## Conventions

- All endpoints return JSON
- All POST/PATCH bodies must be `Content-Type: application/json`
- Validation uses Zod on the server
- Error responses: `{ error: string, code?: string }`
- Auth uses HTTP-only session cookie
- Admin endpoints check `role === ADMIN` server-side

---

## Public APIs (no auth required)

### GET /api/languages

Returns all active languages.

**Response:**
```json
[
  {
    "id": "uuid",
    "slug": "english",
    "name": "English",
    "flagCode": "gb",
    "skills": ["Reading", "Listening", "Dictation", "Grammar", "Vocabulary"]
  }
]
```

---

### GET /api/languages/:slug

Returns a single language with available skills and lesson counts.

**Params:** `slug` — e.g., `english`

**Response:**
```json
{
  "id": "uuid",
  "slug": "english",
  "name": "English",
  "flagCode": "gb",
  "skills": [
    { "slug": "reading", "name": "Reading", "icon": "book", "lessonCount": 368 }
  ]
}
```

**Errors:**
- 404: Language not found

---

### GET /api/skills

Returns all supported skills.

**Response:**
```json
[
  { "id": "uuid", "slug": "reading", "name": "Reading", "icon": "book" }
]
```

---

### GET /api/lessons

Returns published lessons with optional filters.

**Query params:**
- `languageSlug` (required) — filter by language
- `skillSlug` (optional) — filter by skill
- `level` (optional) — A1, A2, B1, B2, C1, C2
- `isPremium` (optional) — `true` | `false`
- `page` (optional) — default 1
- `limit` (optional) — default 20, max 50

**Business rules:**
- Only `PUBLISHED` lessons are returned
- `isCorrect` is NOT included in any answer option

**Response:**
```json
{
  "lessons": [
    {
      "id": "uuid",
      "slug": "my-first-day-at-school",
      "title": "My First Day at School",
      "summary": "...",
      "language": { "slug": "english", "name": "English" },
      "skill": { "slug": "reading", "name": "Reading" },
      "level": "A1",
      "isPremium": false,
      "estimatedMinutes": 8,
      "hasPdf": true,
      "questionCount": 5
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### GET /api/lessons/:id

Returns a single published lesson with content and questions (without correct answers).

**Business rules:**
- Returns 404 if lesson is not PUBLISHED
- `isCorrect` is NOT included in answer options
- Premium lessons return content only if `User.isPremium` is true (or user is ADMIN)
  — otherwise, return lesson metadata only with `{ isPremium: true, locked: true }`

**Response:**
```json
{
  "id": "uuid",
  "slug": "my-first-day-at-school",
  "title": "My First Day at School",
  "summary": "...",
  "language": { "slug": "english", "name": "English" },
  "skill": { "slug": "reading", "name": "Reading" },
  "level": "A1",
  "isPremium": false,
  "estimatedMinutes": 8,
  "seoTitle": "My First Day at School — English Reading A1 | LangPath",
  "seoDesc": "...",
  "content": [
    { "type": "TEXT", "body": "Today is my first day at school..." }
  ],
  "vocabulary": [
    { "word": "nervous", "meaning": "...", "example": "..." }
  ],
  "questions": [
    {
      "id": "uuid",
      "type": "SINGLE_CHOICE",
      "prompt": "Where is the student going today?",
      "options": [
        { "id": "uuid-a", "text": "To the park", "order": 0 },
        { "id": "uuid-b", "text": "To school", "order": 1 }
      ]
    }
  ]
}
```

**Errors:**
- 404: Lesson not found or not published
- 403: Premium lesson locked for non-premium user

---

### POST /api/attempts

Submit a quiz attempt. Requires authentication.

**Auth:** Required (any role)

**Request body:**
```json
{
  "lessonId": "uuid",
  "answers": [
    { "questionId": "uuid", "selectedOptionId": "uuid" },
    { "questionId": "uuid", "textAnswer": "The cat is on the mat." }
  ]
}
```

**Validation:**
- `lessonId` must be a valid published lesson
- `answers` must cover all questions in the lesson
- `selectedOptionId` required for SINGLE_CHOICE / MULTIPLE_CHOICE
- `textAnswer` required for FILL_BLANK / DICTATION

**Response:**
```json
{
  "attemptId": "uuid",
  "score": 0.8,
  "passed": true,
  "correct": 4,
  "total": 5,
  "answers": [
    {
      "questionId": "uuid",
      "isCorrect": true,
      "correctOptionId": "uuid-b",
      "explanation": "The text says the student goes to school."
    }
  ]
}
```

**Errors:**
- 401: Not authenticated
- 404: Lesson not found
- 422: Validation error

---

## Auth APIs

### POST /api/auth/register

**Request body:**
```json
{
  "name": "Minh Nguyen",
  "email": "minh@example.com",
  "password": "securepassword123"
}
```

**Validation (Zod):**
- `name`: required, min 1 char
- `email`: valid email format
- `password`: min 8 chars

**Response:**
```json
{ "user": { "id": "uuid", "email": "...", "name": "...", "role": "LEARNER", "isPremium": false } }
```

Sets HTTP-only session cookie.

**Errors:**
- 409: Email already registered
- 422: Validation error

---

### POST /api/auth/login

**Request body:**
```json
{ "email": "minh@example.com", "password": "securepassword123" }
```

**Response:**
```json
{ "user": { "id": "uuid", "email": "...", "name": "...", "role": "LEARNER", "isPremium": false } }
```

Sets HTTP-only session cookie.

**Errors:**
- 401: Invalid credentials
- 422: Validation error

---

### POST /api/auth/logout

Clears the session cookie.

**Response:**
```json
{ "ok": true }
```

---

### GET /api/me

Returns the current authenticated user.

**Auth:** Required

**Response:**
```json
{ "id": "uuid", "email": "...", "name": "...", "role": "LEARNER", "isPremium": false }
```

**Errors:**
- 401: Not authenticated

---

## Admin APIs (ADMIN role required)

All admin endpoints check `role === ADMIN` server-side. Return 403 if not admin.

---

### GET /api/admin/lessons

Returns all lessons (all statuses) with pagination and filters.

**Query params:**
- `status` — DRAFT | REVIEW | PUBLISHED | ARCHIVED
- `languageSlug` — filter by language
- `skillSlug` — filter by skill
- `page`, `limit`

**Response:**
```json
{
  "lessons": [
    {
      "id": "uuid",
      "title": "...",
      "language": { "slug": "english", "name": "English" },
      "skill": { "slug": "reading", "name": "Reading" },
      "level": "A1",
      "status": "PUBLISHED",
      "isPremium": false,
      "updatedAt": "2026-06-01T00:00:00Z"
    }
  ],
  "total": 50
}
```

---

### POST /api/admin/lessons

Create a new lesson.

**Request body:**
```json
{
  "languageSlug": "english",
  "skillSlug": "reading",
  "levelCode": "A1",
  "title": "My First Day at School",
  "slug": "my-first-day-at-school",
  "summary": "...",
  "seoTitle": "...",
  "seoDesc": "...",
  "isPremium": false,
  "estimatedMinutes": 8,
  "content": [{ "type": "TEXT", "body": "..." }]
}
```

**Response:** Created lesson object (201)

**Errors:**
- 409: Slug already exists for this language+skill
- 422: Validation error

---

### PATCH /api/admin/lessons/:id

Update a lesson. Accepts partial updates.

**Request body:** Any subset of lesson fields

**Response:** Updated lesson object

---

### DELETE /api/admin/lessons/:id

Delete a lesson. Soft-deletes by setting status to ARCHIVED.

**Response:** `{ ok: true }`

---

### POST /api/admin/lessons/:id/publish

Publish a lesson. Sets status to PUBLISHED, records publishedAt, triggers placeholder worker jobs.

**Response:**
```json
{
  "lesson": { "id": "uuid", "status": "PUBLISHED", "publishedAt": "..." },
  "jobs": [
    { "id": "uuid", "type": "INDEX_SEARCH", "status": "PENDING" },
    { "id": "uuid", "type": "REVALIDATE_CACHE", "status": "PENDING" },
    { "id": "uuid", "type": "GENERATE_PDF", "status": "PENDING" }
  ]
}
```

---

### GET /api/admin/users

Returns paginated user list.

**Response:**
```json
{
  "users": [
    { "id": "uuid", "email": "...", "name": "...", "role": "LEARNER", "isPremium": false, "createdAt": "..." }
  ],
  "total": 100
}
```

---

### PATCH /api/admin/users/:id

Update user role or premium status.

**Request body:**
```json
{ "role": "ADMIN" }
{ "isPremium": true }
```

**Response:** Updated user object (without passwordHash)

---

### GET /api/admin/jobs

Returns all worker jobs with optional status filter.

**Query params:** `status`, `type`, `page`, `limit`

**Response:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "type": "INDEX_SEARCH",
      "status": "PENDING",
      "idempotencyKey": "index-lesson-uuid",
      "createdAt": "..."
    }
  ],
  "total": 23
}
```

---

### POST /api/admin/jobs

Trigger a placeholder worker job.

**Request body:**
```json
{ "type": "REVALIDATE_CACHE", "payload": { "lessonId": "uuid" } }
```

**Response:** Created job object (201)

**Business rules:**
- Generates `idempotencyKey` from `type + lessonId`
- Returns 200 (not 201) if identical idempotent job already exists
