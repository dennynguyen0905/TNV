import type { Skill } from "@prisma/client";

type PrismaSkillWithCount = Skill & {
  _count?: { lessons: number };
};

export type AdminSkill = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  lessonCount: number;
};

export function toAdminSkill(skill: PrismaSkillWithCount): AdminSkill {
  return {
    id: skill.id,
    name: skill.name,
    slug: skill.slug,
    description: skill.description ?? "",
    isActive: skill.isActive,
    sortOrder: skill.sortOrder,
    lessonCount: skill._count?.lessons ?? 0,
  };
}
