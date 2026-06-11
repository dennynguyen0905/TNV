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
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Lessons</h1>
          <p className="text-sm text-n-500 mt-1">
            {filtered.length} of {lessons.length} lessons
          </p>
        </div>
        <Link href="/admin/lessons/new">
          <Button>
            <Icon name="plus" size={16} />
            New Lesson
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-input border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search title, slug, language…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {[
          { value: langFilter, set: setLangFilter, opts: langOptions, allLabel: "All languages" },
          { value: skillFilter, set: setSkillFilter, opts: SKILL_OPTIONS, allLabel: "All skills" },
          { value: levelFilter, set: setLevelFilter, opts: levelOptions, allLabel: "All levels" },
          { value: statusFilter, set: setStatusFilter, opts: STATUS_OPTIONS, allLabel: "All statuses" },
          { value: accessFilter, set: setAccessFilter, opts: ACCESS_OPTIONS, allLabel: "All access" },
        ].map((f, idx) => (
          <select
            key={idx}
            value={f.value}
            onChange={(e) => f.set(e.target.value)}
            className="px-3 py-2 text-sm rounded-input border border-n-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {f.opts.map((o) => (
              <option key={o} value={o}>{o === "All" ? f.allLabel : o}</option>
            ))}
          </select>
        ))}
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
                <th className="px-5 py-3 text-left font-medium text-n-500">Q</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-n-500">Updated</th>
                <th className="px-5 py-3 text-right font-medium text-n-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {filtered.map((lesson) => {
                const statusColor = LESSON_STATUS_COLORS[
                  lesson.status as LessonStatus
                ] as "green" | "amber" | "blue" | "gray";
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
                    <td className="px-5 py-3 text-n-500">{lesson.questionCount ?? 0}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge color={statusColor}>{lesson.status}</Badge>
                        <button
                          onClick={() => handleTogglePremium(lesson.id)}
                          className="focus:outline-none"
                          title="Toggle premium"
                          disabled={isPending}
                        >
                          {lesson.premium ? (
                            <Badge color="amber">Premium</Badge>
                          ) : (
                            <span className="text-xs text-n-300 hover:text-n-500">Free</span>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-n-400">{lesson.updated}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/lessons/${lesson.id}/preview`}>
                          <Button variant="ghost" size="sm" title="Preview">
                            <Icon name="search" size={14} />
                          </Button>
                        </Link>
                        <Link href={`/admin/lessons/${lesson.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            <Icon name="edit" size={14} />
                            Edit
                          </Button>
                        </Link>
                        {lesson.status === "Published" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnpublish(lesson.id)}
                            disabled={isPending}
                            title="Unpublish (back to draft)"
                          >
                            Unpublish
                          </Button>
                        ) : (
                          lesson.status !== "Archived" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublish(lesson.id)}
                              disabled={isPending}
                              className="text-green-600 hover:text-green-700"
                              title="Publish"
                            >
                              Publish
                            </Button>
                          )
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(lesson.id)}
                          className="hover:text-red-500"
                          title="Archive"
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

      <Modal
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Archive Lesson"
      >
        <p className="text-sm text-n-700 mb-6">
          Archive &ldquo;{lessons.find((l) => l.id === deletingId)?.title}&rdquo;? It will be
          hidden from public pages but can be found with the Archived filter.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeletingId(null)}>
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
