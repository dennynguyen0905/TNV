import type { SkillName, SkillColor } from "@/data/types";

export const SKILL_ICONS: Record<SkillName, string> = {
  Reading:    "book",
  Listening:  "headphones",
  Dictation:  "edit",
  Grammar:    "layers",
  Vocabulary: "grid",
};

export const SKILL_COLORS: Record<SkillName, SkillColor> = {
  Reading:    { bg: "#EEF2FF", accent: "#2563EB" },
  Listening:  { bg: "#FDF4FF", accent: "#A855F7" },
  Dictation:  { bg: "#ECFDF5", accent: "#059669" },
  Grammar:    { bg: "#FFFBEB", accent: "#D97706" },
  Vocabulary: { bg: "#FFF1F2", accent: "#F43F5E" },
};
