"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { AdminUser } from "@/server/mappers/userMapper";
import {
  updateUserRoleAction,
  toggleUserPremiumAction,
  updateUserStatusAction,
  updateUserProfileAction,
} from "./actions";

const ROLE_OPTIONS = ["All", "ADMIN", "LEARNER"] as const;

interface UsersClientProps {
  initialUsers: AdminUser[];
  currentUserId: string;
}

export function UsersClient({ initialUsers, currentUserId }: UsersClientProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_OPTIONS)[number]>("All");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = users.filter((u) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  function patchUser(id: string, patch: Partial<AdminUser>) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  function handleRoleChange(user: AdminUser, role: AdminUser["role"]) {
    const prevRole = user.role;
    patchUser(user.id, { role });
    setError(null);
    startTransition(async () => {
      const res = await updateUserRoleAction({ id: user.id, role });
      if (!res.ok) {
        patchUser(user.id, { role: prevRole });
        setError(res.error);
      }
    });
  }

  function handleTogglePremium(user: AdminUser) {
    const next = !user.isPremium;
    patchUser(user.id, { isPremium: next });
    setError(null);
    startTransition(async () => {
      const res = await toggleUserPremiumAction({ id: user.id, isPremium: next });
      if (!res.ok) {
        patchUser(user.id, { isPremium: !next });
        setError(res.error);
      }
    });
  }

  function handleToggleStatus(user: AdminUser) {
    const next = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
    patchUser(user.id, { status: next });
    setError(null);
    startTransition(async () => {
      const res = await updateUserStatusAction({ id: user.id, status: next });
      if (!res.ok) {
        patchUser(user.id, { status: user.status });
        setError(res.error);
      }
    });
  }

  function openEdit(user: AdminUser) {
    setEditing(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setError(null);
  }

  function saveEdit() {
    if (!editing) return;
    const id = editing.id;
    const name = editName;
    const email = editEmail;
    setError(null);
    startTransition(async () => {
      const res = await updateUserProfileAction({ id, name, email });
      if (res.ok) {
        patchUser(id, { name: name.trim(), email: email.trim().toLowerCase() });
        setEditing(null);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold mb-1 text-n-900">Users</h1>
          <p className="text-[14px] text-n-500">
            {filtered.length} of {users.length} users
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-input border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as (typeof ROLE_OPTIONS)[number])}
          className="w-[160px] px-3 py-2 text-[14px] rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-n-700 font-medium"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r === "All" ? "All roles" : r}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-n-200 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-n-200">
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Role</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Premium</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Activity</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Joined</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-n-400">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((user, i) => {
                const isSelf = user.id === currentUserId;
                return (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-n-50 transition-colors ${i < filtered.length - 1 ? 'border-b border-n-100' : ''}`}
                  >
                    <td className="px-4 py-[14px]">
                      <span className="font-semibold text-n-900">{user.name}</span>
                      {isSelf && (
                        <span className="ml-2 text-[11px] text-n-400 uppercase tracking-wider font-bold">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-[14px] text-n-600 font-medium">{user.email}</td>
                    <td className="px-4 py-[14px]">
                      <select
                        value={user.role}
                        disabled={isSelf || isPending}
                        onChange={(e) =>
                          handleRoleChange(user, e.target.value as AdminUser["role"])
                        }
                        title={
                          isSelf ? "You cannot change your own role" : "Change role"
                        }
                        className="px-2 py-1 text-xs rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-n-700"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="LEARNER">LEARNER</option>
                      </select>
                    </td>
                    <td className="px-4 py-[14px]">
                      <button
                        onClick={() => handleTogglePremium(user)}
                        disabled={isPending}
                        title="Toggle premium"
                        className="focus:outline-none disabled:opacity-50"
                      >
                        {user.isPremium ? (
                          <Badge color="amber">Yes</Badge>
                        ) : (
                          <span className="text-n-300">—</span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-[14px]">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={isSelf || isPending}
                        title={
                          isSelf
                            ? "You cannot deactivate your own account"
                            : "Toggle active status"
                        }
                        className="focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Badge color={user.status === "ACTIVE" ? "green" : "gray"}>
                          {user.status === "ACTIVE" ? "Active" : "Disabled"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-[14px] text-n-500 text-[13px] whitespace-nowrap">
                      {user.attemptCount} attempts · {user.progressCount} lessons
                    </td>
                    <td className="px-4 py-[14px] text-n-400 text-[13px]">{user.createdAt}</td>
                    <td className="px-4 py-[14px]">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Edit User"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveEdit} disabled={isPending}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
