"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { VocabWord } from "@/data/types";

interface VocabCardsProps {
  words: VocabWord[];
}

export function VocabCards({ words }: VocabCardsProps) {
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [known, setKnown] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });

  const markKnown = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setKnown((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-n-500">
        {known.size} / {words.length} known — click a card to reveal its meaning.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {words.map((w, i) => (
          <div
            key={w.word}
            onClick={() => toggle(i)}
            className={cn(
              "rounded-card border cursor-pointer transition-colors select-none",
              known.has(i) ? "border-green-200 bg-green-50" : "border-n-200 bg-white hover:border-blue-200 hover:bg-blue-50",
              flipped.has(i) && "shadow-hover"
            )}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-n-900">{w.word}</p>
                  <p className="text-xs text-n-400 font-mono mt-0.5">{w.pronunciation}</p>
                </div>
                <button
                  onClick={(e) => markKnown(i, e)}
                  className={cn(
                    "shrink-0 text-xs px-2 py-0.5 rounded-badge border transition-colors",
                    known.has(i)
                      ? "border-green-300 text-green-700 bg-green-100"
                      : "border-n-200 text-n-400 hover:border-green-300 hover:text-green-600"
                  )}
                >
                  {known.has(i) ? "Known ✓" : "Know it?"}
                </button>
              </div>

              {flipped.has(i) && (
                <div className="mt-3 pt-3 border-t border-n-100 space-y-1">
                  <p className="text-sm text-n-700">{w.meaning}</p>
                  <p className="text-xs text-n-400 italic">&ldquo;{w.example}&rdquo;</p>
                </div>
              )}

              {!flipped.has(i) && (
                <p className="text-xs text-n-300 mt-2">Tap to see meaning</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
