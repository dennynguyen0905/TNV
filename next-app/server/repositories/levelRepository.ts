import { prisma } from "@/lib/prisma";

export async function getAllLevels() {
  return prisma.level.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getLevelByCode(code: string) {
  return prisma.level.findUnique({ where: { code } });
}

export async function getAllLevelsForAdmin() {
  return prisma.level.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { lessons: true } } },
  });
}

export async function getLevelById(id: string) {
  return prisma.level.findUnique({ where: { id } });
}

export async function createLevel(data: {
  code: string;
  name: string;
  sortOrder: number;
}) {
  return prisma.level.create({ data });
}

export async function updateLevel(
  id: string,
  data: Partial<{
    code: string;
    name: string;
    sortOrder: number;
  }>
) {
  return prisma.level.update({ where: { id }, data });
}

export async function countLessonsForLevel(id: string) {
  return prisma.lesson.count({ where: { levelId: id } });
}

export async function countLevels() {
  return prisma.level.count();
}
