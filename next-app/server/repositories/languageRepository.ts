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
