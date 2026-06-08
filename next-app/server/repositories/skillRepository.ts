import { prisma } from "@/lib/prisma";

export async function getAllActiveSkills() {
  return prisma.skill.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getSkillBySlug(slug: string) {
  return prisma.skill.findUnique({ where: { slug } });
}
