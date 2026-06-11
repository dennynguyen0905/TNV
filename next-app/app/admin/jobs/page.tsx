import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAllJobsForAdmin } from "@/server/services/adminJobService";
import { JobsClient } from "./JobsClient";

export const metadata: Metadata = { title: "Admin — Worker Jobs" };
export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  await requireAdmin();
  const jobs = await getAllJobsForAdmin();
  return <JobsClient initialJobs={jobs} />;
}
