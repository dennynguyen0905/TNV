import type { Question, QuestionOption } from "@prisma/client";
import type { QuestionType } from "@/data/types";

type PrismaQuestionWithOptions = Question & { options: QuestionOption[] };

type PrismaQuestionForAdmin = Question & {
  options: QuestionOption[];
  lesson: { id: string; title: string };
  _count?: { attemptAnswers: number };
};

// Shape for the admin Questions list (read-only table + delete).
export type AdminQuestion = {
  id: string;
  type: QuestionType;
  prompt: string;
  explanation: string;
  lessonId: string;
  lessonTitle: string;
  optionCount: number;
  answer: string;
  answerCount: number;
};

export function toAdminQuestion(q: PrismaQuestionForAdmin): AdminQuestion {
  return {
    id: q.id,
    type: q.type as QuestionType,
    prompt: q.prompt,
    explanation: q.explanation ?? "",
    lessonId: q.lesson.id,
    lessonTitle: q.lesson.title,
    optionCount: q.options.length,
    answer: q.answerText ?? "",
    answerCount: q._count?.attemptAnswers ?? 0,
  };
}

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
