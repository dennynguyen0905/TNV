"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { AdminJob } from "@/server/mappers/workerJobMapper";
import { triggerJobAction, retryJobAction, cancelJobAction } from "./actions";

const STATUS_OPTIONS = ["All", "QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELLED"] as const;
const TYPE_OPTIONS = ["All", "GENERATE_PDF", "PROCESS_AUDIO", "INDEX_SEARCH", "REVALIDATE_CACHE"] as const;

const TYPE_LABELS: Record<string, string> = {
  GENERATE_PDF: "Generate PDF",
  PROCESS_AUDIO: "Process Audio",
  INDEX_SEARCH: "Index Search",
  REVALIDATE_CACHE: "Revalidate Cache",
};

const STATUS_COLORS: Record<AdminJob["status"], "gray" | "blue" | "green" | "red" | "amber"> = {
  QUEUED: "amber",
  RUNNING: "blue",
  SUCCEEDED: "green",
  FAILED: "red",
  CANCELLED: "gray",
};

interface JobsClientProps {
  initialJobs: AdminJob[];
}

export function JobsClient({ initialJobs }: JobsClientProps) {
  const router = useRouter();
  const [jobs, setJobs] = useState<AdminJob[]>(initialJobs);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>("All");
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_OPTIONS)[number]>("All");
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [triggerType, setTriggerType] = useState<string>("GENERATE_PDF");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const filtered = jobs.filter((j) => {
    const matchStatus = statusFilter === "All" || j.status === statusFilter;
    const matchType = typeFilter === "All" || j.type === typeFilter;
    return matchStatus && matchType;
  });

  function run(action: () => Promise<{ ok: boolean; error?: string }>, okMsg?: string) {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        if (okMsg) setNotice(okMsg);
        router.refresh();
      } else {
        setError(res.error ?? "Action failed");
      }
    });
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Worker Jobs</h1>
          <p className="text-sm text-n-500 mt-1">
            {filtered.length} of {jobs.length} jobs · placeholder queue (no live worker)
          </p>
        </div>
        <Button onClick={() => setTriggerOpen(true)}>+ Trigger Job</Button>
      </div>

      {notice && (
        <div className="mb-4 px-4 py-3 rounded-card bg-green-50 border border-green-200 text-green-800 text-sm">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-card bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as (typeof STATUS_OPTIONS)[number])}
          className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as (typeof TYPE_OPTIONS)[number])}
          className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t === "All" ? "All types" : TYPE_LABELS[t] ?? t}</option>
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
                <th className="px-5 py-3 text-left font-medium text-n-500">Type</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Lesson</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Idempotency Key</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Tries</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Created</th>
                <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {filtered.map((job) => {
                const canCancel = job.status === "QUEUED" || job.status === "RUNNING";
                const canRetry = job.status === "FAILED";
                return (
                  <tr key={job.id} className="hover:bg-n-50 transition-colors">
                    <td className="px-5 py-3 text-n-700">{TYPE_LABELS[job.type] ?? job.type}</td>
                    <td className="px-5 py-3">
                      <Badge color={STATUS_COLORS[job.status]}>{job.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-n-500 text-xs">{job.lessonSlug ?? "—"}</td>
                    <td className="px-5 py-3 text-n-400 font-mono text-xs">{job.idempotencyKey}</td>
                    <td className="px-5 py-3 text-n-500">{job.attempts}</td>
                    <td className="px-5 py-3 text-n-400">{job.createdAt}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canRetry && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={isPending}
                            onClick={() => run(() => retryJobAction(job.id), "Job re-queued.")}
                          >
                            Retry
                          </Button>
                        )}
                        {canCancel && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={() => run(() => cancelJobAction(job.id), "Job cancelled.")}
                            className="text-n-500 hover:text-red-500"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={triggerOpen} onClose={() => setTriggerOpen(false)} title="Trigger Job">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-n-700">Job type</label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {TYPE_OPTIONS.filter((t) => t !== "All").map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-n-400">
            Queues a new placeholder job (status QUEUED). No real worker is connected.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setTriggerOpen(false)}>Cancel</Button>
            <Button
              disabled={isPending}
              onClick={() => {
                setTriggerOpen(false);
                run(() => triggerJobAction(triggerType), "Job queued.");
              }}
            >
              Queue Job
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
