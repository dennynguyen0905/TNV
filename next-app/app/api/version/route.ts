import { NextResponse } from "next/server";
import pkg from "../../../package.json";

/**
 * Build / release metadata. Safe to expose publicly: version and a short commit
 * SHA only. Useful for confirming which build is live after a deploy or rollback.
 *
 * Commit SHA is read from common CI env vars (Vercel sets VERCEL_GIT_COMMIT_SHA);
 * a generic BUILD_SHA override is supported for Docker/VPS builds.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const commitSha =
    process.env.BUILD_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA ?? null;

  return NextResponse.json({
    name: pkg.name,
    version: pkg.version,
    commit: commitSha ? commitSha.slice(0, 12) : null,
    environment: process.env.NODE_ENV ?? "unknown",
    buildTime: process.env.BUILD_TIME ?? null,
  });
}
