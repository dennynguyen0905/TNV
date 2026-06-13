"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { PublicQuestion } from "@/server/mappers/questionMapper";

interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  correctOptionIds: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizResultData {
  score: number;
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  passed: boolean;
  saved: boolean;
  perQuestion: QuestionResult[];
}

interface QuizRunnerDBProps {
  questions: PublicQuestion[];
  lessonId: string;
}

type Answer = { selectedOptionIds: string[]; textAnswer?: string };

export function QuizRunnerDB({ questions, lessonId }: QuizRunnerDBProps) {
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [result, setResult] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"answering" | "result" | "review">("answering");

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
      const data: QuizResultData = await res.json();
      setResult(data);
      setMode("result");
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
    setMode("answering");
  };

  const getQResult = (qId: string) => result?.perQuestion.find((r) => r.questionId === qId);

  if (mode === "result" && result) {
    return (
      <div className="bg-white rounded-[20px] border border-n-200 p-8 md:p-10 text-center max-w-md mx-auto shadow-sm">
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5",
            result.passed ? "bg-green-50 text-green-500" : "bg-amber-50 text-amber-500"
          )}
        >
          <Icon name={result.passed ? "trophy" : "award"} size={36} />
        </div>
        <h3 className="text-2xl font-bold text-n-900 mb-2">
          {result.correctCount} / {result.totalQuestions} correct
        </h3>
        <div className={cn("text-4xl font-extrabold mb-2", result.passed ? "text-green-500" : "text-amber-500")}>
          {Math.round(result.percentage)}%
        </div>
        <p className="text-[15px] text-n-500 mb-6 leading-relaxed">
          {result.passed
            ? "Great job! You completed this lesson."
            : "Keep practicing! Try again to improve your score."}
        </p>
        
        {!result.saved && (
          <p className="text-xs text-n-400 mb-6">
            <Link href="/login" className="text-blue-500 hover:underline">Log in</Link> to save your progress.
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">Continue learning</Button>
          </Link>
          <Button variant="outline" size="lg" onClick={() => setMode("review")} className="w-full sm:w-auto">
            Review answers
          </Button>
        </div>
      </div>
    );
  }

  const submitted = mode === "review" && !!result;

  return (
    <div className="space-y-4">
      {mode === "review" && (
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-n-900 text-lg">Reviewing Answers</h3>
          <Button variant="outline" size="sm" onClick={handleReset}>Try again</Button>
        </div>
      )}

      {questions.map((q, i) => {
        const qr = getQResult(q.id);
        const correct = qr?.isCorrect ?? false;
        const incorrect = submitted && !correct;

        return (
          <div key={q.id} className="bg-white rounded-2xl border border-n-200 p-6 md:p-8">
            <p className="text-[15px] font-bold text-n-800 mb-5 leading-relaxed">
              <span className="text-blue-500 mr-2">Q{i + 1}.</span>
              {q.prompt}
            </p>

            {q.type === "SINGLE_CHOICE" && (
              <div className="flex flex-col gap-2.5">
                {q.options.map((opt) => {
                  const selected = answers[q.id]?.selectedOptionIds.includes(opt.id) ?? false;
                  const isRight = submitted && qr?.correctOptionIds.includes(opt.id);
                  const isWrong = submitted && selected && !qr?.correctOptionIds.includes(opt.id);
                  
                  return (
                    <button
                      key={opt.id}
                      onClick={() => !submitted && setOptionAnswer(q.id, opt.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 px-4 rounded-xl border-[1.5px] text-left transition-colors",
                        isRight ? "border-green-500 bg-green-50 text-n-900" :
                        isWrong ? "border-red-500 bg-red-50 text-n-900" :
                        selected ? "border-blue-500 bg-blue-50 text-n-900" :
                        "border-n-200 bg-white text-n-800",
                        !submitted && !selected && "hover:border-n-300",
                        submitted && "cursor-default",
                        !submitted && "cursor-pointer"
                      )}
                    >
                      <span className={cn(
                        "flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-colors",
                        isRight ? "border-green-500 bg-green-500 text-white" :
                        isWrong ? "border-red-500 bg-red-500 text-white" :
                        selected ? "border-blue-500 bg-blue-500 text-white" :
                        "border-n-300 bg-transparent"
                      )}>
                        {(selected || isRight) && (
                          <Icon name={isRight ? 'check' : isWrong ? 'x' : 'check'} size={14} color="currentColor" />
                        )}
                      </span>
                      <span className="text-sm font-medium">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "MULTIPLE_CHOICE" && (
              <div className="flex flex-col gap-2.5">
                {q.options.map((opt) => {
                  const selected = answers[q.id]?.selectedOptionIds.includes(opt.id) ?? false;
                  const isRight = submitted && qr?.correctOptionIds.includes(opt.id);
                  const isWrong = submitted && selected && !qr?.correctOptionIds.includes(opt.id);
                  const missed = submitted && !selected && qr?.correctOptionIds.includes(opt.id);
                  
                  return (
                    <button
                      key={opt.id}
                      onClick={() => !submitted && toggleMultiOption(q.id, opt.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 px-4 rounded-xl border-[1.5px] text-left transition-colors",
                        isRight ? "border-green-500 bg-green-50 text-n-900" :
                        isWrong ? "border-red-500 bg-red-50 text-n-900" :
                        missed ? "border-amber-400 bg-amber-50 text-n-900" :
                        selected ? "border-blue-500 bg-blue-50 text-n-900" :
                        "border-n-200 bg-white text-n-800",
                        !submitted && !selected && "hover:border-n-300",
                        submitted && "cursor-default",
                        !submitted && "cursor-pointer"
                      )}
                    >
                      <span className={cn(
                        "flex items-center justify-center w-6 h-6 rounded border-2 shrink-0 transition-colors",
                        isRight ? "border-green-500 bg-green-500 text-white" :
                        isWrong ? "border-red-500 bg-red-500 text-white" :
                        missed ? "border-amber-400 bg-amber-400 text-white" :
                        selected ? "border-blue-500 bg-blue-500 text-white" :
                        "border-n-300 bg-transparent"
                      )}>
                        {(selected || isRight || missed) && (
                          <Icon name={isRight ? 'check' : isWrong ? 'x' : missed ? 'check' : 'check'} size={14} color="currentColor" />
                        )}
                      </span>
                      <span className="text-sm font-medium">{opt.text}</span>
                    </button>
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
                    "w-full px-4 py-3 text-[15px] rounded-xl border-[1.5px] bg-white transition-colors outline-none",
                    submitted && correct ? "border-green-500 bg-green-50 text-green-900" :
                    submitted && incorrect ? "border-red-500 bg-red-50 text-red-900" :
                    "border-n-200 text-n-900 focus:border-blue-500"
                  )}
                />
                {submitted && incorrect && qr?.correctAnswer && (
                  <p className="text-sm font-medium text-green-600 mt-2">
                    Correct answer: &ldquo;{qr.correctAnswer}&rdquo;
                  </p>
                )}
              </div>
            )}

            {q.type === "DICTATION" && (
              <div>
                <textarea
                  value={answers[q.id]?.textAnswer ?? ""}
                  onChange={(e) => !submitted && setTextAnswer(q.id, e.target.value)}
                  disabled={submitted}
                  placeholder="Type the sentence…"
                  rows={2}
                  className={cn(
                    "w-full px-4 py-3 text-[15px] rounded-xl border-[1.5px] bg-white transition-colors outline-none resize-none",
                    submitted && correct ? "border-green-500 bg-green-50 text-green-900" :
                    submitted && incorrect ? "border-red-500 bg-red-50 text-red-900" :
                    "border-n-200 text-n-900 focus:border-blue-500"
                  )}
                />
                {submitted && incorrect && qr?.correctAnswer && (
                  <p className="text-sm font-medium text-green-600 mt-2">
                    Correct answer: &ldquo;{qr.correctAnswer}&rdquo;
                  </p>
                )}
              </div>
            )}

            {submitted && qr?.explanation && (
              <div className="mt-4 pt-4 border-t border-n-100">
                <p className="text-sm text-n-600">
                  <span className="font-bold text-n-800">Explanation:</span> {qr.explanation}
                </p>
              </div>
            )}
          </div>
        );
      })}

      {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}

      {!submitted && (
        <div className="pt-4 flex gap-3">
          <Button onClick={handleSubmit} disabled={!allAnswered || loading} size="lg" className="w-full sm:w-auto">
            {loading ? "Submitting…" : "Submit answers"}
          </Button>
        </div>
      )}
    </div>
  );
}
