import { slugify } from "@/lib/utils";
import * as skillRepo from "@/server/repositories/skillRepository";
import { toAdminSkill, type AdminSkill } from "@/server/mappers/skillMapper";

export async function getAllSkillsForAdmin(): Promise<AdminSkill[]> {
  const skills = await skillRepo.getAllSkillsForAdmin();
  return skills.map(toAdminSkill);
}

export async function createSkill(input: {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}): Promise<AdminSkill> {
  const slug = slugify(input.slug || input.name);

  const clash = await skillRepo.findSkillBySlug(slug);
  if (clash) throw new Error(`A skill with slug "${slug}" already exists`);

  const created = await skillRepo.createSkill({
    name: input.name.trim(),
    slug,
    description: input.description?.trim() || undefined,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  });
  return toAdminSkill(created);
}

export async function updateSkill(input: {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}): Promise<AdminSkill> {
  const existing = await skillRepo.getSkillById(input.id);
  if (!existing) throw new Error("Skill not found");

  const slug = slugify(input.slug || input.name);

  const clash = await skillRepo.findSkillBySlug(slug);
  if (clash && clash.id !== input.id) {
    throw new Error(`A skill with slug "${slug}" already exists`);
  }

  const updated = await skillRepo.updateSkill(input.id, {
    name: input.name.trim(),
    slug,
    description: input.description?.trim() || null,
    isActive: input.isActive,
    sortOrder: input.sortOrder,
  });
  return toAdminSkill(updated);
}

export async function setSkillActive(
  id: string,
  isActive: boolean
): Promise<AdminSkill> {
  const existing = await skillRepo.getSkillById(id);
  if (!existing) throw new Error("Skill not found");
  const updated = await skillRepo.updateSkill(id, { isActive });
  return toAdminSkill(updated);
}
