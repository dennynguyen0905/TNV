import { prisma } from "@/lib/prisma";
import { Prisma, WorkerJobStatus, WorkerJobType } from "@prisma/client";

export async function getAllJobs(filter?: {
  type?: WorkerJobType;
  status?: WorkerJobStatus;
}) {
  return prisma.workerJob.findMany({
    where: {
      ...(filter?.type ? { type: filter.type } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function getJobById(id: string) {
  return prisma.workerJob.findUnique({ where: { id } });
}

/** Idempotent enqueue: re-running with the same key re-queues the existing row. */
export async function upsertJob(data: {
  type: WorkerJobType;
  idempotencyKey: string;
  payload: Prisma.InputJsonValue;
}) {
  return prisma.workerJob.upsert({
    where: { idempotencyKey: data.idempotencyKey },
    update: {
      status: WorkerJobStatus.QUEUED,
      payload: data.payload,
      lastError: null,
    },
    create: {
      type: data.type,
      idempotencyKey: data.idempotencyKey,
      payload: data.payload,
      status: WorkerJobStatus.QUEUED,
    },
  });
}

export async function createJob(data: {
  type: WorkerJobType;
  idempotencyKey: string;
  payload: Prisma.InputJsonValue;
}) {
  return prisma.workerJob.create({
    data: {
      type: data.type,
      idempotencyKey: data.idempotencyKey,
      payload: data.payload,
      status: WorkerJobStatus.QUEUED,
    },
  });
}

export async function setJobStatus(
  id: string,
  status: WorkerJobStatus,
  extra?: { lastError?: string | null; attempts?: number }
) {
  return prisma.workerJob.update({
    where: { id },
    data: {
      status,
      ...(extra?.lastError !== undefined ? { lastError: extra.lastError } : {}),
      ...(extra?.attempts !== undefined ? { attempts: extra.attempts } : {}),
    },
  });
}

export async function countJobsByStatus(status: WorkerJobStatus) {
  return prisma.workerJob.count({ where: { status } });
}
