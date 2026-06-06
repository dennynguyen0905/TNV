import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { ADMIN_MOCK_LESSONS } from "@/data/mock/lessons";
import { MOCK_USERS } from "@/data/mock/users";
import { MOCK_WORKER_JOBS } from "@/data/mock/worker-jobs";
import { LESSON_STATUS_COLORS } from "@/data/constants/lesson-statuses";
import type { LessonStatus } from "@/data/types";

export const metadata: Metadata = { title: "Admin Dashboard" };

const statColor: Record<string, string> = {
  blue: "text-blue-500 bg-blue-50",
  green: "text-green-500 bg-green-50",
  amber: "text-amber-500 bg-amber-50",
  purple: "text-purple-500 bg-purple-50",
};

const stats = [
  { label: "Total Lessons",   value: ADMIN_MOCK_LESSONS.length, icon: "book",      color: "blue" },
  { label: "Total Users",     value: MOCK_USERS.length,          icon: "users",     color: "green" },
  { label: "Premium Users",   value: MOCK_USERS.filter((u) => u.premium).length, icon: "award", color: "amber" },
  { label: "Active Jobs",     value: MOCK_WORKER_JOBS.filter((j) => j.status === "RUNNING" || j.status === "PENDING").length, icon: "briefcase", color: "purple" },
];

export default function AdminDashboardPage() {
  const recentLessons = ADMIN_MOCK_LESSONS.slice(0, 5);
  const recentUsers = MOCK_USERS.slice(0, 5);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-n-900 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-n-500">{s.label}</span>
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${statColor[s.color]}`}>
                <Icon name={s.icon} size={16} />
              </span>
            </div>
            <p className="text-3xl font-bold text-n-900">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent lessons */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-n-800 mb-4">Recent Lessons</h2>
          <div className="space-y-3">
            {recentLessons.map((lesson) => {
              const color = LESSON_STATUS_COLORS[lesson.status as LessonStatus] as "green" | "amber" | "blue" | "gray";
              return (
                <div key={lesson.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-n-800 truncate">{lesson.title}</p>
                    <p className="text-xs text-n-400">{lesson.lang} · {lesson.skill} · {lesson.level}</p>
                  </div>
                  <Badge color={color}>{lesson.status}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent users */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-n-800 mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-n-800">{user.name}</p>
                  <p className="text-xs text-n-400">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge color={user.role === "ADMIN" ? "red" : user.role === "EDITOR" ? "amber" : "blue"}>
                    {user.role}
                  </Badge>
                  {user.premium && <Badge color="amber">Premium</Badge>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
