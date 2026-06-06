import type { WorkerJobType } from "@/data/types";

export const JOB_TYPES: Record<string, WorkerJobType> = {
  GENERATE_PDF:     "GENERATE_PDF",
  PROCESS_AUDIO:    "PROCESS_AUDIO",
  INDEX_SEARCH:     "INDEX_SEARCH",
  REVALIDATE_CACHE: "REVALIDATE_CACHE",
};

export const JOB_TYPE_LABELS: Record<WorkerJobType, string> = {
  GENERATE_PDF:     "Generate PDF",
  PROCESS_AUDIO:    "Process Audio",
  INDEX_SEARCH:     "Index Search",
  REVALIDATE_CACHE: "Revalidate Cache",
};
