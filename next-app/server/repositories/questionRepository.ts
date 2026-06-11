import { prisma } from "@/lib/prisma";
import { QuestionType } from "@prisma/client";

export async function getQuestionsByLessonId(lessonId: string) {
  return prisma.question.findMany({
    where: { lessonId },
    orderBy: { sortOrder: "asc" },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function getAllQuestionsForAdmin() {
  return prisma.question.findMany({
    orderBy: [{ lesson: { title: "asc" } }, { sortOrder: "asc" }],
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      lesson: { select: { id: true, title: true } },
      _count: { select: { attemptAnswers: true } },
    },
  });
}

export async function getQuestionById(id: string) {
  return prisma.question.findUnique({
    where: { id },
    include: { lesson: { select: { id: true, title: true } } },
  });
}

/**
 * Delete a single question. Answered questions cascade-delete their
 * AttemptAnswer rows (schema onDelete: Cascade), so this is safe even after
 * learners have submitted attempts.
 */
export async function deleteQuestionById(id: string) {
  return prisma.question.delete({ where: { id } });
}

export async function upsertLessonQuestions(
  lessonId: string,
  questions: Array<{
    id?: string;
    type: QuestionType;
    prompt: string;
    answerText?: string;
    explanation?: string;
    sortOrder: number;
    options: Array<{
      text: string;
      isCorrect: boolean;
      sortOrder: number;
    }>;
  }>
) {
  const incomingIds = questions.filter((q) => q.id).map((q) => q.id as string);

  await prisma.question.deleteMany({
    where: {
      lessonId,
      ...(incomingIds.length > 0 ? { NOT: { id: { in: incomingIds } } } : {}),
    },
  });

  for (const q of questions) {
    if (q.id) {
      await prisma.question.update({
        where: { id: q.id },
        data: {
          type: q.type,
          prompt: q.prompt,
          answerText: q.answerText ?? null,
          explanation: q.explanation ?? null,
          sortOrder: q.sortOrder,
        },
      });
      await prisma.questionOption.deleteMany({ where: { questionId: q.id } });
      if (q.options.length > 0) {
        await prisma.questionOption.createMany({
          data: q.options.map((opt) => ({
            questionId: q.id as string,
            text: opt.text,
            isCorrect: opt.isCorrect,
            sortOrder: opt.sortOrder,
          })),
        });
      }
    } else {
      await prisma.question.create({
        data: {
          lessonId,
          type: q.type,
          prompt: q.prompt,
          answerText: q.answerText ?? null,
          explanation: q.explanation ?? null,
          sortOrder: q.sortOrder,
          options: {
            create: q.options.map((opt) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              sortOrder: opt.sortOrder,
            })),
          },
        },
      });
    }
  }
}
