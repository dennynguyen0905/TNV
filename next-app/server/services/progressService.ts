import * as progressRepo from "@/server/repositories/progressRepository";

export async function updateProgress(userId: string, lessonId: string, percentage: number) {
  return progressRepo.upsertProgress({
    userId,
    lessonId,
    percentage,
    passed: percentage >= 70,
  });
}
