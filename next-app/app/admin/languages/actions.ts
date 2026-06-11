"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { languageCreateSchema, languageUpdateSchema } from "@/lib/validators";
import * as adminLanguageService from "@/server/services/adminLanguageService";

type ActionResult = { ok: true } | { ok: false; error: string };

async function assertAdmin(): Promise<ActionResult | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { ok: false, error: "Unauthorized" };
  return null;
}

function revalidate() {
  revalidatePath("/admin/languages");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function createLanguageAction(input: {
  name: string;
  slug: string;
  code: string;
  description?: string;
  flagEmoji?: string;
  isActive: boolean;
  sortOrder: number;
}): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const parsed = languageCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    await adminLanguageService.createLanguage(parsed.data);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create language" };
  }
}

export async function updateLanguageAction(input: {
  id: string;
  name: string;
  slug: string;
  code: string;
  description?: string;
  flagEmoji?: string;
  isActive: boolean;
  sortOrder: number;
}): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const parsed = languageUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    await adminLanguageService.updateLanguage(parsed.data);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update language" };
  }
}

export async function toggleLanguageActiveAction(input: {
  id: string;
  isActive: boolean;
}): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  if (!input.id) return { ok: false, error: "Language id is required" };
  try {
    await adminLanguageService.setLanguageActive(input.id, input.isActive);
    revalidate();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update language" };
  }
}
