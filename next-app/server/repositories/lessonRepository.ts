import { prisma } from "@/lib/prisma";
import { LessonStatus } from "@prisma/client";

export async function getPublishedLessons(filter?: {
  languageSlug?: string;
  skillSlug?: string;
}) {
  return prisma.lesson.findMany({
    where: {
      status: LessonStatus.PUBLISHED,
      ...(filter?.languageSlug ? { language: { slug: filter.languageSlug } } : {}),
      ...(filter?.skillSlug ? { skill: { slug: filter.skillSlug } } : {}),
    },
    include: {
      language: true,
      skill: true,
      level: true,
      _count: { select: { questions: true } },
    },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getLessonForDetail(params: {
  languageSlug: string;
  skillSlug: string;
  lessonSlug: string;
}) {
  return prisma.lesson.findFirst({
    where: {
      slug: params.lessonSlug,
      language: { slug: params.languageSlug },
      skill: { slug: params.skillSlug },
      status: LessonStatus.PUBLISHED,
    },
    include: {
      language: true,
      skill: true,
      level: true,
      questions: {
        orderBy: { sortOrder: "asc" },
        include: { options: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}

export async function getAllLessonsForAdmin() {
  return prisma.lesson.findMany({
    include: {
      language: true,
      skill: true,
      level: true,
      _count: { select: { questions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getLessonByIdForAdmin(id: string) {
  return prisma.lesson.findUnique({
    where: { id },
    include: {
      language: true,
      skill: true,
      level: true,
      questions: {
        orderBy: { sortOrder: "asc" },
        include: { options: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
}

export async function createLesson(data: {
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  languageId: string;
  skillId: string;
  levelId: string;
  status: LessonStatus;
  isPremium: boolean;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: Date;
}) {
  return prisma.lesson.create({ data });
}

export async function updateLesson(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    summary: string;
    content: string;
    languageId: string;
    skillId: string;
    levelId: string;
    status: LessonStatus;
    isPremium: boolean;
    seoTitle: string;
    seoDescription: string;
    publishedAt: Date | null;
  }>
) {
  return prisma.lesson.update({ where: { id }, data });
}

export async function archiveLesson(id: string) {
  return prisma.lesson.update({
    where: { id },
    data: { status: LessonStatus.ARCHIVED },
  });
}

export async function countLessons() {
  return prisma.lesson.count();
}

export async function countPublishedLessons() {
  return prisma.lesson.count({ where: { status: LessonStatus.PUBLISHED } });
}
