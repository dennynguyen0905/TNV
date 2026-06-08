import type { Question, QuestionOption } from "@prisma/client";
import type { QuestionType } from "@/data/types";

type PrismaQuestionWithOptions = Question & { options: QuestionOption[] };

// Safe shape for client — no answer keys exposed before submission
export interface PublicQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options: { id: string; text: string }[];
  sortOrder: number;
}

// Shape for admin LessonForm (includes answer keys for editing)
export type EditableQuestionDB = {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  correctIdx: number;
  correctIndices: number[];
  answer: string;
  explanation: string;
  sortOrder: number;
};

export function toPublicQuestion(q: PrismaQuestionWithOptions): PublicQuestion {
  return {
    id: q.id,
    type: q.type as QuestionType,
    prompt: q.prompt,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
    sortOrder: q.sortOrder,
  };
}

export function toEditableQuestion(q: PrismaQuestionWithOptions): EditableQuestionDB {
  const correctIdx = q.options.findIndex((o) => o.isCorrect);
  const correctIndices = q.options.reduce<number[]>((acc, o, i) => {
    if (o.isCorrect) acc.push(i);
    return acc;
  }, []);
  return {
    id: q.id,
    type: q.type as QuestionType,
    prompt: q.prompt,
    options: q.options.map((o) => o.text),
    correctIdx: correctIdx >= 0 ? correctIdx : 0,
    correctIndices,
    answer: q.answerText ?? "",
    explanation: q.explanation ?? "",
    sortOrder: q.sortOrder,
  };
}
