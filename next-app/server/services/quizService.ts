import { prisma } from "@/lib/prisma";
import { AttemptStatus, LessonStatus } from "@prisma/client";
import type { User } from "@prisma/client";
import * as attemptRepo from "@/server/repositories/attemptRepository";
import * as lessonRepo from "@/server/repositories/lessonRepository";
import * as progressService from "@/server/services/progressService";
import { canAccessLesson } from "@/lib/permissions";
import {
  scoreQuestion,
  computePercentage,
  isPassing,
  type GradableAnswer,
} from "@/lib/scoring";

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
  /** True when the attempt + progress were persisted (i.e. the user is logged in). */
  saved: boolean;
  perQuestion: QuestionResult[];
};

/** Error with a code the API route can map to an HTTP status. */
export class QuizError extends Error {
  constructor(message: string, public code: "NOT_FOUND" | "FORBIDDEN") {
    super(message);
    this.name = "QuizError";
  }
}

export async function gradeAndPersist(
  lessonId: string,
  answers: QuizAnswer[],
  user: User | null
): Promise<QuizGradeResult> {
  // 1. Lesson must exist and be published — never score draft/archived content.
  const lesson = await lessonRepo.getLessonAccessInfo(lessonId);
  if (!lesson || lesson.status !== LessonStatus.PUBLISHED) {
    throw new QuizError("Lesson not found", "NOT_FOUND");
  }

  // 2. Premium gate — answers are never scored for users who cannot access it.
  if (!canAccessLesson(user, lesson)) {
    throw new QuizError("This lesson requires premium access", "FORBIDDEN");
  }

  // 3. Load the answer key on the SERVER only.
  const questions = await prisma.question.findMany({
    where: { lessonId },
    orderBy: { sortOrder: "asc" },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });

  const perQuestion: QuestionResult[] = questions.map((q) => {
    const userAnswer = answers.find((a) => a.questionId === q.id);
    const correctOptionIds = q.options.filter((o) => o.isCorrect).map((o) => o.id);
    const correctAnswer = q.answerText ?? "";

    const gradable: GradableAnswer | undefined = userAnswer
      ? { selectedOptionIds: userAnswer.selectedOptionIds, textAnswer: userAnswer.textAnswer }
      : undefined;

    const isCorrect = scoreQuestion(
      { type: q.type, correctOptionIds, correctAnswer },
      gradable
    );

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
  const percentage = computePercentage(correctCount, total);
  const passed = isPassing(percentage);

  // 4. Persist only for logged-in users. Anonymous users get their score back
  //    but no attempt/progress is written.
  let saved = false;
  if (user) {
    await attemptRepo.createAttempt({
      userId: user.id,
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

    await progressService.updateProgress(user.id, lessonId, percentage);
    saved = true;
  }

  return {
    score: correctCount,
    totalQuestions: total,
    correctCount,
    percentage,
    passed,
    saved,
    perQuestion,
  };
}
