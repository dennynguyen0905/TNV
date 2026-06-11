import type { AuditLog } from "@prisma/client";

export type AdminAuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorEmail: string | null;
  summary: string | null;
  createdAt: string;
};

export function toAdminAuditLog(log: AuditLog): AdminAuditLog {
  return {
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    actorEmail: log.actorEmail,
    summary: log.summary,
    createdAt: log.createdAt.toISOString().replace("T", " ").slice(0, 19),
  };
}
