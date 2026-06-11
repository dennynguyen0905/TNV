"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import * as adminQuestionService from "@/server/services/adminQuestionService";
import { recordAudit, AUDIT_ACTIONS } from "@/server/services/auditService";

type ActionResult = { ok: true } | { ok: false; error: string };

const deleteSchema = z.object({ id: z.string().min(1, "Question id is required") });

export async function deleteQuestionAction(input: { id: string }): Promise<ActionResult> {
  const actor = await getCurrentUser();
  if (!actor || actor.role !== "ADMIN") return { ok: false, error: "Unauthorized" };

  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed" };
  }

  try {
    const deleted = await adminQuestionService.deleteQuestion(parsed.data.id);
    await recordAudit({
      actor,
      action: AUDIT_ACTIONS.DELETE_QUESTION,
      entityType: "Question",
      entityId: parsed.data.id,
      summary: `Deleted question from "${deleted.lessonTitle}"`,
      metadata: { lessonId: deleted.lessonId, prompt: deleted.prompt.slice(0, 120) },
    });
    revalidatePath("/admin/questions");
    revalidatePath(`/admin/lessons/${deleted.lessonId}/edit`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to delete question" };
  }
}
