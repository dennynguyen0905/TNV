import type { Metadata } from "next";
import Link from "next/link";
import { Badge, type BadgeColor } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth";
import * as userRepo from "@/server/repositories/userRepository";
import * as lessonRepo from "@/server/repositories/lessonRepository";
import { toAdminUser } from "@/server/mappers/userMapper";
import { getAllLessonsForAdminList } from "@/server/services/adminLessonService";
import { LESSON_STATUS_COLORS } from "@/data/constants/lesson-statuses";
import type { LessonStatus } from "@/data/types";

export const metadata: Metadata = { title: "Admin Dashboard" };
export const dynamic = "force-dynamic";

function StatCard({ label, value, icon, color, bg }: { label: string; value: number | string; icon: string; color: string; bg: string }) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-n-200 flex items-center gap-4">
      <div 
        className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg }}
      >
        <Icon name={icon} size={22} className={color} style={{ color }} />
      </div>
      <div>
        <div className="text-[26px] font-extrabold text-n-900 leading-none mb-1">{value}</div>
        <div className="text-[13px] text-n-500">{label}</div>
      </div>
    </div>
  );
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    totalUsers,
    premiumUsers,
    totalLessons,
    publishedLessons,
    recentUserModels,
    allLessons,
  ] = await Promise.all([
    userRepo.countUsers(),
    userRepo.countPremiumUsers(),
    lessonRepo.countLessons(),
    lessonRepo.countPublishedLessons(),
    userRepo.getRecentUsers(5),
    getAllLessonsForAdminList(),
  ]);

  const recentUsers = recentUserModels.map(toAdminUser);
  const recentLessons = allLessons.slice(0, 4);

  const drafts = totalLessons - publishedLessons;
  const pendingJobs = 0; // Mock

  const stats = [
    { label: 'Total Lessons',   value: totalLessons,      icon: 'book',     color: '#10b981', bg: '#ecfdf5' },
    { label: 'Published',       value: publishedLessons,  icon: 'check',    color: '#059669', bg: '#d1fae5' },
    { label: 'Drafts',          value: drafts,            icon: 'edit',     color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Total Users',     value: totalUsers,        icon: 'users',    color: '#a855f7', bg: '#fdf4ff' },
    { label: 'Premium Users',   value: premiumUsers,      icon: 'award',    color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Pending Jobs',    value: pendingJobs,       icon: 'settings', color: '#71717a', bg: '#f4f4f5' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-2 text-n-900">Admin Dashboard</h1>
      <p className="text-[15px] text-n-500 mb-7">Overview of your learning platform.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent lessons */}
        <div className="bg-white rounded-2xl border border-n-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-n-200 flex justify-between items-center">
            <h3 className="text-[15px] font-bold text-n-900">Recent Lessons</h3>
            <Link href="/admin/lessons">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div>
            {recentLessons.length === 0 ? (
              <p className="text-sm text-n-400 p-5 text-center">No lessons found.</p>
            ) : (
              recentLessons.map((l, i) => (
                <div 
                  key={l.id} 
                  className={`px-5 py-3.5 flex justify-between items-center ${i < recentLessons.length - 1 ? 'border-b border-n-100' : ''}`}
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-[14px] font-semibold text-n-900 mb-0.5 truncate">{l.title}</p>
                    <span className="text-[12px] text-n-400">{l.lang}</span>
                  </div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Badge color={(LESSON_STATUS_COLORS[l.status as LessonStatus] || 'gray') as BadgeColor}>{l.status}</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-n-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-n-200 flex justify-between items-center">
            <h3 className="text-[15px] font-bold text-n-900">Recent Users</h3>
            <Link href="/admin/users">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
          <div>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-n-400 p-5 text-center">No users found.</p>
            ) : (
              recentUsers.slice(0, 4).map((u, i) => (
                <div 
                  key={u.id} 
                  className={`px-5 py-3.5 flex justify-between items-center ${i < 3 ? 'border-b border-n-100' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Icon name="users" size={14} className="text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-n-900 mb-[2px] truncate">{u.name}</p>
                      <span className="text-[12px] text-n-400 block truncate">{u.email}</span>
                    </div>
                  </div>
                  <Badge color={u.role === 'ADMIN' ? 'red' : 'gray'}>{u.role}</Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
