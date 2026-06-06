"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { MOCK_USERS } from "@/data/mock/users";
import type { User, UserRole } from "@/data/types";

const roleColor: Record<UserRole, "red" | "amber" | "blue"> = {
  ADMIN:   "red",
  EDITOR:  "amber",
  LEARNER: "blue",
};

const ROLE_OPTIONS: Array<"All" | UserRole> = ["All", "ADMIN", "EDITOR", "LEARNER"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = users.filter((u) => {
    const s = search.toLowerCase();
    const matchSearch = !s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    const matchRole   = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const togglePremium = (id: number) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, premium: !u.premium } : u));

  const confirmDelete = () => {
    if (deletingId === null) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingId));
    setDeletingId(null);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Users</h1>
          <p className="text-sm text-n-500 mt-1">{filtered.length} of {users.length} users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as "All" | UserRole)}
          className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r === "All" ? "All roles" : r}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-n-400">
            <Icon name="users" size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No users match your filters.</p>
          </div>
        ) : (
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
                <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-n-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-n-800">{user.name}</td>
                  <td className="px-5 py-3 text-n-500">{user.email}</td>
                  <td className="px-5 py-3">
                    <Badge color={roleColor[user.role]}>{user.role}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => togglePremium(user.id)}
                      title="Toggle premium"
                      className="focus:outline-none"
                    >
                      {user.premium
                        ? <Badge color="amber">Premium</Badge>
                        : <span className="text-xs text-n-300 hover:text-n-500">Free</span>}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={user.status === "active" ? "green" : "gray"}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-n-400">{user.joined}</td>
                  <td className="px-5 py-3 text-right text-n-600">{user.lessonsCompleted}</td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingId(user.id)}
                      className="hover:text-red-500"
                    >
                      <Icon name="trash" size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={deletingId !== null} onClose={() => setDeletingId(null)} title="Delete User">
        <p className="text-sm text-n-700 mb-6">
          Delete &ldquo;{users.find((u) => u.id === deletingId)?.name}&rdquo;? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeletingId(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
