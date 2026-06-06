import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SAMPLE_LESSONS } from "@/data/mock/lessons";
import { LANGUAGES_DATA } from "@/data/constants/languages";
import { LESSON_TEXT, VOCAB_WORDS, QUIZ_QUESTIONS } from "@/data/mock/questions";

interface Props {
  params: Promise<{ languageSlug: string; skillSlug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = SAMPLE_LESSONS.find((l) => l.id === lessonSlug);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: lesson.title,
    description: lesson.summary,
  };
}

export default async function LessonDetailPage({ params }: Props) {
  const { languageSlug, skillSlug, lessonSlug } = await params;
  const lang = LANGUAGES_DATA.find((l) => l.slug === languageSlug);
  const lesson = SAMPLE_LESSONS.find((l) => l.id === lessonSlug);
  if (!lang || !lesson) notFound();

  const isFirstDaySchool = lessonSlug === "first-day-school";

  return (
    <>
      <Header />
      <main className="max-w-container mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-n-400 mb-6">
          <Link href="/" className="hover:text-n-600">Home</Link>
          <span className="mx-2">›</span>
          <Link href={`/${languageSlug}`} className="hover:text-n-600">{lang.name}</Link>
          <span className="mx-2">›</span>
          <Link href={`/${languageSlug}/${skillSlug}`} className="hover:text-n-600">{lesson.skill}</Link>
          <span className="mx-2">›</span>
          <span className="text-n-700">{lesson.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header card */}
            <Card className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge color="blue">{lesson.level}</Badge>
                {lesson.free ? <Badge color="green">Free</Badge> : <Badge color="amber">Premium</Badge>}
                <span className="text-xs text-n-400">{lesson.time}</span>
              </div>
              <h1 className="text-2xl font-bold text-n-900 mb-2">{lesson.title}</h1>
              <p className="text-n-600">{lesson.summary}</p>
            </Card>

            {/* Lesson text */}
            <Card className="p-6">
              <h2 className="text-base font-semibold text-n-800 mb-4">Read</h2>
              {isFirstDaySchool ? (
                <div className="prose prose-sm max-w-none text-n-700 leading-relaxed whitespace-pre-line">
                  {LESSON_TEXT}
                </div>
              ) : (
                <p className="text-n-400 italic text-sm">Lesson text — migration in progress.</p>
              )}
            </Card>

            {/* Quiz */}
            <Card className="p-6">
              <h2 className="text-base font-semibold text-n-800 mb-4">
                Quiz — {lesson.questions} questions
              </h2>
              {isFirstDaySchool ? (
                <div className="space-y-6">
                  {QUIZ_QUESTIONS.map((q, i) => (
                    <div key={i}>
                      <p className="text-sm font-medium text-n-800 mb-2">
                        {i + 1}. {q.prompt}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, j) => (
                          <label
                            key={j}
                            className="flex items-center gap-3 p-3 rounded-lg border border-n-200 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors"
                          >
                            <input type="radio" name={`q${i}`} value={j} className="accent-blue-500" />
                            <span className="text-sm text-n-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-btn transition-colors mt-2">
                    Submit answers
                  </button>
                </div>
              ) : (
                <p className="text-n-400 italic text-sm">Quiz — migration in progress.</p>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Vocabulary */}
            {isFirstDaySchool && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-n-800 mb-3">Key Vocabulary</h3>
                <div className="space-y-3">
                  {VOCAB_WORDS.map((v) => (
                    <div key={v.word}>
                      <p className="text-sm font-semibold text-n-800">{v.word}</p>
                      <p className="text-xs text-n-500">{v.meaning}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Lesson info */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-n-800 mb-3">Lesson Info</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-n-500">Language</dt>
                  <dd className="text-n-700 font-medium">{lesson.lang}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-n-500">Skill</dt>
                  <dd className="text-n-700 font-medium">{lesson.skill}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-n-500">Level</dt>
                  <dd><Badge color="blue">{lesson.level}</Badge></dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-n-500">Duration</dt>
                  <dd className="text-n-700">{lesson.time}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-n-500">Questions</dt>
                  <dd className="text-n-700">{lesson.questions}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
