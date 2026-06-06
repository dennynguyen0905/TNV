import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ADMIN_MOCK_LESSONS } from "@/data/mock/lessons";
import { LESSON_STATUS_COLORS } from "@/data/constants/lesson-statuses";
import type { LessonStatus } from "@/data/types";

export const metadata: Metadata = { title: "Admin — Lessons" };

export default function AdminLessonsPage() {
  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-n-900">Lessons</h1>
          <p className="text-sm text-n-500 mt-1">{ADMIN_MOCK_LESSONS.length} lessons total</p>
        </div>
        <Link href="/admin/lessons/new">
          <Button>
            <Icon name="plus" size={16} />
            New Lesson
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
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
            {ADMIN_MOCK_LESSONS.map((lesson) => {
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
                    <div className="flex items-center gap-2">
                      <Badge color={statusColor}>{lesson.status}</Badge>
                      {lesson.premium && <Badge color="amber">Premium</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-n-400">{lesson.updated}</td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/lessons/${lesson.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        <Icon name="edit" size={14} />
                        Edit
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
