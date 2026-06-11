import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAllUsersForAdmin } from "@/server/services/adminUserService";
import { UsersClient } from "./UsersClient";

export const metadata: Metadata = { title: "Admin — Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireAdmin();
  const users = await getAllUsersForAdmin();
  return <UsersClient initialUsers={users} currentUserId={admin.id} />;
}
