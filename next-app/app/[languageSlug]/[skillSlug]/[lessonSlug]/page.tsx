import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { DictationPractice } from "@/components/lesson/DictationPractice";
import { VocabCards } from "@/components/lesson/VocabCards";
import { SAMPLE_LESSONS } from "@/data/mock/lessons";
import { LANGUAGES_DATA } from "@/data/constants/languages";
import { LESSON_TEXT, VOCAB_WORDS, QUIZ_QUESTIONS, getQuestionsByLessonId } from "@/data/mock/questions";
import { VOCAB_PRACTICE_WORDS } from "@/data/mock/vocabulary";
import type { Question, QuizQuestion } from "@/data/types";

interface Props {
  params: Promise<{ languageSlug: string; skillSlug: string; lessonSlug: string }>;
}

// Map SAMPLE_LESSONS slug → MOCK_QUESTIONS lessonId
const SLUG_TO_LESSON_ID: Record<string, number> = {
  "first-day-school": 1,
  "weekend-plans":    2,
  "city-tour":        3,
  "morning-routine":  5,
  "at-the-market":    10,
};

function quizQuestionsToFull(qqs: QuizQuestion[], lessonTitle: string): Question[] {
  return qqs.map((q, i) => ({
    id: 1000 + i,
    lessonId: -1,
    lessonTitle,
    type: "SINGLE_CHOICE" as const,
    prompt: q.prompt,
    options: q.options,
    correctIdx: q.correct,
    correctIndices: [],
    answer: "",
    explanation: "",
    sortOrder: i + 1,
  }));
}

const DICTATION_SENTENCES = [
  { id: 1, text: "The cat is on the table." },
  { id: 2, text: "I go to school every day." },
  { id: 3, text: "She likes to read books." },
  { id: 4, text: "We have a big house." },
  { id: 5, text: "He drinks coffee in the morning." },
];

const LISTENING_TRANSCRIPTS: Record<string, string> = {
  "morning-routine":
    "I wake up at half past six every morning. First, I make coffee. Then I take a shower and get dressed. I read the news while I drink my coffee. The bus ride from home to work takes about twenty minutes. I usually arrive at the office by eight o'clock.",
  "at-the-market":
    "Customer: Excuse me, how much are the apples today?\nSeller: They are two euros per kilogram.\nCustomer: Great! I'll take one kilogram, please.\nSeller: Of course. Would you like anything else?\nCustomer: Yes, I'd also like some strawberries.\nSeller: The strawberries are very fresh today — three euros for a box.\nCustomer: Perfect, I'll take one box. Thank you!\nSeller: Thank you! Here is your change.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = SAMPLE_LESSONS.find((l) => l.id === lessonSlug);
  if (!lesson) return { title: "Lesson not found" };
  return { title: lesson.title, description: lesson.summary };
}

