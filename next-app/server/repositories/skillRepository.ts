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

export async function getAllSkillsForAdmin() {
  return prisma.skill.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { lessons: true } } },
  });
}

export async function getSkillById(id: string) {
  return prisma.skill.findUnique({ where: { id } });
}

export async function findSkillBySlug(slug: string) {
  return prisma.skill.findUnique({ where: { slug } });
}

export async function createSkill(data: {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}) {
  return prisma.skill.create({ data });
}

export async function updateSkill(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string | null;
    isActive: boolean;
    sortOrder: number;
  }>
) {
  return prisma.skill.update({ where: { id }, data });
}

export async function countLessonsForSkill(id: string) {
  return prisma.lesson.count({ where: { skillId: id } });
}

export async function countSkills() {
  return prisma.skill.count();
}
