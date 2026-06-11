import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireUser } from "@/lib/auth";
import * as progressRepo from "@/server/repositories/progressRepository";
import * as attemptRepo from "@/server/repositories/attemptRepository";
import { getRecommendedLessons } from "@/server/services/lessonService";

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
  const inProgressCount = progress.filter((p) => p.status === "IN_PROGRESS").length;
  const bestScore =
    progress.length > 0 ? Math.round(Math.max(...progress.map((p) => p.bestPercentage))) : 0;
  const avgScore =
    progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.bestPercentage, 0) / progress.length)
      : 0;

  const completedLessonIds = progress
    .filter((p) => p.status === "COMPLETED")
    .map((p) => p.lesson.id);
  const recommended = await getRecommendedLessons(completedLessonIds, 4);

  const isNewLearner = progress.length === 0 && recentAttempts.length === 0;

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

        {isNewLearner ? (
          /* New learner empty state */
          <Card className="p-8 text-center mb-10">
            <h2 className="text-lg font-semibold text-n-800 mb-2">
              Let&rsquo;s start learning 🎓
            </h2>
            <p className="text-n-500 text-sm max-w-md mx-auto mb-5">
              You haven&rsquo;t started any lessons yet. Pick a short lesson below,
              complete the quiz, and your progress will appear here.
            </p>
            <Link
              href="/"
              className="inline-block text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-btn transition-colors"
            >
              Browse lessons
            </Link>
          </Card>
        ) : (
          /* Stats */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "Lessons completed", value: String(completedCount) },
              { label: "In progress", value: String(inProgressCount) },
              { label: "Average score", value: progress.length > 0 ? `${avgScore}%` : "—" },
              { label: "Best score", value: progress.length > 0 ? `${bestScore}%` : "—" },
            ].map((s) => (
              <Card key={s.label} className="p-5">
                <p className="text-sm text-n-500 mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-n-900">{s.value}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Recommended next lessons */}
        {recommended.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-n-800 mb-4">
              {isNewLearner ? "Start here" : "Recommended for you"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {recommended.map((l) => (
                <Link
                  key={l.id}
                  href={`/${l.langSlug}/${l.skillSlug}/${l.slug}`}
                  className="block"
                >
                  <Card className="p-5 h-full hover:shadow-hover transition-shadow">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge color="blue">{l.level}</Badge>
                      <Badge color="gray">{l.skill}</Badge>
                      <Badge color="green">Free</Badge>
                    </div>
                    <p className="font-medium text-n-800">{l.title}</p>
                    {l.summary && (
                      <p className="text-xs text-n-500 mt-1 line-clamp-2">{l.summary}</p>
                    )}
                    <p className="text-xs text-n-400 mt-2">
                      {l.lang} · ~{l.estimatedMin} min · {l.questionCount} questions
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}

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
        {!isNewLearner && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-n-800">Recent attempts</h2>
              <span className="text-sm text-n-400">{totalAttempts} total</span>
            </div>
            {recentAttempts.length === 0 ? (
              <Card>
                <EmptyState
                  icon="award"
                  title="No attempts yet"
                  description="Start a lesson and complete its quiz to track your progress here."
                  action={
                    <Link href="/" className="text-sm font-medium text-blue-500 hover:text-blue-700">
                      Browse lessons →
                    </Link>
                  }
                />
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
          </>
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
                        Last: {Math.round(p.lastPercentage)}% · Best: {Math.round(p.bestPercentage)}%
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
