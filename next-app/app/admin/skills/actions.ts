"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { skillCreateSchema, skillUpdateSchema } from "@/lib/validators";
import * as adminSkillService from "@/server/services/adminSkillService";

type ActionResult = { ok: true } | { ok: false; error: string };

async function assertAdmin(): Promise<ActionResult | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { ok: false, error: "Unauthorized" };
  return null;
}

function revalidate() {
  revalidatePath("/admin/skills");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function createSkillAction(input: {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const parsed = skillCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    await adminSkillService.createSkill(parsed.data);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create skill" };
  }
}

export async function updateSkillAction(input: {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const parsed = skillUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    await adminSkillService.updateSkill(parsed.data);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update skill" };
  }
}

export async function toggleSkillActiveAction(input: {
  id: string;
  isActive: boolean;
}): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  if (!input.id) return { ok: false, error: "Skill id is required" };
  try {
    await adminSkillService.setSkillActive(input.id, input.isActive);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update skill" };
  }
}
