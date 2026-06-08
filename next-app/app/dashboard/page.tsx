import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { requireUser } from "@/lib/auth";
import * as progressRepo from "@/server/repositories/progressRepository";
import * as attemptRepo from "@/server/repositories/attemptRepository";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [progress, recentAttempts, totalAttempts] = await Promise.all([
    progressRepo.getProgressForUser(user.id),
    attemptRepo.getRecentAttemptsForUser(user.id, 10),
    attemptRepo.countAttemptsForUser(user.id),
  ]);

  const completedCount = progress.filter((p) => p.status === "COMPLETED").length;
  const bestScore =
    progress.length > 0 ? Math.round(Math.max(...progress.map((p) => p.bestPercentage))) : 0;

  const uniqueLanguages = new Set(progress.map((p) => p.lesson.language.slug)).size;

  const progressByLanguage = progress.reduce<
    Record<string, { name: string; slug: string; items: typeof progress }>
  >((acc, p) => {
    const { slug, name } = p.lesson.language;
    if (!acc[slug]) acc[slug] = { name, slug, items: [] };
    acc[slug].items.push(p);
    return acc;
  }, {});

  return (
    <>
      <Header />
      <main className="max-w-container mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-n-900">My Dashboard</h1>
          <p className="text-n-500 mt-1">Welcome back, {user.name}.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Lessons done", value: String(completedCount) },
            { label: "Best score", value: progress.length > 0 ? `${bestScore}%` : "—" },
            { label: "Languages", value: String(uniqueLanguages || "—") },
            { label: "Total attempts", value: String(totalAttempts) },
          ].map((s) => (
            <Card key={s.label} className="p-5">
              <p className="text-sm text-n-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-n-900">{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Progress by language */}
        {Object.keys(progressByLanguage).length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-n-800 mb-4">Progress by language</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {Object.values(progressByLanguage).map(({ name, slug, items }) => {
                const bySkill = items.reduce<Record<string, typeof items>>(
                  (acc, p) => {
                    const s = p.lesson.skill.name;
                    if (!acc[s]) acc[s] = [];
                    acc[s].push(p);
                    return acc;
                  },
                  {}
                );

                return (
                  <Card key={slug} className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="font-semibold text-n-800">{name}</span>
                    </div>
                    <div className="space-y-3">
                      {Object.entries(bySkill).map(([skillName, skillItems]) => {
                        const done = skillItems.filter((i) => i.status === "COMPLETED").length;
                        const total = skillItems.length;
                        return (
                          <div key={skillName}>
                            <div className="flex justify-between text-xs text-n-500 mb-1">
                              <span>{skillName}</span>
                              <span>{done} / {total} completed</span>
                            </div>
                            <ProgressBar value={done} max={total || 1} color="blue" />
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Recent attempts */}
        <h2 className="text-lg font-semibold text-n-800 mb-4">Recent attempts</h2>
        {recentAttempts.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-n-500 mb-3">No attempts yet. Start a lesson to track progress.</p>
            <Link href="/" className="text-sm text-blue-500 hover:text-blue-700 font-medium">
              Browse lessons →
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentAttempts.map((attempt) => {
              const lessonUrl = `/${attempt.lesson.language.slug}/${attempt.lesson.skill.slug}/${attempt.lesson.slug}`;
              return (
                <Card key={attempt.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={lessonUrl}
                      className="font-medium text-n-800 hover:text-blue-600 transition-colors"
                    >
                      {attempt.lesson.title}
                    </Link>
                    <p className="text-xs text-n-400 mt-0.5">
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-semibold text-n-700">
                      {Math.round(attempt.percentage)}%
                    </span>
                    <Badge color={attempt.status === "PASSED" ? "green" : "red"}>
                      {attempt.status === "PASSED" ? "Passed" : "Failed"}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* All progress list */}
        {progress.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-n-800 mt-10 mb-4">All lessons</h2>
            <div className="space-y-2">
              {progress.map((p) => {
                const lessonUrl = `/${p.lesson.language.slug}/${p.lesson.skill.slug}/${p.lesson.slug}`;
                const statusColor =
                  p.status === "COMPLETED"
                    ? "green"
                    : p.status === "IN_PROGRESS"
                    ? "blue"
                    : "gray";
                return (
                  <Card key={p.id} className="p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={lessonUrl}
                        className="font-medium text-n-800 hover:text-blue-600 transition-colors"
                      >
                        {p.lesson.title}
                      </Link>
                      <p className="text-xs text-n-400 mt-0.5">
                        {p.lesson.language.name} · {p.lesson.skill.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm text-n-500">
                        Best: {Math.round(p.bestPercentage)}%
                      </span>
                      <Badge color={statusColor as "green" | "blue" | "gray"}>
                        {p.status === "COMPLETED"
                          ? "Completed"
                          : p.status === "IN_PROGRESS"
                          ? "In progress"
                          : "Not started"}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
