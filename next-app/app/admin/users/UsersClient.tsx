"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
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
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Users</h1>
          <p className="text-sm text-n-500 mt-1">
            {filtered.length} of {users.length} users
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

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
          onChange={(e) => setRoleFilter(e.target.value as (typeof ROLE_OPTIONS)[number])}
          className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r === "All" ? "All roles" : r}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {users.length === 0 ? (
          <EmptyState
            icon="users"
            title="No users yet"
            description="Accounts created via registration or the seed will appear here."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="users"
            title="No users match your filters"
            description="Try a different search term or role filter."
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-n-200 bg-n-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-n-500">Name</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Email</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Role</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Premium</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Activity</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Joined</th>
                <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {filtered.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <tr key={user.id} className="hover:bg-n-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-medium text-n-800">{user.name}</span>
                      {isSelf && (
                        <span className="ml-2 text-xs text-n-400">(you)</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-n-500">{user.email}</td>
                    <td className="px-5 py-3">
                      <select
                        value={user.role}
                        disabled={isSelf || isPending}
                        onChange={(e) =>
                          handleRoleChange(user, e.target.value as AdminUser["role"])
                        }
                        title={
                          isSelf ? "You cannot change your own role" : "Change role"
                        }
                        className="px-2 py-1 text-xs rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="LEARNER">LEARNER</option>
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleTogglePremium(user)}
                        disabled={isPending}
                        title="Toggle premium"
                        className="focus:outline-none disabled:opacity-50"
                      >
                        {user.isPremium ? (
                          <Badge color="amber">Premium</Badge>
                        ) : (
                          <span className="text-xs text-n-300 hover:text-n-500">Free</span>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3">
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
                    <td className="px-5 py-3 text-n-500 text-xs whitespace-nowrap">
                      {user.attemptCount} attempts · {user.progressCount} lessons
                    </td>
                    <td className="px-5 py-3 text-n-400">{user.createdAt}</td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(user)}>
                        <Icon name="edit" size={14} />
                        Edit
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
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
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={isPending}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
