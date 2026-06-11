import type { Language } from "@prisma/client";

type PrismaLanguageWithCount = Language & {
  _count?: { lessons: number };
};

export type AdminLanguage = {
  id: string;
  name: string;
  slug: string;
  code: string;
  description: string;
  flagEmoji: string;
  isActive: boolean;
  sortOrder: number;
  lessonCount: number;
};

export function toAdminLanguage(language: PrismaLanguageWithCount): AdminLanguage {
  return {
    id: language.id,
    name: language.name,
    slug: language.slug,
    code: language.code,
    description: language.description ?? "",
    flagEmoji: language.flagEmoji ?? "",
    isActive: language.isActive,
    sortOrder: language.sortOrder,
    lessonCount: language._count?.lessons ?? 0,
  };
}
