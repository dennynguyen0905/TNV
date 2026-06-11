import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAllLanguagesForAdmin } from "@/server/services/adminLanguageService";
import { LanguagesClient } from "./LanguagesClient";

export const metadata: Metadata = { title: "Admin — Languages" };
export const dynamic = "force-dynamic";

export default async function AdminLanguagesPage() {
  await requireAdmin();
  const languages = await getAllLanguagesForAdmin();
  return <LanguagesClient initialLanguages={languages} />;
}
