import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAllMediaForAdmin } from "@/server/services/adminMediaService";
import { getAllLessonsForAdminList } from "@/server/services/adminLessonService";
import { MediaClient } from "./MediaClient";

export const metadata: Metadata = { title: "Admin — Media" };
export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireAdmin();
  const [media, lessons] = await Promise.all([
    getAllMediaForAdmin(),
    getAllLessonsForAdminList(),
  ]);
  return (
    <MediaClient
      initialMedia={media}
      lessons={lessons.map((l) => ({ id: l.id, title: l.title }))}
    />
  );
}
