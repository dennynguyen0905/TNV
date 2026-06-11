import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAllLevelsForAdmin } from "@/server/services/adminLevelService";
import { LevelsClient } from "./LevelsClient";

export const metadata: Metadata = { title: "Admin — Levels" };
export const dynamic = "force-dynamic";

export default async function AdminLevelsPage() {
  await requireAdmin();
  const levels = await getAllLevelsForAdmin();
  return <LevelsClient initialLevels={levels} />;
}
