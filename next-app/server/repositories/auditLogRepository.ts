import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function createAuditLog(data: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.auditLog.create({
    data: {
      actorId: data.actorId ?? null,
      actorEmail: data.actorEmail ?? null,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId ?? null,
      summary: data.summary ?? null,
      metadata: data.metadata ?? {},
    },
  });
}

export async function getRecentAuditLogs(limit = 100) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function countAuditLogs() {
  return prisma.auditLog.count();
}
