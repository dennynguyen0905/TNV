"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { ADMIN_MOCK_LESSONS } from "@/data/mock/lessons";
import { LESSON_STATUS_COLORS } from "@/data/constants/lesson-statuses";
import type { AdminLesson, LessonStatus } from "@/data/types";

const SKILL_OPTIONS = ["All", "Reading", "Listening", "Dictation", "Grammar", "Vocabulary"];
const STATUS_OPTIONS = ["All", "Published", "Draft", "Review", "Archived"];

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<AdminLesson[]>(ADMIN_MOCK_LESSONS);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = lessons.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.title.toLowerCase().includes(q) || l.slug.includes(q) || l.lang.toLowerCase().includes(q);
    const matchSkill  = skillFilter === "All" || l.skill === skillFilter;
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    return matchSearch && matchSkill && matchStatus;
  });

  const togglePremium = (id: number) =>
    setLessons((prev) => prev.map((l) => l.id === id ? { ...l, premium: !l.premium } : l));

  const confirmDelete = () => {
    if (deletingId === null) return;
    setLessons((prev) => prev.filter((l) => l.id !== deletingId));
    setDeletingId(null);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Lessons</h1>
          <p className="text-sm text-n-500 mt-1">{filtered.length} of {lessons.length} lessons</p>
        </div>
        <Link href="/admin/lessons/new">
          <Button>
            <Icon name="plus" size={16} />
            New Lesson
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search title, slug, language…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {SKILL_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All skills" : s}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === "All" ? "All statuses" : s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-n-400">
            <Icon name="book" size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No lessons match your filters.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-n-200 bg-n-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-n-500">Title</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Language</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Skill</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Level</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Updated</th>
                <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {filtered.map((lesson) => {
                const statusColor = LESSON_STATUS_COLORS[lesson.status as LessonStatus] as "green" | "amber" | "blue" | "gray";
                return (
                  <tr key={lesson.id} className="hover:bg-n-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-n-800">{lesson.title}</div>
                      <div className="text-xs text-n-400">{lesson.slug}</div>
                    </td>
                    <td className="px-5 py-3 text-n-600">{lesson.lang}</td>
                    <td className="px-5 py-3 text-n-600">{lesson.skill}</td>
                    <td className="px-5 py-3">
                      <Badge color="blue">{lesson.level}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge color={statusColor}>{lesson.status}</Badge>
                        <button
                          onClick={() => togglePremium(lesson.id)}
                          className="focus:outline-none"
                          title="Toggle premium"
                        >
                          {lesson.premium
                            ? <Badge color="amber">Premium</Badge>
                            : <span className="text-xs text-n-300 hover:text-n-500">Free</span>}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-n-400">{lesson.updated}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/lessons/${lesson.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            <Icon name="edit" size={14} />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(lesson.id)}
                          className="hover:text-red-500"
                        >
                          <Icon name="trash" size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={deletingId !== null} onClose={() => setDeletingId(null)} title="Delete Lesson">
        <p className="text-sm text-n-700 mb-6">
          Are you sure you want to delete &ldquo;
          {lessons.find((l) => l.id === deletingId)?.title}&rdquo;? This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeletingId(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
