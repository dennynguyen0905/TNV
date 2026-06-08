import type { Metadata } from "next";
import { getAllLessonsForAdminList } from "@/server/services/adminLessonService";
import { LessonsClient } from "./LessonsClient";

export const metadata: Metadata = { title: "Admin — Lessons" };
export const dynamic = "force-dynamic";

export default async function AdminLessonsPage() {
  const lessons = await getAllLessonsForAdminList();
  return <LessonsClient initialLessons={lessons} />;
}
