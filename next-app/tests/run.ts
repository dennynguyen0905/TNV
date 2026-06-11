/**
 * Runs every Phase 5G test suite (unit + integration) and exits non-zero on any
 * failure. Integration tests self-skip when no database is reachable.
 *
 * Run via: npm test
 */
import "./loadEnv";
import { prisma } from "@/lib/prisma";

async function probeDb(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    // integration suite detects this itself and skips
  }
}

async function main() {
  await probeDb();

  // Importing the suites registers their tests into the shared registry.
  await import("./unit");
  await import("./integration");

  const { runRegistered } = await import("./harness");
  const result = await runRegistered("All Phase 5G tests");

  await prisma.$disconnect().catch(() => {});

  console.log(
    `\nTOTAL: ${result.passed} passed, ${result.failed} failed, ${result.skipped} skipped`
  );
  if (result.failed > 0) process.exit(1);
}

main();
