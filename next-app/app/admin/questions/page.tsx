import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { MOCK_QUESTIONS } from "@/data/mock/questions";

export const metadata: Metadata = { title: "Admin — Questions" };

const typeColor: Record<string, "blue" | "green" | "amber" | "purple"> = {
  SINGLE_CHOICE:   "blue",
  MULTIPLE_CHOICE: "green",
  FILL_BLANK:      "amber",
  DICTATION:       "purple",
};

const typeLabel: Record<string, string> = {
  SINGLE_CHOICE:   "Single",
  MULTIPLE_CHOICE: "Multiple",
  FILL_BLANK:      "Fill Blank",
  DICTATION:       "Dictation",
};

export default function AdminQuestionsPage() {
  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Questions</h1>
          <p className="text-sm text-n-500 mt-1">{MOCK_QUESTIONS.length} questions total</p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-n-200 bg-n-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-n-500">#</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Prompt</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Type</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Lesson</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-n-100">
            {MOCK_QUESTIONS.map((q) => (
              <tr key={q.id} className="hover:bg-n-50 transition-colors">
                <td className="px-5 py-3 text-n-400">{q.id}</td>
                <td className="px-5 py-3">
                  <p className="font-medium text-n-800">{q.prompt}</p>
                  {q.explanation && (
                    <p className="text-xs text-n-400 mt-0.5 line-clamp-1">{q.explanation}</p>
                  )}
                </td>
                <td className="px-5 py-3">
                  <Badge color={typeColor[q.type] ?? "blue"}>
                    {typeLabel[q.type] ?? q.type}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-n-600">{q.lessonTitle}</td>
                <td className="px-5 py-3 text-n-400">
                  {q.options.length > 0 ? `${q.options.length} options` : q.answer ? `"${q.answer.slice(0, 20)}…"` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
