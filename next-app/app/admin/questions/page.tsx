import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAllQuestionsForAdmin } from "@/server/services/adminQuestionService";
import { QuestionsClient } from "./QuestionsClient";

export const metadata: Metadata = { title: "Admin — Questions" };
export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  await requireAdmin();
  const questions = await getAllQuestionsForAdmin();
  return <QuestionsClient initialQuestions={questions} />;
}
