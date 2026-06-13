"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { LESSON_STATUS_COLORS } from "@/data/constants/lesson-statuses";
import {
  archiveLessonAction,
  toggleLessonPremiumAction,
  publishLessonAction,
  unpublishLessonAction,
} from "./actions";
import type { AdminLesson, LessonStatus } from "@/data/types";

const SKILL_OPTIONS = ["All", "Reading", "Listening", "Dictation", "Grammar", "Vocabulary"];
const STATUS_OPTIONS = ["All", "Published", "Draft", "Review", "Archived"];
const ACCESS_OPTIONS = ["All", "Free", "Premium"];

interface LessonsClientProps {
  initialLessons: AdminLesson[];
}

export function LessonsClient({ initialLessons }: LessonsClientProps) {
  const router = useRouter();
  const [lessons, setLessons] = useState<AdminLesson[]>(initialLessons);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [langFilter, setLangFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [accessFilter, setAccessFilter] = useState("All");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLessons(initialLessons);
  }, [initialLessons]);

  const langOptions = useMemo(
    () => ["All", ...Array.from(new Set(initialLessons.map((l) => l.lang))).sort()],
    [initialLessons]
  );
  const levelOptions = useMemo(
    () => ["All", ...Array.from(new Set(initialLessons.map((l) => l.level))).sort()],
    [initialLessons]
  );

  const filtered = lessons.filter((l) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.title.toLowerCase().includes(q) ||
      l.slug.includes(q) ||
      l.lang.toLowerCase().includes(q);
    const matchSkill = skillFilter === "All" || l.skill === skillFilter;
    const matchStatus = statusFilter === "All" || l.status === statusFilter;
    const matchLang = langFilter === "All" || l.lang === langFilter;
    const matchLevel = levelFilter === "All" || l.level === levelFilter;
    const matchAccess =
      accessFilter === "All" ||
      (accessFilter === "Premium" ? l.premium : !l.premium);
    return matchSearch && matchSkill && matchStatus && matchLang && matchLevel && matchAccess;
  });

  const handleTogglePremium = (id: string) => {
    const lesson = lessons.find((l) => l.id === id);
    if (!lesson) return;
    const newPremium = !lesson.premium;
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, premium: newPremium } : l)));
    startTransition(async () => {
      const result = await toggleLessonPremiumAction(id, newPremium);
      if (!result.ok) {
        setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, premium: !newPremium } : l)));
        setError(result.error);
      }
    });
  };

  const handlePublish = (id: string) => {
    setError(null);
    startTransition(async () => {
      const res = await publishLessonAction(id);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  };

  const handleUnpublish = (id: string) => {
    setError(null);
    startTransition(async () => {
      const res = await unpublishLessonAction(id);
      if (res.ok) router.refresh();
      else setError(res.error);
    });
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    const id = deletingId;
    setDeletingId(null);
    setError(null);
    startTransition(async () => {
      const result = await archiveLessonAction(id);
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  };

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold mb-1 text-n-900">Lessons</h1>
          <p className="text-[14px] text-n-500">
            {filtered.length} lessons total
          </p>
        </div>
        <Link href="/admin/lessons/new">
          <Button variant="primary">
            <Icon name="plus" size={18} className="text-white mr-1" />
            New Lesson
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-input border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search lessons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {[
          { value: statusFilter, set: setStatusFilter, opts: STATUS_OPTIONS, allLabel: "All Status" },
          { value: langFilter, set: setLangFilter, opts: langOptions, allLabel: "All Languages" },
          { value: skillFilter, set: setSkillFilter, opts: SKILL_OPTIONS, allLabel: "All Skills" },
          { value: levelFilter, set: setLevelFilter, opts: levelOptions, allLabel: "All Levels" },
          { value: accessFilter, set: setAccessFilter, opts: ACCESS_OPTIONS, allLabel: "All Access" },
        ].map((f, idx) => (
          <select
            key={idx}
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            className="w-[160px] px-3 py-2 text-[14px] rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 text-n-700 font-medium"
          >
            {f.opts.map((o) => (
              <option key={o} value={o}>{o === "All" ? f.allLabel : o}</option>
            ))}
          </select>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-n-200 overflow-hidden">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-n-200">
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Language</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Skill</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Level</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Premium</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Updated</th>
              <th className="px-4 py-3 text-left font-semibold text-n-500 text-[12px] uppercase tracking-[0.04em]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-n-400">
                  No lessons found.
                </td>
              </tr>
            ) : (
              filtered.map((lesson, i) => {
                const statusColor = LESSON_STATUS_COLORS[
                  lesson.status as LessonStatus
                ] as "green" | "amber" | "blue" | "gray";
                return (
                  <tr 
                    key={lesson.id} 
                    className={`hover:bg-n-50 transition-colors ${i < filtered.length - 1 ? 'border-b border-n-100' : ''}`}
                  >
                    <td className="px-4 py-[14px] font-semibold text-n-900 max-w-[220px] truncate" title={lesson.title}>
                      {lesson.title}
                    </td>
                    <td className="px-4 py-[14px] text-n-600">{lesson.lang}</td>
                    <td className="px-4 py-[14px] text-n-600">{lesson.skill}</td>
                    <td className="px-4 py-[14px]">
                      <Badge color="blue">{lesson.level}</Badge>
                    </td>
                    <td className="px-4 py-[14px]">
                      <Badge color={statusColor}>{lesson.status}</Badge>
                    </td>
                    <td className="px-4 py-[14px]">
                      <button
                        onClick={() => handleTogglePremium(lesson.id)}
                        className="focus:outline-none"
                        title="Toggle premium"
                        disabled={isPending}
                      >
                        {lesson.premium ? (
                          <Badge color="amber">Yes</Badge>
                        ) : (
                          <span className="text-n-300">—</span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-[14px] text-n-400 text-[13px]">{lesson.updated}</td>
                    <td className="px-4 py-[14px]">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/lessons/${lesson.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </Link>
                        {lesson.status === "Published" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                            onClick={() => handleUnpublish(lesson.id)}
                            disabled={isPending}
                          >
                            Unpublish
                          </Button>
                        ) : (
                          lesson.status !== "Archived" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-500 hover:text-green-600 hover:bg-green-50"
                              onClick={() => handlePublish(lesson.id)}
                              disabled={isPending}
                            >
                              Publish
                            </Button>
                          )
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeletingId(lesson.id)}
                        >
                          Del
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Delete Lesson"
      >
        <p className="text-[15px] text-n-600 leading-relaxed mb-6">
          Are you sure you want to archive <strong>{lessons.find((l) => l.id === deletingId)?.title}</strong>? It will be hidden from public pages.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeletingId(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isPending}>
            Archive
          </Button>
        </div>
      </Modal>
    </div>
  );
}
