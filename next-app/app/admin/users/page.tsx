import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { MOCK_USERS } from "@/data/mock/users";

export const metadata: Metadata = { title: "Admin — Users" };

const roleColor: Record<string, "red" | "amber" | "blue"> = {
  ADMIN:   "red",
  EDITOR:  "amber",
  LEARNER: "blue",
};

export default function AdminUsersPage() {
  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Users</h1>
          <p className="text-sm text-n-500 mt-1">{MOCK_USERS.length} users total</p>
        </div>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-n-200 bg-n-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-n-500">Name</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Email</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Role</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Premium</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Status</th>
              <th className="px-5 py-3 text-left font-medium text-n-500">Joined</th>
              <th className="px-5 py-3 text-right font-medium text-n-500">Lessons</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-n-100">
            {MOCK_USERS.map((user) => (
              <tr key={user.id} className="hover:bg-n-50 transition-colors">
                <td className="px-5 py-3 font-medium text-n-800">{user.name}</td>
                <td className="px-5 py-3 text-n-500">{user.email}</td>
                <td className="px-5 py-3">
                  <Badge color={roleColor[user.role]}>{user.role}</Badge>
                </td>
                <td className="px-5 py-3">
                  {user.premium ? (
                    <Badge color="amber">Premium</Badge>
                  ) : (
                    <span className="text-n-400 text-xs">Free</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <Badge color={user.status === "active" ? "green" : "gray"}>
                    {user.status}
                  </Badge>
                </td>
                <td className="px-5 py-3 text-n-400">{user.joined}</td>
                <td className="px-5 py-3 text-right text-n-600">{user.lessonsCompleted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
