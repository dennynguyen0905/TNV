import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkEnv } from "@/lib/env";
import { createLogger, describeError } from "@/lib/logger";

const log = createLogger("api/health");

// Always run fresh — a cached healthcheck is worthless.
export const dynamic = "force-dynamic";

/**
 * Lightweight liveness + readiness probe.
 *
 *  - 200 when the app is up AND the database answers `SELECT 1`.
 *  - 503 when the database is unreachable (so load balancers / uptime monitors
 *    can take the instance out of rotation).
 *
 * No secrets are exposed — only coarse status, latency, and env-check severity.
 */
export async function GET() {
  const startedAt = Date.now();

  let dbOk = false;
  let dbLatencyMs: number | null = null;
  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t0;
    dbOk = true;
  } catch (err) {
    log.error("database check failed", describeError(err));
  }

  // Surface env misconfiguration severity without leaking values.
  const env = checkEnv();

  const healthy = dbOk;
  const body = {
    status: healthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    checks: {
      database: { ok: dbOk, latencyMs: dbLatencyMs },
      env: {
        ok: env.ok,
        errors: env.issues.filter((i) => i.severity === "error").length,
        warnings: env.issues.filter((i) => i.severity === "warning").length,
      },
    },
    responseTimeMs: Date.now() - startedAt,
  };

  return NextResponse.json(body, { status: healthy ? 200 : 503 });
}
