import { prisma } from "@/lib/prisma";
import { LessonStatus, QuestionType } from "@prisma/client";
import * as lessonRepo from "@/server/repositories/lessonRepository";
import * as questionRepo from "@/server/repositories/questionRepository";
import { toAdminLesson } from "@/server/mappers/lessonMapper";
import { toEditableQuestion } from "@/server/mappers/questionMapper";

export async function getAllLessonsForAdminList() {
  const lessons = await lessonRepo.getAllLessonsForAdmin();
  return lessons.map(toAdminLesson);
}

export async function getLessonForEdit(id: string) {
  const lesson = await lessonRepo.getLessonByIdForAdmin(id);
  if (!lesson) return null;
  return {
    adminLesson: toAdminLesson(lesson),
    content: lesson.content ?? "",
    transcript: lesson.transcript ?? "",
    audioUrl: lesson.audioUrl ?? "",
    pdfUrl: lesson.pdfUrl ?? "",
    questions: lesson.questions.map(toEditableQuestion),
  };
}

export async function saveLesson(input: {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  lang: string;
  skill: string;
  level: string;
  status: LessonStatus;
  isPremium: boolean;
  seoTitle?: string;
  seoDescription?: string;
  questions: Array<{
    id?: string;
    type: QuestionType;
    prompt: string;
    answerText?: string;
    explanation?: string;
    sortOrder: number;
    options: Array<{ text: string; isCorrect: boolean; sortOrder: number }>;
  }>;
}): Promise<string> {
  const [language, skill, level] = await Promise.all([
    prisma.language.findFirst({ where: { name: input.lang } }),
    prisma.skill.findFirst({ where: { name: input.skill } }),
    prisma.level.findFirst({ where: { code: input.level } }),
  ]);

  if (!language) throw new Error(`Language not found: ${input.lang}`);
  if (!skill) throw new Error(`Skill not found: ${input.skill}`);
  if (!level) throw new Error(`Level not found: ${input.level}`);

  const publishedAt =
    input.status === LessonStatus.PUBLISHED
      ? await getExistingPublishedAt(input.id) ?? new Date()
      : undefined;

  let lessonId: string;

  if (input.id) {
    await lessonRepo.updateLesson(input.id, {
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      content: input.content,
      languageId: language.id,
      skillId: skill.id,
      levelId: level.id,
      status: input.status,
      isPremium: input.isPremium,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      publishedAt: publishedAt ?? null,
    });
    lessonId = input.id;
  } else {
    const created = await lessonRepo.createLesson({
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      content: input.content,
      languageId: language.id,
      skillId: skill.id,
      levelId: level.id,
      status: input.status,
      isPremium: input.isPremium,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      publishedAt,
    });
    lessonId = created.id;
  }

  await questionRepo.upsertLessonQuestions(lessonId, input.questions);
  return lessonId;
}

async function getExistingPublishedAt(id?: string): Promise<Date | null> {
  if (!id) return null;
  const lesson = await prisma.lesson.findUnique({ where: { id }, select: { publishedAt: true } });
  return lesson?.publishedAt ?? null;
}
