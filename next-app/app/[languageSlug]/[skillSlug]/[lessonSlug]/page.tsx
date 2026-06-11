import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { QuizRunnerDB } from "@/components/quiz/QuizRunnerDB";
import { DictationPractice } from "@/components/lesson/DictationPractice";
import { VocabCards } from "@/components/lesson/VocabCards";
import { getLessonDetailForPublic } from "@/server/services/lessonService";
import { VOCAB_PRACTICE_WORDS } from "@/data/mock/vocabulary";
import { getCurrentUser } from "@/lib/auth";
import { canAccessLesson } from "@/lib/permissions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ languageSlug: string; skillSlug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { languageSlug, skillSlug, lessonSlug } = await params;
  const lesson = await getLessonDetailForPublic({ languageSlug, skillSlug, lessonSlug });
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: lesson.seoTitle ?? lesson.title,
    description: lesson.seoDescription ?? lesson.summary,
  };
}

export default async function LessonDetailPage({ params }: Props) {
  const { languageSlug, skillSlug, lessonSlug } = await params;
  const [lesson, user] = await Promise.all([
    getLessonDetailForPublic({ languageSlug, skillSlug, lessonSlug }),
    getCurrentUser(),
  ]);
  if (!lesson) notFound();

  const canAccessPremium = canAccessLesson(user, { isPremium: !lesson.free });

  const isListening = lesson.skill === "Listening";
  const isDictation = lesson.skill === "Dictation";
  const isVocab = lesson.skill === "Vocabulary";

  const dictationSentences = isDictation
    ? lesson.questions
        .filter((q) => q.type === "DICTATION" || q.type === "FILL_BLANK")
        .map((q, i) => ({ id: i + 1, text: q.prompt }))
    : [];

  const fallbackDictation = [
    { id: 1, text: "The cat is on the table." },
    { id: 2, text: "I go to school every day." },
    { id: 3, text: "She likes to read books." },
    { id: 4, text: "We have a big house." },
    { id: 5, text: "He drinks coffee in the morning." },
  ];

  const activeDictationSentences =
    dictationSentences.length > 0 ? dictationSentences : fallbackDictation;

  const quizQuestions = !isDictation
    ? lesson.questions.filter(
        (q) => q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE" || q.type === "FILL_BLANK"
      )
    : [];

  return (
    <>
      <Header />
      <main className="max-w-container mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <nav className="text-sm text-n-400 mb-6">
          <Link href="/" className="hover:text-n-600">
            Home
          </Link>
          <span className="mx-2">›</span>
          <Link href={`/${languageSlug}`} className="hover:text-n-600">
            {lesson.lang}
          </Link>
          <span className="mx-2">›</span>
          <Link href={`/${languageSlug}/${skillSlug}`} className="hover:text-n-600">
            {lesson.skill}
          </Link>
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
                {lesson.free ? (
                  <Badge color="green">Free</Badge>
                ) : (
                  <Badge color="amber">Premium</Badge>
                )}
                <Badge color="gray">{lesson.skill}</Badge>
                <span className="text-xs text-n-400">~{lesson.estimatedMin} min</span>
              </div>
              <h1 className="text-2xl font-bold text-n-900 mb-2">{lesson.title}</h1>
              <p className="text-n-600">{lesson.summary}</p>
            </Card>

            {!canAccessPremium ? (
              /* Premium gate */
              <Card className="p-8 text-center border-2 border-amber-200 bg-amber-50">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-n-800 mb-2">Premium lesson</h2>
                <p className="text-n-500 text-sm mb-4">
                  This lesson is available to premium members.{" "}
                  {!user && (
                    <>
                      <Link href="/login" className="text-blue-500 hover:underline">Log in</Link>
                      {" "}or{" "}
                      <Link href="/register" className="text-blue-500 hover:underline">create a free account</Link>
                      {" "}to get started.
                    </>
                  )}
                  {user && "Upgrade your account to access this lesson."}
                </p>
                <Link
                  href="/"
                  className="inline-block text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-btn transition-colors"
                >
                  Browse free lessons
                </Link>
              </Card>
            ) : (
              <>
                {/* ── LISTENING ─────────────────────────────────────────── */}
                {isListening && (
                  <Card className="p-6">
                    <h2 className="text-base font-semibold text-n-800 mb-4">Listen</h2>
                    <div className="flex items-center gap-4 bg-n-50 rounded-lg px-4 py-3 mb-4 border border-n-200">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" fill="#3b82f6" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-1.5 bg-n-200 rounded-full overflow-hidden">
                            <div className="w-0 h-full bg-blue-400 rounded-full" />
                          </div>
                          <span className="text-xs text-n-400 shrink-0">~{lesson.estimatedMin} min</span>
                        </div>
                        <p className="text-xs text-n-400 italic">
                          {lesson.audioUrl ? lesson.audioUrl : "Audio file — not yet available"}
                        </p>
                      </div>
                    </div>

                    {lesson.transcript && (
                      <>
                        <h3 className="text-sm font-semibold text-n-700 mb-2">Transcript</h3>
                        <div className="bg-n-50 rounded-lg p-4 text-sm text-n-700 leading-relaxed whitespace-pre-line border border-n-100">
                          {lesson.transcript}
                        </div>
                      </>
                    )}
                  </Card>
                )}

                {/* ── READING / GRAMMAR ─────────────────────────────────── */}
                {!isListening && !isDictation && !isVocab && (
                  <Card className="p-6">
                    <h2 className="text-base font-semibold text-n-800 mb-4">Read</h2>
                    {lesson.content ? (
                      <div className="prose prose-sm max-w-none text-n-700 leading-relaxed whitespace-pre-line">
                        {lesson.content}
                      </div>
                    ) : (
                      <p className="text-n-400 italic text-sm">
                        Lesson text for &ldquo;{lesson.title}&rdquo; has not been added yet.
                      </p>
                    )}
                  </Card>
                )}

                {/* ── DICTATION ─────────────────────────────────────────── */}
                {isDictation && (
                  <Card className="p-6">
                    <h2 className="text-base font-semibold text-n-800 mb-4">Dictation Practice</h2>
                    <DictationPractice sentences={activeDictationSentences} />
                  </Card>
                )}

                {/* ── VOCABULARY ────────────────────────────────────────── */}
                {isVocab && (
                  <Card className="p-6">
                    <h2 className="text-base font-semibold text-n-800 mb-4">Vocabulary</h2>
                    <VocabCards words={VOCAB_PRACTICE_WORDS} />
                  </Card>
                )}

                {/* ── QUIZ ──────────────────────────────────────────────── */}
                {!isDictation && quizQuestions.length > 0 && (
                  <Card className="p-6">
                    <h2 className="text-base font-semibold text-n-800 mb-4">
                      Quiz — {quizQuestions.length} question
                      {quizQuestions.length !== 1 ? "s" : ""}
                    </h2>
                    <QuizRunnerDB
                      questions={quizQuestions}
                      lessonId={lesson.id}
                      lessonTitle={lesson.title}
                    />
                  </Card>
                )}

                {!isDictation && lesson.questions.length > 0 && quizQuestions.length === 0 && (
                  <Card className="p-6">
                    <h2 className="text-base font-semibold text-n-800 mb-2">
                      Quiz — {lesson.questions.length} questions
                    </h2>
                    <p className="text-n-400 italic text-sm">
                      Quiz available for this lesson type via the dictation practice above.
                    </p>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
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
                  <dd>
                    <Badge color="blue">{lesson.level}</Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-n-500">Duration</dt>
                  <dd className="text-n-700">~{lesson.estimatedMin} min</dd>
                </div>
                {!isDictation && (
                  <div className="flex justify-between">
                    <dt className="text-n-500">Questions</dt>
                    <dd className="text-n-700">{lesson.questionCount}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-n-500">Access</dt>
                  <dd>
                    {lesson.free ? (
                      <Badge color="green">Free</Badge>
                    ) : (
                      <Badge color="amber">Premium</Badge>
                    )}
                  </dd>
                </div>
              </dl>
            </Card>

            {/* Worksheet / PDF download placeholder */}
            {canAccessPremium && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-n-800 mb-3">Worksheet</h3>
                {lesson.pdfUrl ? (
                  <a
                    href={lesson.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-btn transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download PDF
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled
                    title="PDF worksheet is not available yet"
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-n-100 text-n-400 px-4 py-2.5 rounded-btn cursor-not-allowed"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    PDF coming soon
                  </button>
                )}
                <p className="text-xs text-n-400 mt-2">
                  Printable worksheets are generated in a later phase.
                </p>
              </Card>
            )}

            {/* Back link */}
            <Link
              href={`/${languageSlug}/${skillSlug}`}
              className="block text-sm text-blue-500 hover:text-blue-700 hover:underline"
            >
              ← Back to {lesson.skill} lessons
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
