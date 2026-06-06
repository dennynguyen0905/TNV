import type { WorkerJobStatus } from "@/data/types";

export const JOB_STATUSES: Record<string, WorkerJobStatus> = {
  PENDING:   "PENDING",
  RUNNING:   "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED:    "FAILED",
  CANCELLED: "CANCELLED",
};

export const JOB_STATUS_COLORS: Record<WorkerJobStatus, string> = {
  PENDING:   "gray",
  RUNNING:   "blue",
  COMPLETED: "green",
  FAILED:    "red",
  CANCELLED: "amber",
};
