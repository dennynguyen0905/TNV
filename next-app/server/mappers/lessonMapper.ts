import type { Lesson, Language, Skill, Level } from "@prisma/client";
import type { AdminLesson, LessonStatus, SkillName, CefrLevel } from "@/data/types";
import { LESSON_STATUSES } from "@/data/constants/lesson-statuses";

type PrismaLessonFull = Lesson & {
  language: Language;
  skill: Skill;
  level: Level;
  _count?: { questions: number };
};

export function toAdminLesson(lesson: PrismaLessonFull): AdminLesson {
  const status = (LESSON_STATUSES[lesson.status] ?? "Draft") as LessonStatus;
  return {
    id: lesson.id,
    title: lesson.title,
    slug: lesson.slug,
    summary: lesson.summary ?? "",
    lang: lesson.language.name,
    skill: lesson.skill.name as SkillName,
    level: lesson.level.code as CefrLevel,
    status,
    premium: lesson.isPremium,
    seoTitle: lesson.seoTitle ?? "",
    seoDesc: lesson.seoDescription ?? "",
    updated: lesson.updatedAt.toISOString().split("T")[0],
  };
}

export type PublicLessonCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  lang: string;
  langSlug: string;
  skill: string;
  skillSlug: string;
  level: string;
  free: boolean;
  questionCount: number;
  hasPdf: boolean;
  estimatedMin: number;
};

export function toPublicLessonCard(lesson: PrismaLessonFull): PublicLessonCard {
  const questionCount = lesson._count?.questions ?? 0;
  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    summary: lesson.summary ?? "",
    lang: lesson.language.name,
    langSlug: lesson.language.slug,
    skill: lesson.skill.name,
    skillSlug: lesson.skill.slug,
    level: lesson.level.code,
    free: !lesson.isPremium,
    questionCount,
    hasPdf: lesson.pdfUrl !== null,
    estimatedMin: Math.max(5, questionCount * 2),
  };
}
