import type { LessonStatus } from "@/data/types";

export const LESSON_STATUSES: Record<string, LessonStatus> = {
  PUBLISHED: "Published",
  DRAFT:     "Draft",
  REVIEW:    "Review",
  ARCHIVED:  "Archived",
};

export const LESSON_STATUS_COLORS: Record<LessonStatus, string> = {
  Published: "green",
  Draft:     "amber",
  Review:    "blue",
  Archived:  "gray",
};
