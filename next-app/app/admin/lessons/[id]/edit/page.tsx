import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonForm } from "@/components/admin/LessonForm";
import { ADMIN_MOCK_LESSONS } from "@/data/mock/lessons";
import { getQuestionsByLessonId } from "@/data/mock/questions";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lesson = ADMIN_MOCK_LESSONS.find((l) => l.id === Number(id));
  return { title: lesson ? `Edit — ${lesson.title}` : "Edit Lesson" };
}

export default async function AdminEditLessonPage({ params }: Props) {
  const { id } = await params;
  const lesson = ADMIN_MOCK_LESSONS.find((l) => l.id === Number(id));
  if (!lesson) notFound();

  const questions = getQuestionsByLessonId(lesson.id);

  return <LessonForm lesson={lesson} initialQuestions={questions} />;
}
