/**
 * Phase 5G unit tests — pure service logic, no database required.
 *
 *  - publish gate validation (content + quiz integrity)
 *  - invalid quiz blocks publish
 *  - premium lesson access rules
 *
 * Run via: npm run test:unit
 */
import "./loadEnv";
import { test, assert, assertEqual, runRegistered } from "./harness";
import { validateQuestions, requiresContent } from "../server/services/adminQuestionService";
import { canAccessLesson } from "../lib/permissions";
import { rateLimit, __resetRateLimitStore } from "../lib/rateLimit";
import { checkEnv } from "../lib/env";
import type { QuestionType } from "@prisma/client";

function opt(text: string, isCorrect: boolean, sortOrder: number) {
  return { text, isCorrect, sortOrder };
}

// ─── Publish gate: question validation ───────────────────────────────────────

test("publish gate: a valid single-choice question passes", () => {
  const error = validateQuestions([
    {
      type: "SINGLE_CHOICE" as QuestionType,
      prompt: "Pick one",
      options: [opt("a", true, 0), opt("b", false, 1)],
    },
  ]);
  assertEqual(error, null, "expected no validation error");
});

test("invalid quiz blocks publish: single choice with two correct answers", () => {
  const error = validateQuestions([
    {
      type: "SINGLE_CHOICE" as QuestionType,
      prompt: "Pick one",
      options: [opt("a", true, 0), opt("b", true, 1)],
    },
  ]);
  assert(error !== null, "expected a validation error");
  assert(/exactly one correct/i.test(error ?? ""), `unexpected message: ${error}`);
});

test("invalid quiz blocks publish: single choice with fewer than 2 options", () => {
  const error = validateQuestions([
    {
      type: "SINGLE_CHOICE" as QuestionType,
      prompt: "Pick one",
      options: [opt("a", true, 0)],
    },
  ]);
  assert(error !== null, "expected a validation error");
  assert(/at least 2/i.test(error ?? ""), `unexpected message: ${error}`);
});

test("invalid quiz blocks publish: multiple choice needs at least one correct", () => {
  const error = validateQuestions([
    {
      type: "MULTIPLE_CHOICE" as QuestionType,
      prompt: "Pick some",
      options: [opt("a", false, 0), opt("b", false, 1)],
    },
  ]);
  assert(error !== null, "expected a validation error");
  assert(/at least one correct/i.test(error ?? ""), `unexpected message: ${error}`);
});

test("invalid quiz blocks publish: fill-blank needs an accepted answer", () => {
  const error = validateQuestions([
    { type: "FILL_BLANK" as QuestionType, prompt: "___ is blue", options: [] },
  ]);
  assert(error !== null, "expected a validation error");
  assert(/accepted answer/i.test(error ?? ""), `unexpected message: ${error}`);
});

test("invalid quiz blocks publish: dictation needs expected text", () => {
  const error = validateQuestions([
    { type: "DICTATION" as QuestionType, prompt: "Write what you hear", options: [] },
  ]);
  assert(error !== null, "expected a validation error");
});

test("invalid quiz blocks publish: empty prompt is rejected", () => {
  const error = validateQuestions([
    {
      type: "SINGLE_CHOICE" as QuestionType,
      prompt: "   ",
      options: [opt("a", true, 0), opt("b", false, 1)],
    },
  ]);
  assert(error !== null, "expected a validation error");
  assert(/prompt is required/i.test(error ?? ""), `unexpected message: ${error}`);
});

test("publish gate: a valid fill-blank with answerText passes", () => {
  const error = validateQuestions([
    { type: "FILL_BLANK" as QuestionType, prompt: "___ is blue", answerText: "sky", options: [] },
  ]);
  assertEqual(error, null, "expected no validation error");
});

// ─── Publish gate: content requirement by skill ──────────────────────────────

