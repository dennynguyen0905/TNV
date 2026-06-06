"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MOCK_WORKER_JOBS } from "@/data/mock/worker-jobs";
import { JOB_TYPE_LABELS } from "@/data/constants/job-types";
import { JOB_STATUS_COLORS } from "@/data/constants/job-statuses";
import type { WorkerJob, WorkerJobStatus, WorkerJobType } from "@/data/types";

const STATUS_OPTIONS: Array<"All" | WorkerJobStatus> = [
  "All", "PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED",
];
const TYPE_OPTIONS: Array<"All" | WorkerJobType> = [
  "All", "GENERATE_PDF", "PROCESS_AUDIO", "INDEX_SEARCH", "REVALIDATE_CACHE",
];

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<WorkerJob[]>(MOCK_WORKER_JOBS);
  const [statusFilter, setStatusFilter] = useState<"All" | WorkerJobStatus>("All");
  const [typeFilter, setTypeFilter] = useState<"All" | WorkerJobType>("All");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [triggerType, setTriggerType] = useState<WorkerJobType>("GENERATE_PDF");
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);

  const filtered = jobs.filter((j) => {
    const matchStatus = statusFilter === "All" || j.status === statusFilter;
    const matchType   = typeFilter === "All" || j.type === typeFilter;
    return matchStatus && matchType;
  });

  const confirmCancel = () => {
    if (!cancellingId) return;
    setJobs((prev) =>
      prev.map((j) =>
        j.id === cancellingId ? { ...j, status: "CANCELLED" as WorkerJobStatus } : j
      )
    );
    setCancellingId(null);
  };

  const handleTrigger = () => {
    const newJob: WorkerJob = {
      id: `job-${Date.now()}`,
      type: triggerType,
      status: "PENDING",
      idempotencyKey: `manual-${triggerType.toLowerCase()}-${Date.now()}`,
      payload: {},
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
      updatedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setJobs((prev) => [newJob, ...prev]);
    setTriggerOpen(false);
    setTriggerMessage(`Job ${newJob.id} queued as PENDING.`);
    setTimeout(() => setTriggerMessage(null), 4000);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Worker Jobs</h1>
          <p className="text-sm text-n-500 mt-1">{filtered.length} of {jobs.length} jobs</p>
        </div>
        <Button onClick={() => setTriggerOpen(true)}>
          + Trigger Job
        </Button>
      </div>

      {triggerMessage && (
        <div className="mb-4 px-4 py-3 rounded-card bg-green-50 border border-green-200 text-green-800 text-sm">
          {triggerMessage}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "All" | WorkerJobStatus)}
          className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "All" | WorkerJobType)}
          className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t === "All" ? "All types" : JOB_TYPE_LABELS[t as WorkerJobType] ?? t}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-n-400">
            <p className="text-sm">No jobs match your filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-n-200 bg-n-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-n-500">ID</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Type</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Idempotency Key</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Created</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Updated</th>
                <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {filtered.map((job) => {
                const statusColor = JOB_STATUS_COLORS[job.status as WorkerJobStatus] as "gray" | "blue" | "green" | "red" | "amber";
                const canCancel = job.status === "PENDING" || job.status === "RUNNING";
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
                    <td className="px-5 py-3 text-right">
                      {canCancel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancellingId(job.id)}
                          className="hover:text-red-500 text-n-500"
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Cancel confirmation */}
      <Modal open={cancellingId !== null} onClose={() => setCancellingId(null)} title="Cancel Job">
        <p className="text-sm text-n-700 mb-6">
          Cancel job <code className="font-mono text-xs bg-n-100 px-1 rounded">{cancellingId}</code>?
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCancellingId(null)}>Keep running</Button>
          <Button variant="danger" onClick={confirmCancel}>Cancel job</Button>
        </div>
      </Modal>

      {/* Trigger job modal */}
      <Modal open={triggerOpen} onClose={() => setTriggerOpen(false)} title="Trigger Job">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-n-700">Job type</label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value as WorkerJobType)}
              className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {TYPE_OPTIONS.filter((t) => t !== "All").map((t) => (
                <option key={t} value={t}>
                  {JOB_TYPE_LABELS[t as WorkerJobType] ?? t}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-n-400">
            This will queue a new PENDING job. No real worker is connected in mock mode.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setTriggerOpen(false)}>Cancel</Button>
            <Button onClick={handleTrigger}>Queue Job</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
