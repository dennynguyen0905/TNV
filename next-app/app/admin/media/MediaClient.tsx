"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { MediaForm, type MediaFormValues } from "@/components/admin/MediaForm";
import type { AdminMedia } from "@/server/mappers/mediaMapper";
import { createMediaAction, updateMediaAction, deleteMediaAction } from "./actions";

const TYPE_OPTIONS = ["All", "AUDIO", "IMAGE", "PDF", "OTHER"] as const;

const TYPE_COLOR: Record<AdminMedia["type"], "blue" | "amber" | "green" | "gray"> = {
  AUDIO: "blue",
  PDF: "amber",
  IMAGE: "green",
  OTHER: "gray",
};

interface MediaClientProps {
  initialMedia: AdminMedia[];
  lessons: { id: string; title: string }[];
}

export function MediaClient({ initialMedia, lessons }: MediaClientProps) {
  const router = useRouter();
  const [media, setMedia] = useState<AdminMedia[]>(initialMedia);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof TYPE_OPTIONS)[number]>("All");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMedia | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMedia(initialMedia);
  }, [initialMedia]);

  const filtered = media.filter((m) => {
    const s = search.toLowerCase();
    const matchSearch =
      !s ||
      m.filename.toLowerCase().includes(s) ||
      (m.lessonTitle ?? "").toLowerCase().includes(s);
    const matchType = typeFilter === "All" || m.type === typeFilter;
    return matchSearch && matchType;
  });

  function openNew() {
    setEditing(null);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(m: AdminMedia) {
    setEditing(m);
    setFormError(null);
    setFormOpen(true);
  }

  function handleSubmit(values: MediaFormValues) {
    setFormError(null);
    startTransition(async () => {
      const res = editing
        ? await updateMediaAction({ id: editing.id, ...values })
        : await createMediaAction(values);
      if (res.ok) {
        setFormOpen(false);
        router.refresh();
      } else {
        setFormError(res.error);
      }
    });
  }

  function confirmDelete() {
    if (!deletingId) return;
    const id = deletingId;
    setDeletingId(null);
    setError(null);
    startTransition(async () => {
      const res = await deleteMediaAction(id);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Media</h1>
          <p className="text-sm text-n-500 mt-1">
            {filtered.length} of {media.length} assets · metadata only (no file storage)
          </p>
        </div>
        <Button onClick={openNew}>
          <Icon name="plus" size={16} />
          New Media
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-input border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search filename or lesson…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as (typeof TYPE_OPTIONS)[number])}
          className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t === "All" ? "All types" : t}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-n-400">
            <Icon name="image" size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No media assets yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-n-200 bg-n-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-n-500">File</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Type</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Lesson</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">URL</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Added</th>
                <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-n-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-n-800 font-mono text-xs">{m.filename}</td>
                  <td className="px-5 py-3">
                    <Badge color={TYPE_COLOR[m.type]}>{m.type}</Badge>
                  </td>
                  <td className="px-5 py-3 text-n-600">{m.lessonTitle ?? "—"}</td>
                  <td className="px-5 py-3 text-n-400 font-mono text-xs truncate max-w-[180px]">{m.url}</td>
                  <td className="px-5 py-3 text-n-400">{m.createdAt}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(m)}>
                        <Icon name="edit" size={14} />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingId(m.id)}
                        className="hover:text-red-500"
                      >
                        <Icon name="trash" size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <MediaForm
        open={formOpen}
        initial={editing}
        lessons={lessons}
        pending={isPending}
        error={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <Modal open={deletingId !== null} onClose={() => setDeletingId(null)} title="Delete Media">
        <p className="text-sm text-n-700 mb-6">
          Delete &ldquo;{media.find((m) => m.id === deletingId)?.filename}&rdquo;? This removes the
          metadata record only and cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeletingId(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
