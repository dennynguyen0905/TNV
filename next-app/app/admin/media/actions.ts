"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { mediaCreateSchema, mediaUpdateSchema } from "@/lib/validators";
import * as adminMediaService from "@/server/services/adminMediaService";

type ActionResult = { ok: true } | { ok: false; error: string };

async function assertAdmin(): Promise<ActionResult | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { ok: false, error: "Unauthorized" };
  return null;
}

export async function createMediaAction(input: {
  type: string;
  url: string;
  filename: string;
  mimeType?: string;
  sizeBytes?: number;
  altText?: string;
  lessonId?: string;
}): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const parsed = mediaCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    await adminMediaService.createMedia(parsed.data);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create media" };
  }
}

export async function updateMediaAction(input: {
  id: string;
  type: string;
  url: string;
  filename: string;
  mimeType?: string;
  sizeBytes?: number;
  altText?: string;
  lessonId?: string;
}): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;

  const parsed = mediaUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }
  try {
    await adminMediaService.updateMedia(parsed.data);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to update media" };
  }
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;
  if (!id) return { ok: false, error: "Media id is required" };

  try {
    await adminMediaService.deleteMedia(id);
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete media" };
  }
}
