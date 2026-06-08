import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLessonForEdit } from "@/server/services/adminLessonService";
import { LessonForm } from "@/components/admin/LessonForm";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getLessonForEdit(id);
  return { title: data ? `Edit — ${data.adminLesson.title}` : "Edit Lesson" };
}

export default async function AdminEditLessonPage({ params }: Props) {
  const { id } = await params;
  const data = await getLessonForEdit(id);
  if (!data) notFound();

  return (
    <LessonForm
      lesson={data.adminLesson}
      initialQuestions={data.questions}
      initialContent={data.content}
    />
  );
}
