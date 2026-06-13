"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import type { VocabWord } from "@/data/types";

interface VocabCardsProps {
  words: VocabWord[];
}

export function VocabCards({ words }: VocabCardsProps) {
  const [current, setCurrent] = useState(0);
  const [known, setKnown] = useState<number[]>([]);
  const [practice, setPractice] = useState<number[]>([]);
  const [flipped, setFlipped] = useState(false);

  const handleKnow = () => {
    setKnown([...known, current]);
    if (current < words.length - 1) setCurrent(current + 1);
    setFlipped(false);
  };
  
  const handlePractice = () => {
    setPractice([...practice, current]);
    if (current < words.length - 1) setCurrent(current + 1);
    setFlipped(false);
  };

  const allDone = known.length + practice.length >= words.length;

  if (words.length === 0) return null;

  return (
    <div>
      <div className="h-1.5 bg-n-200 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${((known.length + practice.length) / words.length) * 100}%` }}
        />
      </div>
      <p className="text-[13px] text-n-400 mb-8 font-medium">
        {known.length + practice.length} of {words.length} words reviewed · {known.length} known · {practice.length} need practice
      </p>

      {!allDone ? (
        <div className="bg-white rounded-[20px] border border-n-200 shadow-[0_4px_24px_rgba(0,0,0,0.04)] max-w-[480px] mx-auto overflow-hidden">
          <div 
            className="p-8 text-center min-h-[200px] flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-n-50/50"
            onClick={() => setFlipped(!flipped)}
          >
            {!flipped ? (
              <>
                <h2 className="text-[32px] font-extrabold text-n-900 mb-2">{words[current].word}</h2>
                <p className="text-[16px] text-n-400 font-mono tracking-wider">{words[current].pronunciation}</p>
                <p className="text-[13px] text-n-300 mt-4 font-medium uppercase tracking-widest">Tap to reveal meaning</p>
              </>
            ) : (
              <>
                <h3 className="text-[20px] font-bold text-blue-600 mb-3">{words[current].word}</h3>
                <p className="text-[17px] text-n-700 mb-4">{words[current].meaning}</p>
                <p className="text-[14px] text-n-500 italic leading-relaxed">&ldquo;{words[current].example}&rdquo;</p>
              </>
            )}
          </div>
          <div className="flex border-t border-n-200">
            <button 
              onClick={handlePractice} 
              className="flex-1 p-[14px] border-none bg-amber-50 text-amber-500 font-bold text-[14px] cursor-pointer border-r border-n-200 hover:bg-amber-100 transition-colors"
            >
              Need practice
            </button>
            <button 
              onClick={handleKnow} 
              className="flex-1 p-[14px] border-none bg-green-50 text-green-600 font-bold text-[14px] cursor-pointer hover:bg-green-100 transition-colors"
            >
              I know this
            </button>
          </div>
        </div>
      ) : (
        <div className="p-10 bg-white rounded-[20px] border border-n-200 max-w-[480px] mx-auto shadow-sm">
          <div className="flex justify-center mb-4">
            <Icon name="check" size={48} className="text-green-500" />
          </div>
          <h3 className="text-[22px] font-bold text-n-900 mb-2">All words reviewed!</h3>
          <p className="text-[15px] text-n-500 mb-6 leading-relaxed">
            You know {known.length} words and marked {practice.length} for practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">Back to lessons</Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto"
              onClick={() => { 
                setCurrent(0); 
                setKnown([]); 
                setPractice([]); 
                setFlipped(false);
              }}
            >
              Review again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
