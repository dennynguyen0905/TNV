# docs/DEPLOYMENT_NOTES.md — LangPath Deployment Notes

## Current Deployment

- **Platform:** Vercel (static site)
- **Deployed URL:** https://thang-nv.vercel.app/
- **Entry point:** `LangPath.html`
- **Build step:** None — Vercel serves the static HTML file directly
- **Branch:** main

The current prototype is a single HTML file that loads React and all JSX files via CDN Babel Standalone. Vercel treats it as a static site.

---

## How to Run Locally

The file must be served over HTTP — `file://` URLs do not work because:
- Babel Standalone requires HTTP for cross-origin script loading
- `<script src="...jsx">` tags are blocked by browser CORS for `file://`

```bash
# Option 1 — npx serve (recommended)
npx serve .
# Open http://localhost:3000/LangPath.html

# Option 2 — Python HTTP server
python -m http.server 8080
# Open http://localhost:8080/LangPath.html

# Option 3 — VS Code Live Server
# Right-click LangPath.html → Open with Live Server
```

---

## How to Build Locally (Current)

No build step. Serve the directory and open LangPath.html in a browser.

After verifying changes locally, push to main. Vercel auto-deploys on push.

---

## Phase 2.5 Changes (Hash Routing)

`app.jsx` now reads the initial route from `window.location.hash` on mount. Simple routes (admin, dashboard, login/register) persist on page refresh via the URL hash. Parameterized routes (lesson, language, skill-list) still fall back to home on refresh — these will be fixed when migrating to Next.js dynamic routes.

No new script tags were added in Phase 2.5. The hash routing is self-contained in `app.jsx`.

See `docs/MIGRATION_MAP.md` for the full migration contract.

---

## New Data File Loading (Phase 1)

`LangPath.html` now loads data files as plain `<script>` tags **before** the Babel JSX files:

```html
<!-- Constants (plain JS, no JSX needed) -->
<script src="data/constants/languages.js"></script>
<script src="data/constants/skills.js"></script>
<script src="data/constants/levels.js"></script>
<script src="data/constants/lesson-statuses.js"></script>
<script src="data/constants/roles.js"></script>
<script src="data/constants/job-types.js"></script>
<script src="data/constants/job-statuses.js"></script>

<!-- Mock data -->
<script src="data/mock/lessons.js"></script>
<script src="data/mock/questions.js"></script>
<script src="data/mock/vocabulary.js"></script>
<script src="data/mock/users.js"></script>
<script src="data/mock/worker-jobs.js"></script>
<script src="data/mock/media-assets.js"></script>
```

All constants and mock data are exposed as `window.X` globals (e.g. `window.LANGUAGES_DATA`).
They are also organized under `window.LangPathConstants` and `window.LangPathData` namespaces.

This load order is required — JSX components reference the globals by name at runtime.

---

## Environment Variables (Current)

None required for the current prototype — all data is served from static JS files.

---

## Environment Variables (After Backend Migration)

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/langpath

# Session
SESSION_SECRET=32-char-random-secret

# App
NEXT_PUBLIC_SITE_URL=https://thang-nv.vercel.app

# Optional — after storage integration
STORAGE_BUCKET=langpath-assets
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
```

Set these in:
- Local: `.env` file (gitignored — never commit)
- Production: Vercel Dashboard → Project → Settings → Environment Variables

---

## Vercel Deployment (Current)

1. Push to `main` branch
2. Vercel auto-detects no framework (or override to "Other")
3. Vercel serves all files statically
4. Entry point is `LangPath.html` (accessed at `/LangPath.html` or configured as root)

---

## Phase 3 — Next.js App Local Setup

The Next.js scaffold lives in `next-app/`. It runs separately from the static prototype.

```bash
cd next-app
npm install
npm run dev
# open http://localhost:3000
```

Build check:
```bash
cd next-app
npm run build       # should pass cleanly
npm run typecheck   # 0 TS errors
npm run lint
```

See `docs/NEXT_MIGRATION_LOG.md` for what has been scaffolded and what remains.

---

## Vercel Deployment (After Next.js Migration is Complete)

1. Move the root of the Vercel project to `next-app/` (or restructure)
2. Push to `main` branch
3. Vercel auto-detects Next.js — no additional config needed
4. Set environment variables in Vercel dashboard
5. Vercel runs `npm run build` automatically
6. Serverless functions handle API routes
7. Static pages are served from Vercel's edge CDN

**Vercel project settings to verify after migration:**
- Framework Preset: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`
- Root Directory: `/` (or wherever the Next.js app lives)
- Node.js version: 20.x

