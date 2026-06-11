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

// ─── Admin CMS (Phase 5D) ─────────────────────────────────────────────────────

const USER_ROLES = ["ADMIN", "LEARNER"] as const;
const USER_STATUSES = ["ACTIVE", "DISABLED"] as const;

const slugField = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens");

export const userRoleUpdateSchema = z.object({
  id: z.string().min(1, "User id is required"),
  role: z.enum(USER_ROLES),
});

export const userPremiumUpdateSchema = z.object({
  id: z.string().min(1, "User id is required"),
  isPremium: z.boolean(),
});

export const userStatusUpdateSchema = z.object({
  id: z.string().min(1, "User id is required"),
  status: z.enum(USER_STATUSES),
});

export const userProfileUpdateSchema = z.object({
  id: z.string().min(1, "User id is required"),
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email address"),
});

export const languageCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  slug: slugField,
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(8, "Code must be at most 8 characters")
    .regex(/^[a-z0-9-]+$/, "Code must be lowercase letters, numbers and hyphens"),
  description: z.string().max(500).optional(),
  flagEmoji: z.string().max(16).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0, "Sort order must be 0 or greater").default(0),
});

export const languageUpdateSchema = languageCreateSchema.extend({
  id: z.string().min(1, "Language id is required"),
});

export const skillCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  slug: slugField,
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0, "Sort order must be 0 or greater").default(0),
});

export const skillUpdateSchema = skillCreateSchema.extend({
  id: z.string().min(1, "Skill id is required"),
});

export const levelCreateSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(8, "Code must be at most 8 characters")
    .regex(/^[A-Za-z0-9]+$/, "Code must be letters and numbers only (e.g. A1)"),
  name: z.string().min(1, "Name is required").max(80),
  sortOrder: z.number().int().min(0, "Sort order must be 0 or greater").default(0),
});

export const levelUpdateSchema = levelCreateSchema.extend({
  id: z.string().min(1, "Level id is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LessonCreateInput = z.infer<typeof lessonCreateSchema>;
export type LessonUpdateInput = z.infer<typeof lessonUpdateSchema>;
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LanguageCreateInput = z.infer<typeof languageCreateSchema>;
export type LanguageUpdateInput = z.infer<typeof languageUpdateSchema>;
export type SkillCreateInput = z.infer<typeof skillCreateSchema>;
export type SkillUpdateInput = z.infer<typeof skillUpdateSchema>;
export type LevelCreateInput = z.infer<typeof levelCreateSchema>;
export type LevelUpdateInput = z.infer<typeof levelUpdateSchema>;
