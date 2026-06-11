import type { QuestionType } from "@prisma/client";
import * as questionRepo from "@/server/repositories/questionRepository";
import { toAdminQuestion, type AdminQuestion } from "@/server/mappers/questionMapper";

export type ValidatableQuestion = {
  type: QuestionType;
  prompt: string;
  answerText?: string;
  options: Array<{ text: string; isCorrect: boolean; sortOrder: number }>;
};

/**
 * Validate a lesson's questions against the per-type integrity rules.
 * Returns an admin-facing error message, or null when all questions are valid.
 *
 * Used before allowing a lesson to be PUBLISHED so a broken quiz can never go
 * live. Draft/review lessons may be saved with incomplete questions.
 */
export function validateQuestions(questions: ValidatableQuestion[]): string | null {
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const label = `Question ${i + 1}`;

    if (!q.prompt || q.prompt.trim() === "") {
      return `${label}: prompt is required.`;
    }

    const filledOptions = q.options.filter((o) => o.text.trim() !== "");
    const correctOptions = filledOptions.filter((o) => o.isCorrect);

    switch (q.type) {
      case "SINGLE_CHOICE":
        if (filledOptions.length < 2) {
          return `${label}: single choice needs at least 2 answer options.`;
        }
        if (correctOptions.length !== 1) {
          return `${label}: single choice must have exactly one correct answer.`;
        }
        break;

      case "MULTIPLE_CHOICE":
        if (filledOptions.length < 2) {
          return `${label}: multiple choice needs at least 2 answer options.`;
        }
        if (correctOptions.length < 1) {
          return `${label}: multiple choice must have at least one correct answer.`;
        }
        break;

      case "FILL_BLANK":
        if (!q.answerText || q.answerText.trim() === "") {
          return `${label}: fill-in-the-blank needs an accepted answer.`;
        }
        break;

      case "DICTATION":
        if (!q.answerText || q.answerText.trim() === "") {
          return `${label}: dictation needs the expected answer text.`;
        }
        break;

      default:
        return `${label}: unknown question type.`;
    }
  }
  return null;
}

/** Skills whose lessons require body content before they can be published. */
const CONTENT_REQUIRED_SKILLS = new Set(["Reading", "Grammar"]);

export function requiresContent(skillName: string): boolean {
  return CONTENT_REQUIRED_SKILLS.has(skillName);
}

export async function getAllQuestionsForAdmin(): Promise<AdminQuestion[]> {
  const questions = await questionRepo.getAllQuestionsForAdmin();
  return questions.map(toAdminQuestion);
}

/**
 * Delete a single question. Returns the deleted question's lesson + prompt so
 * the caller can record a meaningful audit entry. Throws if it does not exist.
 */
export async function deleteQuestion(
  id: string
): Promise<{ lessonId: string; lessonTitle: string; prompt: string }> {
  const question = await questionRepo.getQuestionById(id);
  if (!question) throw new Error("Question not found");
  await questionRepo.deleteQuestionById(id);
  return {
    lessonId: question.lesson.id,
    lessonTitle: question.lesson.title,
    prompt: question.prompt,
  };
}
