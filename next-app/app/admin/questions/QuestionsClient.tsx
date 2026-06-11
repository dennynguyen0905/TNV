"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AdminQuestion } from "@/server/mappers/questionMapper";
import type { QuestionType } from "@/data/types";
import { deleteQuestionAction } from "./actions";

const typeColor: Record<QuestionType, "blue" | "green" | "amber" | "purple"> = {
  SINGLE_CHOICE: "blue",
  MULTIPLE_CHOICE: "green",
  FILL_BLANK: "amber",
  DICTATION: "purple",
};

const typeLabel: Record<QuestionType, string> = {
  SINGLE_CHOICE: "Single",
  MULTIPLE_CHOICE: "Multiple",
  FILL_BLANK: "Fill Blank",
  DICTATION: "Dictation",
};

const TYPE_FILTER_OPTIONS: Array<"All" | QuestionType> = [
  "All", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "FILL_BLANK", "DICTATION",
];

interface QuestionsClientProps {
  initialQuestions: AdminQuestion[];
}

export function QuestionsClient({ initialQuestions }: QuestionsClientProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState<AdminQuestion[]>(initialQuestions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | QuestionType>("All");
  const [deleting, setDeleting] = useState<AdminQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  const filtered = questions.filter((q) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s || q.prompt.toLowerCase().includes(s) || q.lessonTitle.toLowerCase().includes(s);
    const matchType = typeFilter === "All" || q.type === typeFilter;
    return matchSearch && matchType;
  });

  function confirmDelete() {
    if (!deleting) return;
    const id = deleting.id;
    setDeleting(null);
    setError(null);
    startTransition(async () => {
      const res = await deleteQuestionAction({ id });
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  const isEmpty = questions.length === 0;

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Questions</h1>
          <p className="text-sm text-n-500 mt-1">
            {filtered.length} of {questions.length} questions · edit via the lesson editor
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search prompt or lesson…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "All" | QuestionType)}
          className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {TYPE_FILTER_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t === "All" ? "All types" : typeLabel[t as QuestionType]}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {isEmpty ? (
          <EmptyState
            icon="edit"
            title="No questions yet"
            description="Questions are authored inside the lesson editor. Create or edit a lesson and add questions in its quiz section."
            action={
              <Link href="/admin/lessons">
                <Button variant="secondary" size="sm">Go to Lessons</Button>
              </Link>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No questions match your filters"
            description="Try a different search term or question type."
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-n-200 bg-n-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-n-500">Prompt</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Type</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Lesson</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Options</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Answers</th>
                <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-n-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-medium text-n-800 line-clamp-1">{q.prompt}</p>
                    {q.explanation && (
                      <p className="text-xs text-n-400 mt-0.5 line-clamp-1">{q.explanation}</p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={typeColor[q.type]}>{typeLabel[q.type]}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/lessons/${q.lessonId}/edit`}
                      className="text-n-600 hover:text-blue-600 transition-colors"
                    >
                      {q.lessonTitle}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-n-400">
                    {q.optionCount > 0
                      ? `${q.optionCount} options`
                      : q.answer
                        ? `"${q.answer.slice(0, 24)}${q.answer.length > 24 ? "…" : ""}"`
                        : "—"}
                  </td>
                  <td className="px-5 py-3 text-n-400">{q.answerCount}</td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(q)}
                      disabled={isPending}
                      className="hover:text-red-500"
                      title="Delete question"
                    >
                      <Icon name="trash" size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={deleting !== null} onClose={() => setDeleting(null)} title="Delete Question">
        <p className="text-sm text-n-700 mb-2">
          Delete this question from &ldquo;{deleting?.lessonTitle}&rdquo;? This cannot be undone.
        </p>
        {deleting && deleting.answerCount > 0 && (
          <p className="text-sm text-amber-700 mb-4">
            {deleting.answerCount} learner answer{deleting.answerCount !== 1 ? "s" : ""} will also be
            removed.
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