export default async function LessonDetailPage({ params }: Props) {
  const { languageSlug, skillSlug, lessonSlug } = await params;
  const lang = LANGUAGES_DATA.find((l) => l.slug === languageSlug);
  const lesson = SAMPLE_LESSONS.find((l) => l.id === lessonSlug);
  if (!lang || !lesson) notFound();

  const lessonId = SLUG_TO_LESSON_ID[lessonSlug];
  const mockQuestions = lessonId ? getQuestionsByLessonId(lessonId) : [];

  // For first-day-school prefer the richer 5-question QUIZ_QUESTIONS set
  const quizQuestions: Question[] =
    lessonSlug === "first-day-school"
      ? quizQuestionsToFull(QUIZ_QUESTIONS, lesson.title)
      : mockQuestions;

  const isListening  = lesson.skill === "Listening";
  const isDictation  = lesson.skill === "Dictation";
  const isVocab      = lesson.skill === "Vocabulary";
  const transcript   = LISTENING_TRANSCRIPTS[lessonSlug];

  const sidebarVocab = lessonSlug === "first-day-school" ? VOCAB_WORDS : [];

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
                <Badge color="gray">{lesson.skill}</Badge>
                <span className="text-xs text-n-400">{lesson.time}</span>
              </div>
              <h1 className="text-2xl font-bold text-n-900 mb-2">{lesson.title}</h1>
              <p className="text-n-600">{lesson.summary}</p>
            </Card>

            {/* ── LISTENING ─────────────────────────────────────────── */}
            {isListening && (
              <Card className="p-6">
                <h2 className="text-base font-semibold text-n-800 mb-4">Listen</h2>
                {/* Audio player placeholder */}
                <div className="flex items-center gap-4 bg-n-50 rounded-lg px-4 py-3 mb-4 border border-n-200">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                      <polygon points="5 3 19 12 5 21 5 3" fill="#3b82f6" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-n-200 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-blue-400 rounded-full" />
                      </div>
                      <span className="text-xs text-n-400 shrink-0">{lesson.time}</span>
                    </div>
                    <p className="text-xs text-n-400 italic">Audio file — not available in mock mode</p>
                  </div>
                </div>

                {transcript && (
                  <>
                    <h3 className="text-sm font-semibold text-n-700 mb-2">Transcript</h3>
                    <div className="bg-n-50 rounded-lg p-4 text-sm text-n-700 leading-relaxed whitespace-pre-line border border-n-100">
                      {transcript}
                    </div>
                  </>
                )}
              </Card>
            )}

            {/* ── READING / GRAMMAR content ─────────────────────────── */}
            {!isListening && !isDictation && !isVocab && (
              <Card className="p-6">
                <h2 className="text-base font-semibold text-n-800 mb-4">Read</h2>
                {lessonSlug === "first-day-school" ? (
                  <div className="prose prose-sm max-w-none text-n-700 leading-relaxed whitespace-pre-line">
                    {LESSON_TEXT}
                  </div>
                ) : (
                  <p className="text-n-400 italic text-sm">
                    Lesson text for &ldquo;{lesson.title}&rdquo; — content will be added when Prisma is connected.
                  </p>
                )}
              </Card>
            )}

            {/* ── DICTATION ─────────────────────────────────────────── */}
            {isDictation && (
              <Card className="p-6">
                <h2 className="text-base font-semibold text-n-800 mb-4">Dictation Practice</h2>
                <DictationPractice sentences={DICTATION_SENTENCES} />
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
                  Quiz — {quizQuestions.length} question{quizQuestions.length !== 1 ? "s" : ""}
                </h2>
                <QuizRunner questions={quizQuestions} lessonTitle={lesson.title} />
              </Card>
            )}

            {!isDictation && quizQuestions.length === 0 && lesson.questions > 0 && (
              <Card className="p-6">
                <h2 className="text-base font-semibold text-n-800 mb-2">
                  Quiz — {lesson.questions} questions
                </h2>
                <p className="text-n-400 italic text-sm">
                  Quiz questions will be available once content is loaded from the database.
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Vocabulary sidebar (reading lessons) */}
            {sidebarVocab.length > 0 && (
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-n-800 mb-3">Key Vocabulary</h3>
                <div className="space-y-3">
                  {sidebarVocab.map((v) => (
                    <div key={v.word}>
                      <p className="text-sm font-semibold text-n-800">{v.word}</p>
                      <p className="text-xs text-n-500">{v.meaning}</p>
                      <p className="text-xs text-n-400 italic mt-0.5">&ldquo;{v.example}&rdquo;</p>
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
                {!isDictation && (
                  <div className="flex justify-between">
                    <dt className="text-n-500">Questions</dt>
                    <dd className="text-n-700">{lesson.questions}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-n-500">Access</dt>
                  <dd>{lesson.free ? <Badge color="green">Free</Badge> : <Badge color="amber">Premium</Badge>}</dd>
                </div>
              </dl>
            </Card>

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
