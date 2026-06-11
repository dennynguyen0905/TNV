"use server";

import { revalidatePath } from "next/cache";
import { WorkerJobType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import * as adminJobService from "@/server/services/adminJobService";

type ActionResult = { ok: true } | { ok: false; error: string };

async function assertAdmin(): Promise<ActionResult | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { ok: false, error: "Unauthorized" };
  return null;
}

const VALID_TYPES = Object.values(WorkerJobType) as string[];

export async function triggerJobAction(type: string): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;
  if (!VALID_TYPES.includes(type)) return { ok: false, error: "Invalid job type" };

  try {
    await adminJobService.triggerManualJob(type as WorkerJobType);
    revalidatePath("/admin/jobs");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to trigger job" };
  }
}

export async function retryJobAction(id: string): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;
  if (!id) return { ok: false, error: "Job id is required" };

  try {
    await adminJobService.retryJob(id);
    revalidatePath("/admin/jobs");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to retry job" };
  }
}

export async function cancelJobAction(id: string): Promise<ActionResult> {
  const authErr = await assertAdmin();
  if (authErr) return authErr;
  if (!id) return { ok: false, error: "Job id is required" };

  try {
    await adminJobService.cancelJob(id);
    revalidatePath("/admin/jobs");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to cancel job" };
  }
}
