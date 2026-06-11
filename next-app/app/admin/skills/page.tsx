import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAllSkillsForAdmin } from "@/server/services/adminSkillService";
import { SkillsClient } from "./SkillsClient";

export const metadata: Metadata = { title: "Admin — Skills" };
export const dynamic = "force-dynamic";

export default async function AdminSkillsPage() {
  await requireAdmin();
  const skills = await getAllSkillsForAdmin();
  return <SkillsClient initialSkills={skills} />;
}
