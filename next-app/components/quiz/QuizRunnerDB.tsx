"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { PublicQuestion } from "@/server/mappers/questionMapper";

interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  correctOptionIds: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  passed: boolean;
  perQuestion: QuestionResult[];
}

interface QuizRunnerDBProps {
  questions: PublicQuestion[];
  lessonId: string;
  lessonTitle?: string;
}

type Answer = { selectedOptionIds: string[]; textAnswer?: string };

export function QuizRunnerDB({ questions, lessonId, lessonTitle }: QuizRunnerDBProps) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setOptionAnswer = (qId: string, optId: string) =>
    setAnswers((prev) => ({ ...prev, [qId]: { selectedOptionIds: [optId] } }));

  const toggleMultiOption = (qId: string, optId: string) =>
    setAnswers((prev) => {
      const current = prev[qId]?.selectedOptionIds ?? [];
      const next = current.includes(optId)
        ? current.filter((id) => id !== optId)
        : [...current, optId];
      return { ...prev, [qId]: { selectedOptionIds: next } };
    });

  const setTextAnswer = (qId: string, text: string) =>
    setAnswers((prev) => ({ ...prev, [qId]: { selectedOptionIds: [], textAnswer: text } }));

  const allAnswered = questions.every((q) => {
    const a = answers[q.id];
    if (!a) return false;
    if (q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") {
      return a.selectedOptionIds.length > 0;
    }
    return (a.textAnswer ?? "").trim() !== "";
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          answers: questions.map((q) => {
            const a = answers[q.id] ?? { selectedOptionIds: [] };
            return {
              questionId: q.id,
              selectedOptionIds: a.selectedOptionIds,
              textAnswer: a.textAnswer,
            };
          }),
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      const data: QuizResult = await res.json();
      setResult(data);
    } catch {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    setError(null);
  };

  const getQResult = (qId: string) => result?.perQuestion.find((r) => r.questionId === qId);

  return (
    <div className="space-y-6">
      {result && (
        <div
          className={cn(
            "rounded-card px-5 py-4 border",
            result.passed
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-base">
                {result.passed ? "Well done!" : "Keep practising!"}
              </p>
              <p className="text-sm mt-0.5">
                {result.correctCount} / {result.totalQuestions} correct &mdash; {result.percentage}%
                {lessonTitle && (
                  <span className="ml-2 text-xs opacity-70">{lessonTitle}</span>
                )}
              </p>
            </div>
            <Badge color={result.passed ? "green" : "red"}>
              {result.passed ? "PASS" : "FAIL"}
            </Badge>
          </div>
        </div>
      )}

      {questions.map((q) => {
        const qr = getQResult(q.id);
        const submitted = !!result;
        const correct = qr?.isCorrect ?? false;
        const incorrect = submitted && !correct;

        return (
          <div
            key={q.id}
            className={cn(
              "rounded-card border p-5 transition-colors",
              submitted
                ? correct
                  ? "border-green-200 bg-green-50/40"
                  : "border-red-200 bg-red-50/40"
                : "border-n-200 bg-white"
            )}
          >
            <p className="text-sm font-medium text-n-800 mb-3">
              {q.sortOrder}. {q.prompt}
            </p>

            {q.type === "SINGLE_CHOICE" && (
              <div className="space-y-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id]?.selectedOptionIds.includes(opt.id) ?? false;
                  const isRight = submitted && qr?.correctOptionIds.includes(opt.id);
                  const isWrong = submitted && selected && !qr?.correctOptionIds.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        !submitted && "hover:border-blue-200 hover:bg-blue-50",
                        !submitted && selected && "border-blue-300 bg-blue-50",
                        isRight && "border-green-300 bg-green-50",
                        isWrong && "border-red-300 bg-red-50",
                        submitted && !isRight && !isWrong && "opacity-60"
                      )}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={selected}
                        onChange={() => !submitted && setOptionAnswer(q.id, opt.id)}
                        disabled={submitted}
                        className="accent-blue-500 shrink-0"
                      />
                      <span className="text-sm text-n-700">{opt.text}</span>
                      {isRight && (
                        <span className="ml-auto text-green-600 text-xs font-medium">✓ Correct</span>
                      )}
                      {isWrong && (
                        <span className="ml-auto text-red-600 text-xs font-medium">✗ Wrong</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2">
                <p className="text-xs text-n-400 mb-2">Select all that apply.</p>
                {q.options.map((opt) => {
                  const selected = answers[q.id]?.selectedOptionIds.includes(opt.id) ?? false;
                  const isRight = submitted && qr?.correctOptionIds.includes(opt.id) && selected;
                  const missed = submitted && !selected && qr?.correctOptionIds.includes(opt.id);
                  const isWrong = submitted && selected && !qr?.correctOptionIds.includes(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        !submitted && "hover:border-blue-200 hover:bg-blue-50",
                        !submitted && selected && "border-blue-300 bg-blue-50",
                        isRight && "border-green-300 bg-green-50",
                        missed && "border-green-200 bg-green-50 opacity-70",
                        isWrong && "border-red-300 bg-red-50",
                        submitted && !isRight && !selected && "opacity-60"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => !submitted && toggleMultiOption(q.id, opt.id)}
                        disabled={submitted}
                        className="accent-blue-500 shrink-0"
                      />
                      <span className="text-sm text-n-700">{opt.text}</span>
                      {isRight && (
                        <span className="ml-auto text-green-600 text-xs font-medium">✓</span>
                      )}
                      {isWrong && (
                        <span className="ml-auto text-red-600 text-xs font-medium">✗</span>
                      )}
                      {missed && (
                        <span className="ml-auto text-green-600 text-xs font-medium">
                          should select
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}

            {q.type === "FILL_BLANK" && (
              <div>
                <input
                  type="text"
                  value={answers[q.id]?.textAnswer ?? ""}
                  onChange={(e) => !submitted && setTextAnswer(q.id, e.target.value)}
                  disabled={submitted}
                  placeholder="Type your answer…"
                  className={cn(
                    "w-full px-3 py-2 text-sm rounded-input border bg-white",
                    "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500",
                    submitted && correct && "border-green-400 bg-green-50",
                    submitted && incorrect && "border-red-400 bg-red-50"
                  )}
                />
                {submitted && incorrect && qr?.correctAnswer && (
                  <p className="text-xs text-green-700 mt-1">
                    Correct answer: &ldquo;{qr.correctAnswer}&rdquo;
                  </p>
                )}
              </div>
            )}

            {q.type === "DICTATION" && (
              <div>
                <p className="text-xs text-n-500 mb-2">Type exactly what you hear.</p>
                <textarea
                  value={answers[q.id]?.textAnswer ?? ""}
                  onChange={(e) => !submitted && setTextAnswer(q.id, e.target.value)}
                  disabled={submitted}
                  placeholder="Type the sentence…"
                  rows={2}
                  className={cn(
                    "w-full px-3 py-2 text-sm rounded-input border bg-white resize-none",
                    "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500",
                    submitted && correct && "border-green-400 bg-green-50",
                    submitted && incorrect && "border-red-400 bg-red-50"
                  )}
                />
                {submitted && incorrect && qr?.correctAnswer && (
                  <p className="text-xs text-green-700 mt-1">
                    Correct: &ldquo;{qr.correctAnswer}&rdquo;
                  </p>
                )}
              </div>
            )}

            {submitted && qr?.explanation && (
              <div className="mt-3 pt-3 border-t border-n-100">
                <p className="text-xs text-n-500">
                  <span className="font-medium text-n-700">Explanation:</span> {qr.explanation}
                </p>
              </div>
            )}

            {submitted && (
              <div className="mt-2 flex justify-end">
                <Badge color={correct ? "green" : "red"}>
                  {correct ? "Correct" : "Incorrect"}
                </Badge>
              </div>
            )}
          </div>
        );
      })}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        {!result ? (
          <Button onClick={handleSubmit} disabled={!allAnswered || loading} className="w-full">
            {loading ? "Submitting…" : "Submit answers"}
          </Button>
        ) : (
          <Button variant="secondary" onClick={handleReset} className="w-full">
            ↺ Try again
          </Button>
        )}
      </div>
    </div>
  );
}