test("publish gate: Reading and Grammar require body content", () => {
  assertEqual(requiresContent("Reading"), true);
  assertEqual(requiresContent("Grammar"), true);
});

test("publish gate: Listening/Dictation/Vocabulary do not require body content", () => {
  assertEqual(requiresContent("Listening"), false);
  assertEqual(requiresContent("Dictation"), false);
  assertEqual(requiresContent("Vocabulary"), false);
});

// ─── Premium access rules ────────────────────────────────────────────────────

test("premium access: free lessons are open to anonymous visitors", () => {
  assertEqual(canAccessLesson(null, { isPremium: false }), true);
});

test("premium access: anonymous user is blocked from a premium lesson", () => {
  assertEqual(canAccessLesson(null, { isPremium: true }), false);
});

test("premium access: non-premium learner is blocked from a premium lesson", () => {
  assertEqual(canAccessLesson({ role: "LEARNER", isPremium: false }, { isPremium: true }), false);
});

test("premium access: premium learner can access a premium lesson", () => {
  assertEqual(canAccessLesson({ role: "LEARNER", isPremium: true }, { isPremium: true }), true);
});

test("premium access: admin can access a premium lesson regardless of flag", () => {
  assertEqual(canAccessLesson({ role: "ADMIN", isPremium: false }, { isPremium: true }), true);
});

// ─── Rate limiter (Phase 5H) ─────────────────────────────────────────────────

test("rate limit: allows requests up to the limit then blocks", () => {
  __resetRateLimitStore();
  const opts = { limit: 3, windowMs: 60_000 };
  assertEqual(rateLimit("k", opts).allowed, true, "1st allowed");
  assertEqual(rateLimit("k", opts).allowed, true, "2nd allowed");
  assertEqual(rateLimit("k", opts).allowed, true, "3rd allowed");
  const fourth = rateLimit("k", opts);
  assertEqual(fourth.allowed, false, "4th blocked");
  assert(fourth.retryAfterSeconds > 0, "blocked result reports retryAfter");
});

test("rate limit: separate keys have independent windows", () => {
  __resetRateLimitStore();
  const opts = { limit: 1, windowMs: 60_000 };
  assertEqual(rateLimit("a", opts).allowed, true, "key a first");
  assertEqual(rateLimit("a", opts).allowed, false, "key a blocked");
  assertEqual(rateLimit("b", opts).allowed, true, "key b independent");
});

test("rate limit: window resets after it expires", () => {
  __resetRateLimitStore();
  const opts = { limit: 1, windowMs: 1 };
  assertEqual(rateLimit("k", opts).allowed, true, "first allowed");
  const past = Date.now() + 5;
  const realNow = Date.now;
  Date.now = () => past; // fast-forward past the 1ms window
  try {
    assertEqual(rateLimit("k", opts).allowed, true, "allowed after reset");
  } finally {
    Date.now = realNow;
  }
});

// ─── Env validation (Phase 5H) ───────────────────────────────────────────────

test("env check: flags a missing DATABASE_URL as an error", () => {
  const original = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const { ok, issues } = checkEnv();
    assertEqual(ok, false, "expected not ok without DATABASE_URL");
    assert(
      issues.some((i) => i.variable === "DATABASE_URL" && i.severity === "error"),
      "expected a DATABASE_URL error issue"
    );
  } finally {
    if (original !== undefined) process.env.DATABASE_URL = original;
  }
});

test("env check: passes with a valid postgres DATABASE_URL", () => {
  const original = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "postgresql://u:p@localhost:5432/db";
  try {
    assertEqual(checkEnv().ok, true, "expected ok with valid DATABASE_URL");
  } finally {
    if (original !== undefined) process.env.DATABASE_URL = original;
    else delete process.env.DATABASE_URL;
  }
});

if (process.argv[1] && process.argv[1].includes("unit")) {
  runRegistered("Unit tests").then((r) => {
    if (r.failed > 0) process.exit(1);
  });
}
