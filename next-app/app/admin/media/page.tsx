"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Icon } from "@/components/ui/Icon";
import { MOCK_MEDIA_ASSETS } from "@/data/mock/media-assets";
import type { MediaAsset } from "@/data/types";

const TYPE_OPTIONS = ["All", "audio/mpeg", "application/pdf"];
const TYPE_LABELS: Record<string, string> = {
  "audio/mpeg":       "Audio MP3",
  "application/pdf":  "PDF",
};

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>(MOCK_MEDIA_ASSETS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = assets.filter((a) => {
    const s = search.toLowerCase();
    const matchSearch = !s || a.fileName.toLowerCase().includes(s) || a.lessonTitle.toLowerCase().includes(s);
    const matchType   = typeFilter === "All" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  const confirmDelete = () => {
    if (deletingId === null) return;
    setAssets((prev) => prev.filter((a) => a.id !== deletingId));
    setDeletingId(null);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Media</h1>
          <p className="text-sm text-n-500 mt-1">{filtered.length} of {assets.length} assets</p>
        </div>
      </div>

      {/* Filters */}
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
          onChange={(e) => setTypeFilter(e.target.value)}
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
            <Icon name="image" size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No assets match your filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-n-200 bg-n-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-n-500">File</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Type</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Lesson</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Size</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Uploaded</th>
                <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {filtered.map((asset) => (
                <tr key={asset.id} className="hover:bg-n-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Icon
                        name={asset.type === "audio/mpeg" ? "headphones" : "file-text"}
                        size={16}
                        className="text-n-400 shrink-0"
                      />
                      <span className="font-medium text-n-800 font-mono text-xs">{asset.fileName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={asset.type === "audio/mpeg" ? "blue" : "amber"}>
                      {TYPE_LABELS[asset.type] ?? asset.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-n-600">{asset.lessonTitle}</td>
                  <td className="px-5 py-3 text-n-400">{asset.size}</td>
                  <td className="px-5 py-3 text-n-400">{asset.uploadedAt}</td>
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingId(asset.id)}
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

      <Modal open={deletingId !== null} onClose={() => setDeletingId(null)} title="Delete Asset">
        <p className="text-sm text-n-700 mb-6">
          Delete &ldquo;{assets.find((a) => a.id === deletingId)?.fileName}&rdquo;? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeletingId(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
