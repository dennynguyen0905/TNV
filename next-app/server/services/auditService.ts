import type { Prisma, User } from "@prisma/client";
import * as auditRepo from "@/server/repositories/auditLogRepository";
import { toAdminAuditLog, type AdminAuditLog } from "@/server/mappers/auditLogMapper";

/**
 * Audit actions are a small, fixed vocabulary. Keep them stable — they are the
 * filterable/queryable key for the trail.
 */
export const AUDIT_ACTIONS = {
  PUBLISH_LESSON: "PUBLISH_LESSON",
  UNPUBLISH_LESSON: "UNPUBLISH_LESSON",
  UPDATE_LESSON_STATUS: "UPDATE_LESSON_STATUS",
  DELETE_QUESTION: "DELETE_QUESTION",
  UPDATE_USER_ROLE: "UPDATE_USER_ROLE",
  UPDATE_USER_PREMIUM: "UPDATE_USER_PREMIUM",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

/**
 * Record an admin mutation in the audit trail.
 *
 * Best-effort: logging must never break the underlying admin action, so any
 * failure here is swallowed (and reported to the server console) rather than
 * thrown. Callers should treat this as fire-and-forget side effect.
 */
export async function recordAudit(input: {
  actor: Pick<User, "id" | "email"> | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  summary?: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await auditRepo.createAuditLog({
      actorId: input.actor?.id ?? null,
      actorEmail: input.actor?.email ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      summary: input.summary,
      metadata: input.metadata,
    });
  } catch (err) {
    console.error("[auditService] failed to record audit log:", err);
  }
}

export async function getRecentAuditLogs(limit = 100): Promise<AdminAuditLog[]> {
  const logs = await auditRepo.getRecentAuditLogs(limit);
  return logs.map(toAdminAuditLog);
}
