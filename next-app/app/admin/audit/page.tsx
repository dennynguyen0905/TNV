import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getRecentAuditLogs } from "@/server/services/auditService";

export const metadata: Metadata = { title: "Admin — Audit Log" };
export const dynamic = "force-dynamic";

const ACTION_COLOR: Record<string, "blue" | "green" | "amber" | "red" | "gray" | "purple"> = {
  PUBLISH_LESSON: "green",
  UNPUBLISH_LESSON: "amber",
  UPDATE_LESSON_STATUS: "gray",
  DELETE_QUESTION: "red",
  UPDATE_USER_ROLE: "blue",
  UPDATE_USER_PREMIUM: "purple",
};

export default async function AdminAuditPage() {
  await requireAdmin();
  const logs = await getRecentAuditLogs(100);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-n-900">Audit Log</h1>
        <p className="text-sm text-n-500 mt-1">
          {logs.length} most recent admin action{logs.length !== 1 ? "s" : ""} · read-only
        </p>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {logs.length === 0 ? (
          <EmptyState
            icon="file-text"
            title="No admin actions recorded yet"
            description="Publishing lessons, changing user roles, or deleting questions will appear here."
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-n-200 bg-n-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-n-500">When</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Action</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Details</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Actor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-n-50 transition-colors align-top">
                  <td className="px-5 py-3 text-n-400 whitespace-nowrap font-mono text-xs">
                    {log.createdAt}
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={ACTION_COLOR[log.action] ?? "gray"}>{log.action}</Badge>
                  </td>
                  <td className="px-5 py-3 text-n-700">
                    {log.summary ?? `${log.entityType} ${log.entityId ?? ""}`}
                  </td>
                  <td className="px-5 py-3 text-n-500 text-xs">{log.actorEmail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
