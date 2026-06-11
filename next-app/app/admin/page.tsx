import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { requireAdmin } from "@/lib/auth";
import * as userRepo from "@/server/repositories/userRepository";
import * as languageRepo from "@/server/repositories/languageRepository";
import * as skillRepo from "@/server/repositories/skillRepository";
import * as levelRepo from "@/server/repositories/levelRepository";
import * as lessonRepo from "@/server/repositories/lessonRepository";
import { toAdminUser } from "@/server/mappers/userMapper";
import { getAllLessonsForAdminList } from "@/server/services/adminLessonService";
import { LESSON_STATUS_COLORS } from "@/data/constants/lesson-statuses";
import type { LessonStatus } from "@/data/types";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

const statColor: Record<string, string> = {
  blue: "text-blue-500 bg-blue-50",
  green: "text-green-500 bg-green-50",
  amber: "text-amber-500 bg-amber-50",
  purple: "text-purple-500 bg-purple-50",
};

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    totalUsers,
    premiumUsers,
    totalLanguages,
    activeLanguages,
    totalSkills,
    totalLevels,
    totalLessons,
    publishedLessons,
    recentUserModels,
    allLessons,
  ] = await Promise.all([
    userRepo.countUsers(),
    userRepo.countPremiumUsers(),
    languageRepo.countLanguages(),
    languageRepo.countActiveLanguages(),
    skillRepo.countSkills(),
    levelRepo.countLevels(),
    lessonRepo.countLessons(),
    lessonRepo.countPublishedLessons(),
    userRepo.getRecentUsers(5),
    getAllLessonsForAdminList(),
  ]);

  const recentUsers = recentUserModels.map(toAdminUser);
  const recentLessons = allLessons.slice(0, 5);

  const stats = [
    { label: "Total Users", value: totalUsers, icon: "users", color: "green" },
    { label: "Premium Users", value: premiumUsers, icon: "award", color: "amber" },
    { label: "Languages", value: `${activeLanguages}/${totalLanguages}`, icon: "globe", color: "blue" },
    { label: "Skills", value: totalSkills, icon: "grid", color: "purple" },
    { label: "Levels", value: totalLevels, icon: "layers", color: "blue" },
    { label: "Total Lessons", value: totalLessons, icon: "book", color: "green" },
    { label: "Published Lessons", value: publishedLessons, icon: "check", color: "amber" },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-n-900 mb-6">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-n-500">{s.label}</span>
              <span
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${statColor[s.color]}`}
              >
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
            {recentLessons.length === 0 ? (
              <p className="text-sm text-n-400">No lessons yet.</p>
            ) : (
              recentLessons.map((lesson) => {
                const color = LESSON_STATUS_COLORS[lesson.status as LessonStatus] as
                  | "green"
                  | "amber"
                  | "blue"
                  | "gray";
                return (
                  <div key={lesson.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-n-800 truncate">{lesson.title}</p>
                      <p className="text-xs text-n-400">
                        {lesson.lang} · {lesson.skill} · {lesson.level}
                      </p>
                    </div>
                    <Badge color={color}>{lesson.status}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Recent users */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-n-800 mb-4">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-n-400">No users yet.</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-n-800">{user.name}</p>
                    <p className="text-xs text-n-400">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge color={user.role === "ADMIN" ? "red" : "blue"}>{user.role}</Badge>
                    {user.isPremium && <Badge color="amber">Premium</Badge>}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
