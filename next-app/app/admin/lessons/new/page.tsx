import type { Metadata } from "next";
import { LessonForm } from "@/components/admin/LessonForm";

export const metadata: Metadata = { title: "Admin — New Lesson" };

export default function AdminNewLessonPage() {
  return <LessonForm />;
}
