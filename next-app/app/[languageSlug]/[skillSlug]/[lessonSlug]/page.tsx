import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
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
  const isReadingOrGrammar = !isListening && !isDictation && !isVocab;

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

  const activeDictationSentences = dictationSentences.length > 0 ? dictationSentences : fallbackDictation;

  const quizQuestions = !isDictation
    ? lesson.questions.filter((q) => q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE" || q.type === "FILL_BLANK")
    : [];

  const PremiumGate = () => (
    <div className="p-10 text-center border-2 border-amber-200 bg-amber-50 rounded-2xl max-w-2xl mx-auto my-12">
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-n-900 mb-3">Premium lesson</h2>
      <p className="text-n-600 text-[15px] mb-6 max-w-md mx-auto leading-relaxed">
        This lesson is available to premium members.{" "}
        {!user && (
          <>
            <Link href="/login" className="text-blue-600 hover:underline font-semibold">Log in</Link>
            {" "}or{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-semibold">create a free account</Link>
            {" "}to get started.
          </>
        )}
        {user && "Upgrade your account to access this lesson."}
      </p>
      <Link href="/">
        <Button variant="primary" size="lg">Browse free lessons</Button>
      </Link>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pb-16">
        <div className="max-w-container mx-auto px-6 pt-7">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: lesson.lang, href: `/${languageSlug}` },
              { label: lesson.skill, href: `/${languageSlug}/${skillSlug}` },
              { label: lesson.title },
            ]}
          />
        </div>

        {/* ── LISTENING ─────────────────────────────────────────── */}
        {isListening && (
          <div className="max-w-[800px] mx-auto px-6 pt-7">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge color={lesson.free ? "green" : "amber"}>{lesson.free ? "Free" : "Premium"}</Badge>
              <Badge color="blue">{lesson.level}</Badge>
              <Badge color="gray">~{lesson.estimatedMin} min</Badge>
            </div>
            <h1 className="text-3xl font-extrabold text-n-900 mb-2.5">{lesson.title}</h1>
            <p className="text-[15px] text-n-500 mb-6">{lesson.lang} · {lesson.skill} · {lesson.level}</p>

            {!canAccessPremium ? (
              <PremiumGate />
            ) : (
              <>
                <div className="p-5 bg-blue-50 rounded-[14px] border border-blue-100 mb-6 text-[15px] text-blue-700 leading-relaxed">
                  Listen to the audio and answer the questions below. You can replay the audio before submitting your answers.
                </div>

                {/* Mock AudioPlayer */}
                <div className="bg-n-50 border border-n-200 rounded-[14px] p-4 flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <div className="flex-1">
                    <div className="h-1.5 bg-n-200 rounded-full overflow-hidden w-full"><div className="w-0 h-full bg-blue-500"></div></div>
                  </div>
                  <div className="text-xs text-n-400 font-medium">Audio Placeholder</div>
                </div>

                {lesson.transcript && (
                  <div className="mb-8">
                    <h3 className="text-sm font-bold text-n-700 mb-3 uppercase tracking-wider">Transcript</h3>
                    <div className="p-6 bg-white rounded-2xl border border-n-200 text-[15px] leading-[1.8] text-n-600 whitespace-pre-line">
                      {lesson.transcript}
                    </div>
                  </div>
                )}

                {quizQuestions.length > 0 && (
                  <div>
                    <h2 className="text-xl font-extrabold mb-5 text-n-900">Comprehension questions</h2>
                    <QuizRunnerDB
                      questions={quizQuestions}
                      lessonId={lesson.id}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── DICTATION ─────────────────────────────────────────── */}
        {isDictation && (
          <div className="max-w-[680px] mx-auto px-6 pt-7">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge color={lesson.free ? "green" : "amber"}>{lesson.free ? "Free" : "Premium"}</Badge>
              <Badge color="blue">{lesson.level}</Badge>
            </div>
            <h1 className="text-[28px] font-extrabold text-n-900 mb-2">{lesson.title}</h1>
            <p className="text-[15px] text-n-500 mb-6">{lesson.lang} · {lesson.skill} · {lesson.level}</p>

            {!canAccessPremium ? (
              <PremiumGate />
            ) : (
              <>
                <div className="p-5 bg-blue-50 rounded-[14px] border border-blue-100 mb-6 text-[15px] text-blue-700 leading-relaxed">
                  Listen carefully and type what you hear.
                </div>
                <DictationPractice sentences={activeDictationSentences} />
              </>
            )}
          </div>
        )}

        {/* ── VOCABULARY ────────────────────────────────────────── */}
        {isVocab && (
          <div className="max-w-[560px] mx-auto px-6 pt-8 text-center">
            <h1 className="text-[28px] font-extrabold text-n-900 mb-2">{lesson.title}</h1>
            <p className="text-[15px] text-n-500 mb-6">{lesson.lang} · {lesson.skill} · {lesson.level}</p>

            {!canAccessPremium ? (
              <PremiumGate />
            ) : (
              <VocabCards words={VOCAB_PRACTICE_WORDS} />
            )}
          </div>
        )}

        {/* ── READING / GRAMMAR ─────────────────────────────────── */}
        {isReadingOrGrammar && (
          <div className="max-w-container mx-auto px-6 pt-7">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge color={lesson.free ? "green" : "amber"}>{lesson.free ? "Free" : "Premium"}</Badge>
                  <Badge color="blue">{lesson.level}</Badge>
                  <Badge color="gray">~{lesson.estimatedMin} min</Badge>
                  {quizQuestions.length > 0 && <Badge color="gray">{quizQuestions.length} Questions</Badge>}
                </div>
                <h1 className="text-3xl md:text-[36px] font-extrabold text-n-900 mb-2.5 leading-tight">{lesson.title}</h1>
                <p className="text-[15px] text-n-500 mb-7">{lesson.lang} · {lesson.skill} · {lesson.level} · ~{lesson.estimatedMin} min</p>

                {!canAccessPremium ? (
                  <PremiumGate />
                ) : (
                  <>
                    <div className="p-5 bg-blue-50 rounded-[14px] border border-blue-100 mb-7 text-[15px] text-blue-700 leading-relaxed">
                      {isReadingOrGrammar ? "Read the text carefully, then answer the comprehension questions below." : "Complete the lesson exercises below."}
                    </div>

                    {lesson.content && (
                      <div className="bg-white p-8 md:p-10 rounded-[20px] border border-n-200 mb-8 max-w-[760px]">
                        <div className="prose prose-n max-w-none text-n-700 leading-[1.8] whitespace-pre-line text-[16px]">
                          {lesson.content}
                        </div>
                      </div>
                    )}

                    {quizQuestions.length > 0 && (
                      <div className="mt-10">
                        <h2 className="text-[22px] font-extrabold text-n-900 mb-2">Did you understand the text?</h2>
                        <p className="text-[15px] text-n-500 mb-6">Answer the questions below to test your comprehension.</p>
                        <QuizRunnerDB
                          questions={quizQuestions}
                          lessonId={lesson.id}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="p-5 bg-white rounded-2xl border border-n-200 shadow-sm">
                  <h4 className="text-[14px] font-bold text-n-900 mb-3">Lesson progress</h4>
                  <div className="h-1.5 bg-n-100 rounded-full overflow-hidden w-full"><div className="w-[10%] h-full bg-blue-500 rounded-full"></div></div>
                  <p className="text-xs text-n-400 mt-2">Started</p>
                </div>

                {lesson.audioUrl && canAccessPremium && (
                  <div className="p-5 bg-white rounded-2xl border border-n-200 shadow-sm">
                    <h4 className="text-[14px] font-bold text-n-900 mb-3">Listen to the text</h4>
                    <div className="bg-n-50 rounded-xl p-3 flex justify-center items-center">
                      <span className="text-xs text-n-400 font-medium">Audio Placeholder</span>
                    </div>
                  </div>
                )}

                {canAccessPremium && VOCAB_PRACTICE_WORDS.length > 0 && (
                  <div className="p-5 bg-white rounded-2xl border border-n-200 shadow-sm">
                    <h4 className="text-[14px] font-bold text-n-900 mb-4">Key vocabulary</h4>
                    <div className="flex flex-col gap-3">
                      {VOCAB_PRACTICE_WORDS.slice(0, 3).map((v) => (
                        <div key={v.word} className="p-3 bg-n-50 rounded-[10px]">
                          <div className="text-[14px] font-bold text-blue-600 mb-1">{v.word}</div>
                          <div className="text-[13px] text-n-600 leading-tight">{v.meaning}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
