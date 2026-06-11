import { prisma } from "@/lib/prisma";

export async function getAllActiveLanguages() {
  return prisma.language.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getLanguageBySlug(slug: string) {
  return prisma.language.findUnique({ where: { slug } });
}

export async function getAllLanguagesForAdmin() {
  return prisma.language.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { lessons: true } } },
  });
}

export async function getLanguageById(id: string) {
  return prisma.language.findUnique({ where: { id } });
}

export async function findLanguageBySlugOrCode(slug: string, code: string) {
  return prisma.language.findFirst({
    where: { OR: [{ slug }, { code }] },
  });
}

export async function createLanguage(data: {
  name: string;
  slug: string;
  code: string;
  description?: string;
  flagEmoji?: string;
  isActive: boolean;
  sortOrder: number;
}) {
  return prisma.language.create({ data });
}

export async function updateLanguage(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    code: string;
    description: string | null;
    flagEmoji: string | null;
    isActive: boolean;
    sortOrder: number;
  }>
) {
  return prisma.language.update({ where: { id }, data });
}

export async function countLessonsForLanguage(id: string) {
  return prisma.lesson.count({ where: { languageId: id } });
}

export async function countLanguages() {
  return prisma.language.count();
}

export async function countActiveLanguages() {
  return prisma.language.count({ where: { isActive: true } });
}
