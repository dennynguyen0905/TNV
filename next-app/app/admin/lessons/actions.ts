"use server";

import { revalidatePath } from "next/cache";
import { LessonStatus, QuestionType } from "@prisma/client";
import { lessonCreateSchema, lessonUpdateSchema } from "@/lib/validators";
import * as adminLessonService from "@/server/services/adminLessonService";
import * as lessonRepo from "@/server/repositories/lessonRepository";
import { enqueueLessonPublishJobs } from "@/server/services/adminJobService";
import { validateQuestions, requiresContent } from "@/server/services/adminQuestionService";
import { getCurrentUser } from "@/lib/auth";

type ActionResult = { ok: true; lessonId?: string } | { ok: false; error: string };

type QuestionPayload = {
  id?: string;
  type: string;
  prompt: string;
  answerText?: string;
  explanation?: string;
  sortOrder: number;
  options: Array<{ text: string; isCorrect: boolean; sortOrder: number }>;
};

function castQuestions(
  questions: QuestionPayload[]
): Parameters<typeof adminLessonService.saveLesson>[0]["questions"] {
  return questions.map((q) => ({
    ...q,
    type: q.type as QuestionType,
  }));
}

async function assertAdmin(): Promise<ActionResult | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { ok: false, error: "Unauthorized" };
  return null;
}

export async function createLessonAction(formData: {
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  lang: string;
  skill: string;
  level: string;
  status: string;
  isPremium: boolean;
  seoTitle?: string;
  seoDescription?: string;
  questions: QuestionPayload[];
}): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const parsed = lessonCreateSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    const lessonId = await adminLessonService.saveLesson({
      ...parsed.data,
      status: parsed.data.status as LessonStatus,
      questions: castQuestions(parsed.data.questions),
    });
    revalidatePath("/admin/lessons");
    revalidatePath("/");
    return { ok: true, lessonId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create lesson" };
  }
}

export async function updateLessonAction(formData: {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  lang: string;
  skill: string;
  level: string;
  status: string;
  isPremium: boolean;
  seoTitle?: string;
  seoDescription?: string;
  questions: QuestionPayload[];
}): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const parsed = lessonUpdateSchema.safeParse(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    await adminLessonService.saveLesson({
      ...parsed.data,
      status: parsed.data.status as LessonStatus,
      questions: castQuestions(parsed.data.questions),
    });
    revalidatePath("/admin/lessons");
    revalidatePath(`/admin/lessons/${parsed.data.id}/edit`);
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update lesson" };
  }
}

export async function archiveLessonAction(id: string): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  try {
    await lessonRepo.archiveLesson(id);
    revalidatePath("/admin/lessons");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to archive lesson" };
  }
}

export async function publishLessonAction(id: string): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  try {
    const lesson = await lessonRepo.getLessonByIdForAdmin(id);
    if (!lesson) return { ok: false, error: "Lesson not found" };
    if (!lesson.slug) return { ok: false, error: "Lesson must have a slug before publishing" };

    // Same publish gate as the editor: content-complete + valid quiz.
    if (requiresContent(lesson.skill.name) && (!lesson.content || lesson.content.trim() === "")) {
      return { ok: false, error: `${lesson.skill.name} lessons require content before publishing.` };
    }
    const questionError = validateQuestions(
      lesson.questions.map((q) => ({
        type: q.type,
        prompt: q.prompt,
        answerText: q.answerText ?? undefined,
        options: q.options.map((o) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          sortOrder: o.sortOrder,
        })),
      }))
    );
    if (questionError) return { ok: false, error: `Cannot publish: ${questionError}` };

    await lessonRepo.updateLesson(id, {
      status: LessonStatus.PUBLISHED,
      publishedAt: lesson.publishedAt ?? new Date(),
    });
    await enqueueLessonPublishJobs(id, lesson.slug);

    revalidatePath("/admin/lessons");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to publish lesson" };
  }
}

export async function unpublishLessonAction(id: string): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  try {
    const lesson = await lessonRepo.getLessonByIdForAdmin(id);
    if (!lesson) return { ok: false, error: "Lesson not found" };
    await lessonRepo.updateLesson(id, { status: LessonStatus.DRAFT });
    revalidatePath("/admin/lessons");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to unpublish lesson" };
  }
}

export async function toggleLessonPremiumAction(
  id: string,
  isPremium: boolean
): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  try {
    await lessonRepo.updateLesson(id, { isPremium });
    revalidatePath("/admin/lessons");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update lesson" };
  }
}