---

## Known Deployment Risks (Current Prototype)

1. **Babel Standalone is slow** — JSX transpilation happens in the browser at runtime. First load is slow on cold cache. This is acceptable for a prototype but must be removed before production.

2. **No error boundary** — Any JavaScript error in any JSX file silently breaks the entire app. There is no error catching.

3. **Global `window` namespace** — All components are exported to `window`. Naming collisions would cause silent bugs.

4. **Script load order** — The `<script>` tags in `LangPath.html` must be in dependency order. Moving or reordering them breaks the app.

5. **No cache-busting** — Browser caches JSX files. After editing a JSX file, users may need a hard refresh to see changes.

---

## Migration Risks (Moving to Next.js)

1. **Routing change** — Current custom state-based router (`navigate('page', params)`) must be replaced with Next.js `useRouter` / `Link` / `redirect`. All internal navigation calls must be updated.

2. **CSS migration** — Current styles use CSS custom properties from `tokens.css`. Tailwind CSS uses utility classes. Either keep the CSS variables as a Tailwind theme extension, or migrate all inline styles to Tailwind utilities. Risk of visual regression.

3. **TweaksPanel removal** — The prototype has a live layout/card/density switcher. When migrating to Next.js, choose defaults (e.g., `layout=classic`, `cardStyle=elevated`, `density=comfortable`) and remove the TweaksPanel. The UI must look correct at those defaults.

4. **Babel Standalone JSX features** — Standard Next.js uses TypeScript + tsx transform, not Babel Standalone. Verify there are no Babel-specific syntax patterns that need adjustment.

5. **`Object.assign(window, {...})` pattern** — Must be removed entirely. Replace with proper ES module imports.

6. **Static deployment to Next.js SSR** — Vercel will switch from static file serving to serverless function execution. Verify all API routes work in the Vercel serverless environment.

---

## Notes for PostgreSQL / Prisma Deployment

1. Use **Vercel Postgres** (built-in) or **Supabase** / **Railway** for the database.
2. Set `DATABASE_URL` in Vercel environment variables — never in code.
3. Use connection pooling (e.g., PgBouncer via Supabase, or Vercel's built-in pooling) because Vercel serverless functions open and close connections per request.
4. Run `npx prisma migrate deploy` (not `migrate dev`) in production.
5. Run seed script only once against the production database: `npx prisma db seed`.
6. Add `prisma generate` as a postinstall script so Prisma Client is always up to date after `npm install`.

```json
// package.json
{
  "scripts": {
    "postinstall": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts"
  }
}
```

---

## Notes for Future Storage Integration

Storage (audio files, PDFs, images) is not yet implemented. When adding:

1. Implement `lib/storage/` abstraction interface first (see `docs/ARCHITECTURE.md`).
2. For MVP: store files in Vercel's public directory or use Vercel Blob.
3. For production: migrate to AWS S3 or Cloudflare R2 by replacing only the storage provider.
4. Never store binary files in the PostgreSQL database.

---

## Notes for Future Search Integration

Full-text search is not yet implemented. When adding:

1. Start with Prisma `contains` queries (ILIKE) for MVP.
2. When performance requires it, add a dedicated search provider (Typesense, Algolia, Meilisearch).
3. Use the `INDEX_SEARCH` worker job to trigger re-indexing on lesson publish.
4. The search abstraction in `lib/search/` allows swapping providers without changing API routes.

---

## Checklist Before Deploying to Production

- [ ] `DATABASE_URL` set in Vercel environment variables
- [ ] `SESSION_SECRET` set (32+ char random string)
- [ ] `NEXT_PUBLIC_SITE_URL` set to production URL
- [ ] `npm run build` passes locally
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Seed data loaded (original content only)
- [ ] `/admin` and `/api` excluded from robots.txt
- [ ] No `.env` file committed to git
- [ ] No hardcoded secrets in source code
