"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { levelCreateSchema, levelUpdateSchema } from "@/lib/validators";
import * as adminLevelService from "@/server/services/adminLevelService";

type ActionResult = { ok: true } | { ok: false; error: string };

async function assertAdmin(): Promise<ActionResult | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { ok: false, error: "Unauthorized" };
  return null;
}

function revalidate() {
  revalidatePath("/admin/levels");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function createLevelAction(input: {
  code: string;
  name: string;
  sortOrder: number;
}): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const parsed = levelCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    await adminLevelService.createLevel(parsed.data);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create level" };
  }
}

export async function updateLevelAction(input: {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
}): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const parsed = levelUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    await adminLevelService.updateLevel(parsed.data);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update level" };
  }
}
