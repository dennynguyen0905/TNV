import type { WorkerJob } from "@/data/types";

export const MOCK_WORKER_JOBS: WorkerJob[] = [
  { id: "job-001", type: "GENERATE_PDF",     status: "COMPLETED", idempotencyKey: "pdf-lesson-1-v1",     payload: { lessonId: 1 }, createdAt: "2026-06-05 10:00", updatedAt: "2026-06-05 10:01" },
  { id: "job-002", type: "PROCESS_AUDIO",    status: "COMPLETED", idempotencyKey: "audio-lesson-5-v1",   payload: { lessonId: 5 }, createdAt: "2026-06-05 09:30", updatedAt: "2026-06-05 09:45" },
  { id: "job-003", type: "INDEX_SEARCH",     status: "COMPLETED", idempotencyKey: "index-batch-20260605", payload: { batch: 1 },   createdAt: "2026-06-05 09:00", updatedAt: "2026-06-05 09:02" },
  { id: "job-004", type: "GENERATE_PDF",     status: "FAILED",    idempotencyKey: "pdf-lesson-4-v1",     payload: { lessonId: 4 }, createdAt: "2026-06-04 18:00", updatedAt: "2026-06-04 18:00" },
  { id: "job-005", type: "REVALIDATE_CACHE", status: "PENDING",   idempotencyKey: "cache-revalidate-v3",  payload: { scope: "all" }, createdAt: "2026-06-06 08:00", updatedAt: "2026-06-06 08:00" },
  { id: "job-006", type: "PROCESS_AUDIO",    status: "RUNNING",   idempotencyKey: "audio-lesson-8-v1",   payload: { lessonId: 8 }, createdAt: "2026-06-06 08:05", updatedAt: "2026-06-06 08:06" },
];
