import { prisma } from "@/lib/prisma";
import { AttemptStatus } from "@prisma/client";

export async function createAttempt(data: {
  userId?: string | null;
  lessonId: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  status: AttemptStatus;
  answers: Array<{
    questionId: string;
    selectedOptionIds: string[];
    textAnswer?: string;
    isCorrect: boolean;
  }>;
}) {
  return prisma.attempt.create({
    data: {
      userId: data.userId ?? null,
      lessonId: data.lessonId,
      score: data.score,
      totalQuestions: data.totalQuestions,
      correctCount: data.correctCount,
      percentage: data.percentage,
      status: data.status,
      answers: {
        create: data.answers.map((a) => ({
          questionId: a.questionId,
          selectedOptionIds: a.selectedOptionIds,
          textAnswer: a.textAnswer ?? null,
          isCorrect: a.isCorrect,
        })),
      },
    },
  });
}
