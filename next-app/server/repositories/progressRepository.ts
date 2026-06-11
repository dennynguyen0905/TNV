import { prisma } from "@/lib/prisma";
import { ProgressStatus } from "@prisma/client";

export async function getProgressForUser(userId: string) {
  return prisma.progress.findMany({
    where: { userId },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          slug: true,
          language: { select: { name: true, slug: true } },
          skill: { select: { name: true, slug: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function upsertProgress(data: {
  userId: string;
  lessonId: string;
  percentage: number;
  passed: boolean;
}) {
  const status: ProgressStatus = data.passed ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS;

  const existing = await prisma.progress.findUnique({
    where: { userId_lessonId: { userId: data.userId, lessonId: data.lessonId } },
  });

  if (!existing) {
    return prisma.progress.create({
      data: {
        userId: data.userId,
        lessonId: data.lessonId,
        status,
        bestPercentage: data.percentage,
        lastPercentage: data.percentage,
        completedAt: data.passed ? new Date() : null,
      },
    });
  }

  const best = Math.max(existing.bestPercentage, data.percentage);
  // Once COMPLETED, stay COMPLETED even if a later attempt scores lower.
  const newStatus: ProgressStatus =
    best >= 70 ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS;

  return prisma.progress.update({
    where: { userId_lessonId: { userId: data.userId, lessonId: data.lessonId } },
    data: {
      status: newStatus,
      bestPercentage: best,
      lastPercentage: data.percentage,
      completedAt:
        newStatus === ProgressStatus.COMPLETED && !existing.completedAt
          ? new Date()
          : existing.completedAt,
    },
  });
}
