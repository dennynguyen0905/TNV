import { WorkerJobStatus, WorkerJobType } from "@prisma/client";
import * as jobRepo from "@/server/repositories/workerJobRepository";
import { toAdminJob, type AdminJob } from "@/server/mappers/workerJobMapper";

/**
 * Worker jobs are a PLACEHOLDER: rows are recorded in the database but no real
 * background worker / queue (Redis, etc.) processes them. They exist so the
 * publish workflow and admin UI behave realistically.
 */

/** Job types fired automatically when a lesson is published. */
const PUBLISH_JOB_TYPES: WorkerJobType[] = [
  WorkerJobType.INDEX_SEARCH,
  WorkerJobType.REVALIDATE_CACHE,
  WorkerJobType.GENERATE_PDF,
];

/**
 * Enqueue the standard placeholder jobs for a lesson publish. Idempotent per
 * lesson+type, so re-publishing the same lesson re-queues the existing rows
 * rather than creating duplicates.
 */
export async function enqueueLessonPublishJobs(lessonId: string, lessonSlug: string) {
  await Promise.all(
    PUBLISH_JOB_TYPES.map((type) =>
      jobRepo.upsertJob({
        type,
        idempotencyKey: `publish:${lessonId}:${type}`,
        payload: { lessonId, lessonSlug, triggeredBy: "publish" },
      })
    )
  );
}

export async function getAllJobsForAdmin(filter?: {
  type?: WorkerJobType;
  status?: WorkerJobStatus;
}): Promise<AdminJob[]> {
  const jobs = await jobRepo.getAllJobs(filter);
  return jobs.map(toAdminJob);
}

/** Manually queue a one-off placeholder job from the admin UI. */
export async function triggerManualJob(type: WorkerJobType): Promise<AdminJob> {
  const job = await jobRepo.createJob({
    type,
    idempotencyKey: `manual:${type}:${Date.now()}`,
    payload: { triggeredBy: "admin" },
  });
  return toAdminJob(job);
}

/** Re-queue a failed job (placeholder retry). */
export async function retryJob(id: string): Promise<AdminJob> {
  const job = await jobRepo.getJobById(id);
  if (!job) throw new Error("Job not found");
  if (job.status !== WorkerJobStatus.FAILED) {
    throw new Error("Only failed jobs can be retried");
  }
  const updated = await jobRepo.setJobStatus(id, WorkerJobStatus.QUEUED, {
    lastError: null,
    attempts: job.attempts + 1,
  });
  return toAdminJob(updated);
}

/** Cancel a queued/running job. */
export async function cancelJob(id: string): Promise<AdminJob> {
  const job = await jobRepo.getJobById(id);
  if (!job) throw new Error("Job not found");
  if (job.status !== WorkerJobStatus.QUEUED && job.status !== WorkerJobStatus.RUNNING) {
    throw new Error("Only queued or running jobs can be cancelled");
  }
  const updated = await jobRepo.setJobStatus(id, WorkerJobStatus.CANCELLED);
  return toAdminJob(updated);
}
