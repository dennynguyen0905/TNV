/**
 * Minimal .env loader for test scripts.
 *
 * Next.js loads `.env` automatically, but `tsx` does not. Tests import this for
 * its side effect so DATABASE_URL (and friends) are available without adding a
 * dotenv dependency. Existing process.env values are never overwritten.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(file: string): void {
  let raw: string;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    return; // file is optional
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Load next-app/.env relative to this file (tests/ → ..).
loadEnvFile(resolve(__dirname, "..", ".env"));
