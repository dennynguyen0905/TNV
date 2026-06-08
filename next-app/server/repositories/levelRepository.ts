import { prisma } from "@/lib/prisma";

export async function getAllLevels() {
  return prisma.level.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getLevelByCode(code: string) {
  return prisma.level.findUnique({ where: { code } });
}
