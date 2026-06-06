import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SAMPLE_LESSONS } from "@/data/mock/lessons";
import { LANGUAGES_DATA } from "@/data/constants/languages";
import { FlagIcon } from "@/components/layout/FlagIcon";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const completedLessons = SAMPLE_LESSONS.slice(0, 3);

  return (
    <>
      <Header />
      <main className="max-w-container mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-n-900">My Dashboard</h1>
          <p className="text-n-500 mt-1">Track your learning progress.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Lessons done", value: "3" },
            { label: "Best score", value: "86%" },
            { label: "Languages", value: "1" },
            { label: "Streak", value: "2 days" },
          ].map((s) => (
            <Card key={s.label} className="p-5">
              <p className="text-sm text-n-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-n-900">{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Languages progress */}
        <h2 className="text-lg font-semibold text-n-800 mb-4">Progress by language</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {LANGUAGES_DATA.slice(0, 2).map((lang) => (
            <Card key={lang.id} className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <FlagIcon lang={lang.slug} size={28} />
                <span className="font-semibold text-n-800">{lang.name}</span>
              </div>
              <div className="space-y-3">
                {lang.skills.slice(0, 3).map((skill) => (
                  <div key={skill}>
                    <div className="flex justify-between text-xs text-n-500 mb-1">
                      <span>{skill}</span>
                      <span>1 / 6</span>
                    </div>
                    <ProgressBar value={1} max={6} color="blue" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Recent lessons */}
        <h2 className="text-lg font-semibold text-n-800 mb-4">Recent lessons</h2>
        <div className="space-y-3">
          {completedLessons.map((lesson) => (
            <Card key={lesson.id} className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-n-800">{lesson.title}</p>
                <p className="text-xs text-n-400">{lesson.lang} · {lesson.skill} · {lesson.level}</p>
              </div>
              <Badge color="green">Completed</Badge>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
