import { z } from "zod";

const QUESTION_TYPES = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "FILL_BLANK", "DICTATION"] as const;
const LESSON_STATUSES_DB = ["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"] as const;

export const questionOptionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
  sortOrder: z.number().int().min(0),
});

export const questionSchema = z.object({
  id: z.string().optional(),
  type: z.enum(QUESTION_TYPES),
  prompt: z.string().min(1, "Prompt is required"),
  answerText: z.string().optional(),
  explanation: z.string().optional(),
  sortOrder: z.number().int().min(0),
  options: z.array(questionOptionSchema).default([]),
});

export const lessonCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  summary: z.string().max(500).optional(),
  content: z.string().optional(),
  lang: z.string().min(1, "Language is required"),
  skill: z.string().min(1, "Skill is required"),
  level: z.string().min(1, "Level is required"),
  status: z.enum(LESSON_STATUSES_DB),
  isPremium: z.boolean().default(false),
  seoTitle: z.string().max(120).optional(),
  seoDescription: z.string().max(300).optional(),
  questions: z.array(questionSchema).default([]),
});

export const lessonUpdateSchema = lessonCreateSchema.extend({
  id: z.string().min(1),
});

export const quizSubmissionSchema = z.object({
  lessonId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      selectedOptionIds: z.array(z.string()).default([]),
      textAnswer: z.string().optional(),
    })
  ),
});

export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>;
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;
