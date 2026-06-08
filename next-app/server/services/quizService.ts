import { prisma } from "@/lib/prisma";
import { AttemptStatus } from "@prisma/client";
import * as attemptRepo from "@/server/repositories/attemptRepository";

type QuizAnswer = {
  questionId: string;
  selectedOptionIds: string[];
  textAnswer?: string;
};

export type QuestionResult = {
  questionId: string;
  isCorrect: boolean;
  correctOptionIds: string[];
  correctAnswer: string;
  explanation: string;
};

export type QuizGradeResult = {
  score: number;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  passed: boolean;
  perQuestion: QuestionResult[];
};

export async function gradeAndPersist(
  lessonId: string,
  answers: QuizAnswer[],
  userId?: string | null
): Promise<QuizGradeResult> {
  const questions = await prisma.question.findMany({
    where: { lessonId },
    orderBy: { sortOrder: "asc" },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });

  const perQuestion: QuestionResult[] = questions.map((q) => {
    const userAnswer = answers.find((a) => a.questionId === q.id);
    const correctOptionIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
    const correctAnswer = q.answerText ?? "";

    let isCorrect = false;
    if (userAnswer) {
      if (q.type === "SINGLE_CHOICE") {
        isCorrect =
          userAnswer.selectedOptionIds.length === 1 &&
          correctOptionIds.includes(userAnswer.selectedOptionIds[0]);
      } else if (q.type === "MULTIPLE_CHOICE") {
        const selected = new Set(userAnswer.selectedOptionIds);
        const correct = new Set(correctOptionIds);
        isCorrect =
          selected.size === correct.size && [...selected].every((id) => correct.has(id));
      } else if (q.type === "FILL_BLANK" || q.type === "DICTATION") {
        isCorrect =
          (userAnswer.textAnswer?.trim().toLowerCase() ?? "") ===
          correctAnswer.trim().toLowerCase();
      }
    }

    return {
      questionId: q.id,
      isCorrect,
      correctOptionIds,
      correctAnswer,
      explanation: q.explanation ?? "",
    };
  });

  const correctCount = perQuestion.filter((r) => r.isCorrect).length;
  const total = questions.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = percentage >= 70;

  await attemptRepo.createAttempt({
    userId: userId ?? null,
    lessonId,
    score: correctCount,
    totalQuestions: total,
    correctCount,
    percentage,
    status: passed ? AttemptStatus.PASSED : AttemptStatus.FAILED,
    answers: perQuestion.map((r) => {
      const userAnswer = answers.find((a) => a.questionId === r.questionId);
      return {
        questionId: r.questionId,
        selectedOptionIds: userAnswer?.selectedOptionIds ?? [],
        textAnswer: userAnswer?.textAnswer,
        isCorrect: r.isCorrect,
      };
    }),
  });

  return { score: correctCount, totalQuestions: total, correctCount, percentage, passed, perQuestion };
}
