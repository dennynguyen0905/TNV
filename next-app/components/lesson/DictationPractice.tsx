"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DictationSentence {
  id: number;
  text: string;
  hint?: string;
}

interface DictationPracticeProps {
  sentences: DictationSentence[];
}

interface WordResult {
  word: string;
  typed?: string;
  status: 'correct' | 'wrong' | 'missing';
}

interface SentenceResult {
  sentence: string;
  input: string;
  words: WordResult[];
  score: number;
}

export function DictationPractice({ sentences }: DictationPracticeProps) {
  const [currentIdx, setCurrent] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<SentenceResult[]>([]);
  const [finished, setFinished] = useState(false);

  const checkAnswer = () => {
    const correct = sentences[currentIdx].text;
    const userWords = userInput.trim().split(/\s+/).filter(Boolean);
    const correctWords = correct.split(/\s+/).filter(Boolean);
    
    const wordResults = correctWords.map((w, i) => {
      if (!userWords[i]) return { word: w, status: 'missing' as const };
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalize(userWords[i]) === normalize(w)) return { word: w, status: 'correct' as const };
      return { word: w, typed: userWords[i], status: 'wrong' as const };
    });
    
    const correctCount = wordResults.filter(w => w.status === 'correct').length;
    const score = correctWords.length > 0 ? correctCount / correctWords.length : 0;
    
    setResults([...results, { sentence: correct, input: userInput, words: wordResults, score }]);
    setChecked(true);
  };

  const nextSentence = () => {
    if (currentIdx >= sentences.length - 1) {
      setFinished(true);
      return;
    }
    setCurrent(currentIdx + 1);
    setUserInput('');
    setChecked(false);
  };

  const totalScore = results.length > 0 
    ? Math.round((results.reduce((a, r) => a + r.score, 0) / results.length) * 100) 
    : 0;

  if (finished) {
    const passed = totalScore >= 70;
    return (
      <div className="bg-white rounded-[20px] border border-n-200 p-10 text-center max-w-md mx-auto shadow-sm">
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5",
            passed ? "bg-green-50 text-green-500" : "bg-amber-50 text-amber-500"
          )}
        >
          <Icon name="trophy" size={36} />
        </div>
        <h2 className="text-[28px] font-extrabold text-n-900 mb-2">Dictation Complete</h2>
        <div className={cn("text-[40px] font-extrabold mb-4", passed ? "text-green-500" : "text-amber-500")}>
          {totalScore}%
        </div>
        <p className="text-[15px] text-n-500 mb-8 leading-relaxed">
          You completed {sentences.length} sentences. {passed ? 'Great work!' : 'Keep practicing!'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">Continue</Button>
          </Link>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto"
            onClick={() => { 
              setCurrent(0); 
              setUserInput(''); 
              setChecked(false); 
              setResults([]); 
              setFinished(false); 
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  const currentResult = results[results.length - 1];

  return (
    <div>
      <div className="h-1.5 bg-n-200 rounded-full overflow-hidden mb-6">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / sentences.length) * 100}%` }}
        />
      </div>
      <p className="text-[13px] text-n-400 mb-6 font-medium tracking-wide uppercase">
        Sentence {currentIdx + 1} of {sentences.length}
      </p>

      {/* Audio placeholder to match prototype's AudioPlayer compact */}
      <div className="bg-n-50 border border-n-200 rounded-[14px] p-3 flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
        <div className="flex-1">
          <div className="h-1.5 bg-n-200 rounded-full overflow-hidden w-full"><div className="w-0 h-full bg-blue-500"></div></div>
        </div>
        <div className="text-[11px] font-bold text-n-400 uppercase tracking-widest px-2">Audio {currentIdx + 1}</div>
      </div>

      <div className="mb-4">
        <textarea
          placeholder="Type the sentence here..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={checked}
          rows={3}
          className={cn(
            "w-full px-4 py-3 text-[16px] rounded-xl border-[1.5px] bg-white transition-colors outline-none resize-none",
            checked ? "border-n-200 text-n-500 bg-n-50" : "border-n-200 text-n-900 focus:border-blue-500"
          )}
        />
      </div>

      {checked && currentResult && (
        <div className="p-5 bg-white rounded-[14px] border border-n-200 mb-4 shadow-sm">
          <p className="text-[13px] font-bold text-n-500 mb-2.5">Correction:</p>
          <p className="text-[16px] leading-[1.8] flex flex-wrap gap-1.5">
            {currentResult.words.map((w, i) => (
              <span
                key={i}
                className={cn(
                  "border-b-[2px] pb-[1px]",
                  w.status === 'correct' ? "border-green-500 text-green-600 font-normal" : 
                  w.status === 'wrong' ? "border-red-500 text-red-600 font-semibold" : 
                  "border-amber-400 text-amber-600 font-semibold"
                )}
              >
                {w.word}
              </span>
            ))}
          </p>
          {currentResult.words.some(w => w.status !== 'correct') && (
            <p className="text-[13px] text-n-500 mt-3 font-medium">
              <span className="text-green-500 mr-1">■</span> correct &nbsp;&nbsp;
              <span className="text-red-500 mr-1">■</span> wrong &nbsp;&nbsp;
              <span className="text-amber-400 mr-1">■</span> missing
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {!checked ? (
          <Button 
            variant="primary" 
            size="lg"
            onClick={checkAnswer} 
            disabled={!userInput.trim()}
          >
            Check answer
          </Button>
        ) : (
          <Button 
            variant="primary" 
            size="lg"
            onClick={nextSentence}
          >
            {currentIdx >= sentences.length - 1 ? 'Finish dictation' : 'Next sentence'}
          </Button>
        )}
      </div>
    </div>
  );
}
