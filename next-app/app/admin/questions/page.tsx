"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { MOCK_QUESTIONS } from "@/data/mock/questions";
import type { Question, QuestionType } from "@/data/types";

const typeColor: Record<QuestionType, "blue" | "green" | "amber" | "purple"> = {
  SINGLE_CHOICE:   "blue",
  MULTIPLE_CHOICE: "green",
  FILL_BLANK:      "amber",
  DICTATION:       "purple",
};

const typeLabel: Record<QuestionType, string> = {
  SINGLE_CHOICE:   "Single",
  MULTIPLE_CHOICE: "Multiple",
  FILL_BLANK:      "Fill Blank",
  DICTATION:       "Dictation",
};

const TYPE_FILTER_OPTIONS: Array<"All" | QuestionType> = [
  "All", "SINGLE_CHOICE", "MULTIPLE_CHOICE", "FILL_BLANK", "DICTATION",
];

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | QuestionType>("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = questions.filter((q) => {
    const s = search.toLowerCase();
    const matchSearch = !s || q.prompt.toLowerCase().includes(s) || q.lessonTitle.toLowerCase().includes(s);
    const matchType   = typeFilter === "All" || q.type === typeFilter;
    return matchSearch && matchType;
  });

  const confirmDelete = () => {
    if (deletingId === null) return;
    setQuestions((prev) => prev.filter((q) => q.id !== deletingId));
    setDeletingId(null);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Questions</h1>
          <p className="text-sm text-n-500 mt-1">{filtered.length} of {questions.length} questions</p>
        </div>
      </div>

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
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-n-400">
            <p className="text-sm">No questions match your filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-n-200 bg-n-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-n-500">#</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Prompt</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Type</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Lesson</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Options</th>
                <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-n-50 transition-colors">
                  <td className="px-5 py-3 text-n-400">{q.id}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-n-800">{q.prompt}</p>
                    {q.explanation && (
                      <p className="text-xs text-n-400 mt-0.5 line-clamp-1">{q.explanation}</p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={typeColor[q.type]}>{typeLabel[q.type]}</Badge>
                  </td>
                  <td className="px-5 py-3 text-n-600">{q.lessonTitle}</td>
                  <td className="px-5 py-3 text-n-400">
                    {q.options.length > 0
                      ? `${q.options.length} options`
                      : q.answer
                        ? `"${q.answer.slice(0, 24)}…"`
                        : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingId(q.id)}
                      className="hover:text-red-500"
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

      <Modal open={deletingId !== null} onClose={() => setDeletingId(null)} title="Delete Question">
        <p className="text-sm text-n-700 mb-6">
          Delete question #{deletingId}? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeletingId(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
