/**
 * Lightweight post-deploy smoke test (Phase 5I).
 *
 * Verifies that a running deployment serves its core public surfaces before a
 * release is approved. Zero dependencies — uses the global `fetch` shipped with
 * Node 20 and `tsx` (already a dev dependency). Nothing here mutates data.
 *
 * Usage:
 *   SMOKE_BASE_URL=http://localhost:3000 npm run smoke
 *   SMOKE_BASE_URL=https://staging.example.com npm run smoke
 *
 * Base URL resolution (first non-empty wins):
 *   SMOKE_BASE_URL → NEXT_PUBLIC_SITE_URL → NEXT_PUBLIC_APP_URL → http://localhost:3000
 *
 * Optional admin-login check (skipped unless BOTH are provided):
 *   SMOKE_ADMIN_EMAIL=admin@example.com SMOKE_ADMIN_PASSWORD='Password123!' npm run smoke
 *
 * Exit code is non-zero if any required check fails, so CI / release tooling can
 * gate on it. No credentials are required for the default run.
 */
import "../tests/loadEnv";

const BASE_URL = (
  process.env.SMOKE_BASE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 10_000);

type Check = {
  name: string;
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
  /** HTTP statuses that count as a pass. Defaults to [200]. */
  expectStatus?: number[];
  /** Optional substring(s) the response body must contain (any one matches). */
  contains?: string[];
};

type Result = { name: string; ok: boolean; detail: string };

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function runCheck(check: Check): Promise<Result> {
  const url = `${BASE_URL}${check.path}`;
  const expect = check.expectStatus ?? [200];
  try {
    const res = await fetchWithTimeout(url, {
      method: check.method ?? "GET",
      headers: check.body ? { "content-type": "application/json" } : undefined,
      body: check.body ? JSON.stringify(check.body) : undefined,
    });
    const text = await res.text();

    if (!expect.includes(res.status)) {
      return {
        name: check.name,
        ok: false,
        detail: `${check.path} → ${res.status} (expected ${expect.join("/")})`,
      };
    }
    if (check.contains && !check.contains.some((s) => text.includes(s))) {
      return {
        name: check.name,
        ok: false,
        detail: `${check.path} → ${res.status} but body missing expected content (${check.contains.join(" | ")})`,
      };
    }
    return { name: check.name, ok: true, detail: `${check.path} → ${res.status}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { name: check.name, ok: false, detail: `${check.path} → request failed: ${msg}` };
  }
}

const checks: Check[] = [
  {
    name: "health endpoint",
    path: "/api/health",
    // 503 = DB unreachable. Reported as a FAILURE (only 200 passes) so a degraded
    // deploy never silently passes the smoke gate.
    expectStatus: [200],
    contains: ['"status"'],
  },
  { name: "version endpoint", path: "/api/version", contains: ['"version"'] },
  { name: "robots.txt", path: "/robots.txt", contains: ["User-Agent", "Sitemap"] },
  { name: "sitemap.xml", path: "/sitemap.xml", contains: ["<urlset", "<url>"] },
  { name: "public home page", path: "/", contains: ["<html", "LangPath"] },
];

async function main() {
  console.log(`\n=== Smoke test against ${BASE_URL} ===`);

  const results: Result[] = [];
  for (const check of checks) {
    results.push(await runCheck(check));
  }

  // Optional, opt-in admin login check. Never required; only runs when creds are
  // explicitly provided via env. Does not persist or mutate anything.
  const adminEmail = process.env.SMOKE_ADMIN_EMAIL;
  const adminPassword = process.env.SMOKE_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    results.push(
      await runCheck({
        name: "admin login (opt-in)",
        path: "/api/auth/login",
        method: "POST",
        body: { email: adminEmail, password: adminPassword },
        contains: ['"ok":true', '"ok": true'],
      })
    );
  } else {
    console.log("  ○ SKIP  admin login — set SMOKE_ADMIN_EMAIL + SMOKE_ADMIN_PASSWORD to enable");
  }

  let failed = 0;
  for (const r of results) {
    if (r.ok) {
      console.log(`  ✓ PASS  ${r.name}  (${r.detail})`);
    } else {
      failed++;
      console.log(`  ✗ FAIL  ${r.name}  (${r.detail})`);
    }
  }

  const passed = results.length - failed;
  console.log(`\nSMOKE: ${passed} passed, ${failed} failed (${BASE_URL})`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("smoke test crashed:", err);
  process.exit(1);
});
