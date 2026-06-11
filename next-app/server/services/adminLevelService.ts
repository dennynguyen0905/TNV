import * as levelRepo from "@/server/repositories/levelRepository";
import { toAdminLevel, type AdminLevel } from "@/server/mappers/levelMapper";

export async function getAllLevelsForAdmin(): Promise<AdminLevel[]> {
  const levels = await levelRepo.getAllLevelsForAdmin();
  return levels.map(toAdminLevel);
}

export async function createLevel(input: {
  code: string;
  name: string;
  sortOrder: number;
}): Promise<AdminLevel> {
  const code = input.code.trim().toUpperCase();

  const clash = await levelRepo.getLevelByCode(code);
  if (clash) throw new Error(`A level with code "${code}" already exists`);

  const created = await levelRepo.createLevel({
    code,
    name: input.name.trim(),
    sortOrder: input.sortOrder,
  });
  return toAdminLevel(created);
}

export async function updateLevel(input: {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
}): Promise<AdminLevel> {
  const existing = await levelRepo.getLevelById(input.id);
  if (!existing) throw new Error("Level not found");

  const code = input.code.trim().toUpperCase();

  const clash = await levelRepo.getLevelByCode(code);
  if (clash && clash.id !== input.id) {
    throw new Error(`A level with code "${code}" already exists`);
  }

  const updated = await levelRepo.updateLevel(input.id, {
    code,
    name: input.name.trim(),
    sortOrder: input.sortOrder,
  });
  return toAdminLevel(updated);
}
