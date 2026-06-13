import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FlagIcon } from "@/components/layout/FlagIcon";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";
import * as progressRepo from "@/server/repositories/progressRepository";
import * as attemptRepo from "@/server/repositories/attemptRepository";
import { getRecommendedLessons } from "@/server/services/lessonService";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [progress, recentAttempts] = await Promise.all([
    progressRepo.getProgressForUser(user.id),
    attemptRepo.getRecentAttemptsForUser(user.id, 10),
  ]);

  const completedLessonIds = progress
    .filter((p) => p.status === "COMPLETED")
    .map((p) => p.lesson.id);
  const recommended = await getRecommendedLessons(completedLessonIds, 3);

  const isNewLearner = progress.length === 0 && recentAttempts.length === 0;

  const progressByLanguage = progress.reduce<
    Record<string, { name: string; slug: string; items: typeof progress }>
  >((acc, p) => {
    const { slug, name } = p.lesson.language;
    if (!acc[slug]) acc[slug] = { name, slug, items: [] };
    acc[slug].items.push(p);
    return acc;
  }, {});

  const lastAttempt = recentAttempts.length > 0 ? recentAttempts[0] : null;

  return (
    <>
      <Header />
      <main className="pb-16 pt-10 min-h-[calc(100vh-16rem)]">
        <div className="max-w-container mx-auto px-6">
          {/* Welcome */}
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-n-900 mb-1.5">Welcome back, {user.name}</h1>
            <p className="text-[15px] text-n-500">Keep up the great work! Here&apos;s your learning overview.</p>
          </div>

          {isNewLearner ? (
            /* New learner empty state */
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 p-10 text-center mb-10">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-5 text-3xl">🎓</div>
              <h2 className="text-xl font-bold text-n-900 mb-3">Let&apos;s start learning</h2>
              <p className="text-n-500 max-w-md mx-auto mb-6">
                You haven&apos;t started any lessons yet. Pick a short lesson below,
                complete the quiz, and your progress will appear here.
              </p>
              <Link href="/english">
                <Button variant="primary" size="lg">Browse lessons</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Continue learning */}
              {lastAttempt && (
                <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-[20px] border border-blue-100 mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2.5">Continue learning</p>
                    <h3 className="text-xl font-bold text-n-900 mb-1">{lastAttempt.lesson.title}</h3>
                    <p className="text-sm text-n-500 mb-4">{lastAttempt.lesson.language.name} · {lastAttempt.lesson.skill.name} · {lastAttempt.lesson.level.code}</p>
                    <div className="max-w-xs">
                      <ProgressBar value={Math.round(lastAttempt.percentage)} max={100} className="mb-2" />
                      <span className="text-xs text-n-500 font-medium">{Math.round(lastAttempt.percentage)}% complete</span>
                    </div>
                  </div>
                  <Link href={`/${lastAttempt.lesson.language.slug}/${lastAttempt.lesson.skill.slug}/${lastAttempt.lesson.slug}`}>
                    <Button variant="primary" size="lg">Resume lesson</Button>
                  </Link>
                </div>
              )}

              {/* Progress cards */}
              {Object.keys(progressByLanguage).length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-n-900 mb-4">Your progress</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-10">
                    {Object.values(progressByLanguage).map(({ name, slug, items }) => {
                      const done = items.filter((i) => i.status === "COMPLETED").length;
                      const bestScore = items.length > 0 ? Math.round(Math.max(...items.map((i) => i.bestPercentage))) : 0;
                      // Just grab the first level found as an approximation
                      const level = items.length > 0 ? items[0].lesson.level.code : "A1";

                      return (
                        <Link key={slug} href={`/${slug}`} className="block transition-transform hover:-translate-y-1">
                          <Card hover className="p-6 h-full border-2 border-transparent hover:border-blue-100 transition-colors">
                            <div className="flex items-center gap-3 mb-5">
                              <FlagIcon lang={slug} size={32} />
                              <span className="text-lg font-bold text-n-900">{name}</span>
                              <Badge color="blue" className="ml-auto">{level}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-2xl font-extrabold text-blue-500 mb-0.5">{done}</div>
                                <div className="text-xs font-medium text-n-400">Lessons done</div>
                              </div>
                              <div>
                                <div className="text-2xl font-extrabold text-blue-500 mb-0.5">{bestScore}%</div>
                                <div className="text-xs font-medium text-n-400">Best score</div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Recent activity */}
              {recentAttempts.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-n-900 mb-4">Recent activity</h2>
                  <div className="bg-white rounded-[16px] border border-n-200 overflow-hidden mb-10 shadow-sm">
                    {recentAttempts.slice(0, 4).map((attempt, i) => (
                      <Link
                        key={attempt.id}
                        href={`/${attempt.lesson.language.slug}/${attempt.lesson.skill.slug}/${attempt.lesson.slug}`}
                        className={`flex items-center justify-between p-4 px-5 hover:bg-n-50 transition-colors ${i < Math.min(recentAttempts.length, 4) - 1 ? 'border-b border-n-100' : ''}`}
                      >
                        <div>
                          <p className="text-[15px] font-semibold text-n-900 mb-1">{attempt.lesson.title}</p>
                          <span className="text-[13px] text-n-500">{attempt.lesson.skill.name} · {attempt.lesson.level.code}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-[15px] font-bold ${attempt.status === "PASSED" ? "text-green-500" : "text-amber-500"}`}>
                            {Math.round(attempt.percentage)}%
                          </span>
                          <p className="text-[12px] font-medium text-n-400 mt-0.5">
                            {new Date(attempt.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Recommended next */}
          {recommended.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-n-900 mb-4">Recommended next</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {recommended.map((l) => (
                  <Link
                    key={l.id}
                    href={`/${l.langSlug}/${l.skillSlug}/${l.slug}`}
                    className="block transition-transform hover:-translate-y-1"
                  >
                    <Card hover className="p-5 flex flex-col gap-3 h-full border-2 border-transparent hover:border-blue-100 transition-colors">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge color="blue">{l.level}</Badge>
                        <Badge color="green">Free</Badge>
                        <span className="text-xs font-medium text-n-400 ml-auto">
                          ~{l.estimatedMin} min
                        </span>
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-n-900 mb-1.5">{l.title}</h3>
                        <p className="text-sm text-n-500 line-clamp-2 leading-relaxed">{l.summary}</p>
                      </div>
                      <div className="mt-auto flex items-center gap-2 text-[13px] font-medium text-n-400 pt-3 border-t border-n-100">
                        <span>{l.lang}</span>
                        <span>·</span>
                        <span>{l.skill}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
