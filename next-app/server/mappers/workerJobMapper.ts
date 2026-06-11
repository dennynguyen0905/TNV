import type { WorkerJob, WorkerJobStatus, WorkerJobType } from "@prisma/client";

export type AdminJob = {
  id: string;
  type: WorkerJobType;
  status: WorkerJobStatus;
  idempotencyKey: string;
  attempts: number;
  lastError: string | null;
  lessonId: string | null;
  lessonSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

function readString(payload: WorkerJob["payload"], key: string): string | null {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const value = (payload as Record<string, unknown>)[key];
    if (typeof value === "string") return value;
  }
  return null;
}

export function toAdminJob(job: WorkerJob): AdminJob {
  return {
    id: job.id,
    type: job.type,
    status: job.status,
    idempotencyKey: job.idempotencyKey,
    attempts: job.attempts,
    lastError: job.lastError,
    lessonId: readString(job.payload, "lessonId"),
    lessonSlug: readString(job.payload, "lessonSlug"),
    createdAt: job.createdAt.toISOString().replace("T", " ").slice(0, 16),
    updatedAt: job.updatedAt.toISOString().replace("T", " ").slice(0, 16),
  };
}
