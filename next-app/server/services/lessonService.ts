import * as lessonRepo from "@/server/repositories/lessonRepository";
import { toPublicLessonCard } from "@/server/mappers/lessonMapper";
import { toPublicQuestion } from "@/server/mappers/questionMapper";

export async function getPublicLessonsForSkill(languageSlug: string, skillSlug: string) {
  const lessons = await lessonRepo.getPublishedLessons({ languageSlug, skillSlug });
  return lessons.map(toPublicLessonCard);
}

export async function getFeaturedFreePublicLessons(limit = 3) {
  const lessons = await lessonRepo.getPublishedLessons();
  return lessons
    .filter((l) => !l.isPremium)
    .slice(0, limit)
    .map(toPublicLessonCard);
}

export async function getPopularLessonsForLanguage(languageSlug: string, limit = 3) {
  const lessons = await lessonRepo.getPublishedLessons({ languageSlug });
  return lessons.slice(0, limit).map(toPublicLessonCard);
}

/**
 * Recommend published free lessons the learner has not completed yet.
 * Simple MVP heuristic: most recently published free lessons, excluding the
 * provided lesson ids (e.g. ones already completed).
 */
export async function getRecommendedLessons(excludeLessonIds: string[], limit = 4) {
  const lessons = await lessonRepo.getPublishedLessons();
  const exclude = new Set(excludeLessonIds);
  return lessons
    .filter((l) => !l.isPremium && !exclude.has(l.id))
    .slice(0, limit)
    .map(toPublicLessonCard);
}

export async function getLessonDetailForPublic(params: {
  languageSlug: string;
  skillSlug: string;
  lessonSlug: string;
}) {
  const lesson = await lessonRepo.getLessonForDetail(params);
  if (!lesson) return null;

  const publicQuestions = lesson.questions.map(toPublicQuestion);

  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    summary: lesson.summary ?? "",
    content: lesson.content ?? "",
    transcript: lesson.transcript ?? "",
    audioUrl: lesson.audioUrl ?? null,
    pdfUrl: lesson.pdfUrl ?? null,
    seoTitle: lesson.seoTitle ?? null,
    seoDescription: lesson.seoDescription ?? null,
    lang: lesson.language.name,
    langSlug: lesson.language.slug,
    skill: lesson.skill.name,
    skillSlug: lesson.skill.slug,
    level: lesson.level.code,
    free: !lesson.isPremium,
    questionCount: lesson.questions.length,
    estimatedMin: Math.max(5, lesson.questions.length * 2),
    questions: publicQuestions,
  };
}
