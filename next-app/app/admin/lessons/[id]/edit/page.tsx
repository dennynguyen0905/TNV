import type { Metadata } from "next";
import { ADMIN_MOCK_LESSONS } from "@/data/mock/lessons";

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

  if (!lesson) {
    return (
      <div className="max-w-2xl">
        <p className="text-n-500">Lesson #{id} not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-n-900 mb-1">Edit Lesson</h1>
      <p className="text-sm text-n-500 mb-6">{lesson.title}</p>
      <div className="bg-white rounded-card shadow-card p-6 text-center text-n-400">
        <p className="text-sm">Lesson edit form — migration in progress.</p>
        <p className="text-xs mt-1">Reference: AdminLessonForm in admin-pages.jsx</p>
        <dl className="mt-4 text-left text-xs space-y-1 text-n-600">
          <div><dt className="inline font-medium">ID:</dt> <dd className="inline">{lesson.id}</dd></div>
          <div><dt className="inline font-medium">Slug:</dt> <dd className="inline">{lesson.slug}</dd></div>
          <div><dt className="inline font-medium">Status:</dt> <dd className="inline">{lesson.status}</dd></div>
        </dl>
      </div>
    </div>
  );
}
