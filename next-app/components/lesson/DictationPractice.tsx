"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface DictationSentence {
  id: number;
  text: string;
  hint?: string;
}

interface DictationPracticeProps {
  sentences: DictationSentence[];
}

export function DictationPractice({ sentences }: DictationPracticeProps) {
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [results, setResults] = useState<Record<number, boolean>>({});

  const handleCheck = (id: number, expected: string) => {
    const userInput = (inputs[id] ?? "").trim().toLowerCase();
    const correct = userInput === expected.trim().toLowerCase();
    setResults((prev) => ({ ...prev, [id]: correct }));
    setChecked((prev) => ({ ...prev, [id]: true }));
  };

  const handleReset = (id: number) => {
    setInputs((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setResults((prev) => { const n = { ...prev }; delete n[id]; return n; });
    setChecked((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-n-500">Listen carefully and type each sentence exactly as you hear it.</p>

      {sentences.map((s, i) => {
        const isChecked = checked[s.id];
        const isCorrect = results[s.id];

        return (
          <div key={s.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-n-500 w-5">{i + 1}.</span>
              {/* Audio icon placeholder */}
              <div className="flex items-center gap-2 bg-n-100 rounded-lg px-3 py-2 text-n-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span className="text-xs">[audio placeholder — sentence {i + 1}]</span>
              </div>
            </div>

            <div className="flex gap-2">
              <textarea
                rows={1}
                value={inputs[s.id] ?? ""}
                onChange={(e) => {
                  setInputs((prev) => ({ ...prev, [s.id]: e.target.value }));
                  if (isChecked) handleReset(s.id);
                }}
                placeholder="Type what you hear…"
                disabled={isChecked && isCorrect}
                className={cn(
                  "flex-1 px-3 py-2 text-sm rounded-input border bg-white resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500",
                  isChecked && isCorrect && "border-green-400 bg-green-50",
                  isChecked && !isCorrect && "border-red-400 bg-red-50"
                )}
              />
              {!isChecked ? (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!inputs[s.id]?.trim()}
                  onClick={() => handleCheck(s.id, s.text)}
                >
                  Check
                </Button>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => handleReset(s.id)}>
                  Retry
                </Button>
              )}
            </div>

            {isChecked && (
              <div className={cn(
                "text-xs px-3 py-1.5 rounded-lg",
                isCorrect ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
              )}>
                {isCorrect
                  ? "Correct!"
                  : <>Wrong. Correct answer: <span className="font-medium">&ldquo;{s.text}&rdquo;</span></>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
