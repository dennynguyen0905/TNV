// Core domain types for LangPath

export type UserRole = "LEARNER" | "ADMIN" | "EDITOR";
export type UserStatus = "active" | "inactive";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  premium: boolean;
  status: UserStatus;
  joined: string;
  lessonsCompleted: number;
}

export interface Language {
  id: string;
  name: string;
  slug: string;
  meta: string;
  skills: string[];
  active: boolean;
}

export type SkillName = "Reading" | "Listening" | "Dictation" | "Grammar" | "Vocabulary";

export interface SkillColor {
  bg: string;
  accent: string;
}

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type LessonStatus = "Published" | "Draft" | "Review" | "Archived";

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  lang: string;
  skill: SkillName;
  level: CefrLevel;
  time: string;
  free: boolean;
  questions: number;
  hasPdf: boolean;
}

export interface AdminLesson {
  id: string;
  title: string;
  slug: string;
  summary: string;
  lang: string;
  skill: SkillName;
  level: CefrLevel;
  status: LessonStatus;
  premium: boolean;
  seoTitle: string;
  seoDesc: string;
  updated: string;
}

export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "FILL_BLANK" | "DICTATION";

export interface Question {
  id: string;
  lessonId: string;
  lessonTitle: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  correctIdx: number;
  correctIndices: number[];
  answer: string;
  explanation: string;
  sortOrder: number;
}

export interface AnswerOption {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  correct: number;
}

export interface VocabWord {
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
}

export interface MediaAsset {
  id: number;
  fileName: string;
  type: string;
  url: string;
  lessonId: number;
  lessonTitle: string;
  size: string;
  uploadedAt: string;
}

export type WorkerJobType = "GENERATE_PDF" | "PROCESS_AUDIO" | "INDEX_SEARCH" | "REVALIDATE_CACHE";
export type WorkerJobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface WorkerJob {
  id: string;
  type: WorkerJobType;
  status: WorkerJobStatus;
  idempotencyKey: string;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
