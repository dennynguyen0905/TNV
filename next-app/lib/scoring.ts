import type { QuestionType } from "@prisma/client";

/**
 * Pure, server-side quiz scoring helpers.
 *
 * These functions never read the database and never expose correct answers on
 * their own — they only compare a learner's answer against a known-correct
 * value. Callers (quizService) decide when it is safe to reveal correct answers
 * and explanations (i.e. only AFTER a submission has been scored).
 */

/** Normalize a free-text answer for forgiving comparison. */
export function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ") // collapse internal whitespace
    .replace(/[.,!?;:"']/g, ""); // ignore common punctuation
}

/** Single choice: exactly one option selected, and it is the correct one. */
export function scoreSingleChoice(
  selectedOptionIds: string[],
  correctOptionIds: string[]
): boolean {
  return (
    selectedOptionIds.length === 1 &&
    correctOptionIds.length === 1 &&
    correctOptionIds.includes(selectedOptionIds[0])
  );
}

/** Multiple choice: the selected set equals the correct set (order-independent). */
export function scoreMultipleChoice(
  selectedOptionIds: string[],
  correctOptionIds: string[]
): boolean {
  if (correctOptionIds.length === 0) return false;
  const selected = new Set(selectedOptionIds);
  const correct = new Set(correctOptionIds);
  if (selected.size !== correct.size) return false;
  for (const id of correct) {
    if (!selected.has(id)) return false;
  }
  return true;
}

/** Fill-in-the-blank: case-insensitive, whitespace/punctuation-tolerant match. */
export function scoreFillBlank(
  textAnswer: string | null | undefined,
  correctAnswer: string
): boolean {
  const normalized = normalizeText(textAnswer);
  if (normalized === "") return false;
  return normalized === normalizeText(correctAnswer);
}

/** Dictation (MVP): normalized exact match of the full sentence. */
export function scoreDictation(
  textAnswer: string | null | undefined,
  correctAnswer: string
): boolean {
  const normalized = normalizeText(textAnswer);
  if (normalized === "") return false;
  return normalized === normalizeText(correctAnswer);
}

export type GradableAnswer = {
  selectedOptionIds: string[];
  textAnswer?: string | null;
};

export type GradableQuestion = {
  type: QuestionType;
  correctOptionIds: string[];
  correctAnswer: string;
};

/** Dispatch to the right scorer for a single question. */
export function scoreQuestion(
  question: GradableQuestion,
  answer: GradableAnswer | undefined
): boolean {
  if (!answer) return false;
  switch (question.type) {
    case "SINGLE_CHOICE":
      return scoreSingleChoice(answer.selectedOptionIds, question.correctOptionIds);
    case "MULTIPLE_CHOICE":
      return scoreMultipleChoice(answer.selectedOptionIds, question.correctOptionIds);
    case "FILL_BLANK":
      return scoreFillBlank(answer.textAnswer, question.correctAnswer);
    case "DICTATION":
      return scoreDictation(answer.textAnswer, question.correctAnswer);
    default:
      return false;
  }
}

/** Compute percentage (0–100, rounded) and pass/fail at the 70% threshold. */
export const PASS_THRESHOLD = 70;

export function computePercentage(correctCount: number, total: number): number {
  return total > 0 ? Math.round((correctCount / total) * 100) : 0;
}

export function isPassing(percentage: number): boolean {
  return percentage >= PASS_THRESHOLD;
}
