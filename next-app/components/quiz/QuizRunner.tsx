"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Question } from "@/data/types";

interface QuizRunnerProps {
  questions: Question[];
  lessonTitle?: string;
}

type UserAnswer = number | number[] | string;

const PASS_THRESHOLD = 0.7;

function isCorrect(q: Question, answer: UserAnswer | undefined): boolean {
  if (answer === undefined) return false;
  if (q.type === "SINGLE_CHOICE") {
    return answer === q.correctIdx;
  }
  if (q.type === "MULTIPLE_CHOICE") {
    const userSet = new Set(answer as number[]);
    const correctSet = new Set(q.correctIndices);
    return userSet.size === correctSet.size && [...userSet].every((v) => correctSet.has(v));
  }
  if (q.type === "FILL_BLANK" || q.type === "DICTATION") {
    return (answer as string).trim().toLowerCase() === q.answer.trim().toLowerCase();
  }
  return false;
}

export function QuizRunner({ questions, lessonTitle }: QuizRunnerProps) {
  const [answers, setAnswers] = useState<Partial<Record<number, UserAnswer>>>({});
  const [submitted, setSubmitted] = useState(false);

  const setAnswer = (idx: number, value: UserAnswer) =>
    setAnswers((prev) => ({ ...prev, [idx]: value }));

  const toggleMulti = (idx: number, optIdx: number) => {
    const current = (answers[idx] ?? []) as number[];
    const next = current.includes(optIdx)
      ? current.filter((v) => v !== optIdx)
      : [...current, optIdx];
    setAnswer(idx, next);
  };

  const handleSubmit = () => setSubmitted(true);

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const answered = questions.every((_, i) => {
    const a = answers[i];
    if (a === undefined) return false;
    if (Array.isArray(a)) return (a as number[]).length > 0;
    if (typeof a === "string") return a.trim() !== "";
    return true;
  });

  const correctCount = submitted
    ? questions.filter((q, i) => isCorrect(q, answers[i])).length
    : 0;
  const score = submitted ? correctCount / questions.length : 0;
  const passed = score >= PASS_THRESHOLD;

  return (
    <div className="space-y-6">
      {submitted && (
        <div className={cn(
          "rounded-card px-5 py-4 border",
          passed
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-base">
                {passed ? "Well done!" : "Keep practising!"}
              </p>
              <p className="text-sm mt-0.5">
                {correctCount} / {questions.length} correct &mdash; {Math.round(score * 100)}%
                {lessonTitle && <span className="ml-2 text-xs opacity-70">{lessonTitle}</span>}
              </p>
            </div>
            <Badge color={passed ? "green" : "red"}>{passed ? "PASS" : "FAIL"}</Badge>
          </div>
        </div>
      )}

      {questions.map((q, i) => {
        const answer = answers[i];
        const correct   = submitted && isCorrect(q, answer);
        const incorrect = submitted && !isCorrect(q, answer);

        return (
          <div key={q.id} className={cn(
            "rounded-card border p-5 transition-colors",
            submitted
              ? correct
                ? "border-green-200 bg-green-50/40"
                : "border-red-200 bg-red-50/40"
              : "border-n-200 bg-white"
          )}>
            <p className="text-sm font-medium text-n-800 mb-3">
              {i + 1}. {q.prompt}
            </p>

            {/* SINGLE_CHOICE */}
            {q.type === "SINGLE_CHOICE" && (
              <div className="space-y-2">
                {q.options.map((opt, j) => {
                  const selected = answer === j;
                  const isRight  = submitted && j === q.correctIdx;
                  const isWrong  = submitted && selected && j !== q.correctIdx;
                  return (
                    <label
                      key={j}
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
                        name={`q-${i}`}
                        value={j}
                        checked={selected === true}
                        onChange={() => !submitted && setAnswer(i, j)}
                        disabled={submitted}
                        className="accent-blue-500 shrink-0"
                      />
                      <span className="text-sm text-n-700">{opt}</span>
                      {isRight && <span className="ml-auto text-green-600 text-xs font-medium">✓ Correct</span>}
                      {isWrong && <span className="ml-auto text-red-600 text-xs font-medium">✗ Wrong</span>}
                    </label>
                  );
                })}
              </div>
            )}

            {/* MULTIPLE_CHOICE */}
            {q.type === "MULTIPLE_CHOICE" && (
              <div className="space-y-2">
                <p className="text-xs text-n-400 mb-2">Select all that apply.</p>
                {q.options.map((opt, j) => {
                  const selected = ((answer ?? []) as number[]).includes(j);
                  const isRight  = submitted && q.correctIndices.includes(j);
                  const isWrong  = submitted && selected && !q.correctIndices.includes(j);
                  const missed   = submitted && !selected && q.correctIndices.includes(j);
                  return (
                    <label
                      key={j}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        !submitted && "hover:border-blue-200 hover:bg-blue-50",
                        !submitted && selected && "border-blue-300 bg-blue-50",
                        isRight && selected && "border-green-300 bg-green-50",
                        missed && "border-green-200 bg-green-50 opacity-70",
                        isWrong && "border-red-300 bg-red-50",
                        submitted && !isRight && !selected && "opacity-60"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => !submitted && toggleMulti(i, j)}
                        disabled={submitted}
                        className="accent-blue-500 shrink-0"
                      />
                      <span className="text-sm text-n-700">{opt}</span>
                      {isRight && selected && <span className="ml-auto text-green-600 text-xs font-medium">✓</span>}
                      {isWrong && <span className="ml-auto text-red-600 text-xs font-medium">✗</span>}
                      {missed && <span className="ml-auto text-green-600 text-xs font-medium">should select</span>}
                    </label>
                  );
                })}
              </div>
            )}

            {/* FILL_BLANK */}
            {q.type === "FILL_BLANK" && (
              <div>
                <input
                  type="text"
                  value={(answer as string | undefined) ?? ""}
                  onChange={(e) => !submitted && setAnswer(i, e.target.value)}
                  disabled={submitted}
                  placeholder="Type your answer…"
                  className={cn(
                    "w-full px-3 py-2 text-sm rounded-input border bg-white",
                    "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500",
                    submitted && correct  && "border-green-400 bg-green-50",
                    submitted && incorrect && "border-red-400 bg-red-50"
                  )}
                />
                {submitted && incorrect && (
                  <p className="text-xs text-green-700 mt-1">Correct answer: &ldquo;{q.answer}&rdquo;</p>
                )}
              </div>
            )}

            {/* DICTATION */}
            {q.type === "DICTATION" && (
              <div>
                <p className="text-xs text-n-500 mb-2">Type exactly what you hear.</p>
                <textarea
                  value={(answer as string | undefined) ?? ""}
                  onChange={(e) => !submitted && setAnswer(i, e.target.value)}
                  disabled={submitted}
                  placeholder="Type the sentence…"
                  rows={2}
                  className={cn(
                    "w-full px-3 py-2 text-sm rounded-input border bg-white resize-none",
                    "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500",
                    submitted && correct  && "border-green-400 bg-green-50",
                    submitted && incorrect && "border-red-400 bg-red-50"
                  )}
                />
                {submitted && incorrect && (
                  <p className="text-xs text-green-700 mt-1">Correct: &ldquo;{q.answer}&rdquo;</p>
                )}
              </div>
            )}

            {/* Explanation */}
            {submitted && q.explanation && (
              <div className="mt-3 pt-3 border-t border-n-100">
                <p className="text-xs text-n-500">
                  <span className="font-medium text-n-700">Explanation:</span> {q.explanation}
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

      <div className="flex items-center justify-between">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!answered} className="w-full">
            Submit answers
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
