import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { MOCK_WORKER_JOBS } from "@/data/mock/worker-jobs";
import { JOB_TYPE_LABELS } from "@/data/constants/job-types";
import { JOB_STATUS_COLORS } from "@/data/constants/job-statuses";
import type { WorkerJobStatus, WorkerJobType } from "@/data/types";

export const metadata: Metadata = { title: "Admin — Jobs" };

export default function AdminJobsPage() {
  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Worker Jobs</h1>
          <p className="text-sm text-n-500 mt-1">{MOCK_WORKER_JOBS.length} jobs</p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-n-200 bg-n-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-n-500">ID</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Type</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Status</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Idempotency Key</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Created</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-n-100">
            {MOCK_WORKER_JOBS.map((job) => {
              const statusColor = JOB_STATUS_COLORS[job.status as WorkerJobStatus] as "gray" | "blue" | "green" | "red" | "amber";
              return (
                <tr key={job.id} className="hover:bg-n-50 transition-colors">
                  <td className="px-5 py-3 text-n-400 font-mono text-xs">{job.id}</td>
                  <td className="px-5 py-3 text-n-700">
                    {JOB_TYPE_LABELS[job.type as WorkerJobType] ?? job.type}
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={statusColor}>{job.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-n-400 font-mono text-xs">{job.idempotencyKey}</td>
                  <td className="px-5 py-3 text-n-400">{job.createdAt}</td>
                  <td className="px-5 py-3 text-n-400">{job.updatedAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
