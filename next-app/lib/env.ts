/**
 * Environment variable documentation + safe validation (Phase 5H).
 *
 * This module does NOT crash the app on import. Next.js evaluates modules during
 * `next build` (where DATABASE_URL may legitimately be absent) and on Vercel's
 * edge, so a throw-on-import here would break deploys. Instead it exposes a pure
 * `checkEnv()` that the healthcheck and release tooling can call to surface
 * misconfiguration, plus `assertProductionEnv()` for callers that genuinely want
 * to fail fast (e.g. a custom server entrypoint).
 *
 * Keep this list in sync with `.env.example`.
 */

export type EnvSeverity = "error" | "warning";

export interface EnvIssue {
  variable: string;
  severity: EnvSeverity;
  message: string;
}

const PLACEHOLDER_AUTH_SECRET = "replace-with-a-secure-random-secret";

/**
 * Inspect the current process environment and report problems. Pure and
 * side-effect free — safe to call from a route handler.
 *
 * `errors` block a healthy production deployment; `warnings` are advisory.
 */
export function checkEnv(): { ok: boolean; issues: EnvIssue[] } {
  const issues: EnvIssue[] = [];
  const isProd = process.env.NODE_ENV === "production";

  // DATABASE_URL — required for the app to do anything useful.
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.trim() === "") {
    issues.push({
      variable: "DATABASE_URL",
      severity: "error",
      message: "DATABASE_URL is not set. The app cannot reach PostgreSQL.",
    });
  } else if (!/^postgres(ql)?:\/\//.test(databaseUrl)) {
    issues.push({
      variable: "DATABASE_URL",
      severity: "warning",
      message: "DATABASE_URL does not look like a postgresql:// connection string.",
    });
  }

  // Public site origin — needed for correct canonical / sitemap URLs in prod.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (isProd) {
    if (!siteUrl) {
      issues.push({
        variable: "NEXT_PUBLIC_SITE_URL",
        severity: "warning",
        message:
          "No public site URL set; SEO canonical/sitemap URLs will fall back to http://localhost:3000.",
      });
    } else if (/localhost|127\.0\.0\.1/.test(siteUrl)) {
      issues.push({
        variable: "NEXT_PUBLIC_SITE_URL",
        severity: "warning",
        message: "Public site URL still points at localhost in production.",
      });
    }
  }

  // AUTH_SECRET — currently advisory: session tokens use crypto.randomBytes, so
  // this is reserved for future signing. Warn if left at the placeholder in prod.
  if (isProd) {
    const authSecret = process.env.AUTH_SECRET;
    if (!authSecret || authSecret === PLACEHOLDER_AUTH_SECRET) {
      issues.push({
        variable: "AUTH_SECRET",
        severity: "warning",
        message: "AUTH_SECRET is unset or still the example placeholder. Set a unique random value.",
      });
    }
  }

  // Payment must stay disabled until a real provider is integrated.
  if (process.env.PAYMENT_ENABLED === "true") {
    issues.push({
      variable: "PAYMENT_ENABLED",
      severity: "warning",
      message: "PAYMENT_ENABLED=true but no payment provider is wired. Keep it false until Phase 6.",
    });
  }

  const ok = issues.every((i) => i.severity !== "error");
  return { ok, issues };
}

/**
 * Throw if any `error`-severity issue is present. Intended for explicit boot-time
 * checks (scripts / custom servers), NOT for import-time evaluation.
 */
export function assertProductionEnv(): void {
  const { ok, issues } = checkEnv();
  if (!ok) {
    const errors = issues.filter((i) => i.severity === "error");
    throw new Error(
      `Invalid environment configuration:\n${errors
        .map((e) => `  - ${e.variable}: ${e.message}`)
        .join("\n")}`
    );
  }
}
