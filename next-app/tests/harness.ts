/**
 * Tiny zero-dependency test harness.
 *
 * The project intentionally avoids adding a heavy test runner (Jest/Vitest) for
 * these focused Phase 5G service checks. Tests are plain async functions run via
 * `tsx`. Each test registers itself; `runRegistered()` executes them and sets
 * the process exit code so CI can gate on it.
 */

type TestFn = () => void | Promise<void>;

type Registered = { name: string; fn: TestFn; skip?: () => string | null };

const registry: Registered[] = [];

export function test(name: string, fn: TestFn, skip?: () => string | null): void {
  registry.push({ name, fn, skip });
}

export function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

export function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(
      `${message ?? "assertEqual failed"} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

export async function runRegistered(label: string): Promise<{ passed: number; failed: number; skipped: number }> {
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  console.log(`\n=== ${label} (${registry.length} tests) ===`);
  for (const { name, fn, skip } of registry) {
    const skipReason = skip?.();
    if (skipReason) {
      skipped++;
      console.log(`  ○ SKIP  ${name} — ${skipReason}`);
      continue;
    }
    try {
      await fn();
      passed++;
      console.log(`  ✓ PASS  ${name}`);
    } catch (err) {
      failed++;
      console.log(`  ✗ FAIL  ${name}`);
      console.log(`          ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`--- ${label}: ${passed} passed, ${failed} failed, ${skipped} skipped ---`);
  return { passed, failed, skipped };
}

export function clearRegistry(): void {
  registry.length = 0;
}
