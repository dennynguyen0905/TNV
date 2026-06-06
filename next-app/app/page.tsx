import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FlagIcon } from "@/components/layout/FlagIcon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LANGUAGES_DATA } from "@/data/constants/languages";
import { SAMPLE_LESSONS } from "@/data/mock/lessons";

export const metadata: Metadata = {
  title: "LangPath — Language Learning Platform",
  description: "Learn English, German, French and Spanish with reading, listening, dictation, grammar and vocabulary lessons.",
};

export default function HomePage() {
  const featuredLessons = SAMPLE_LESSONS.filter((l) => l.free).slice(0, 3);

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-white border-b border-n-200 py-20">
          <div className="max-w-container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-n-900 mb-4">
              Learn a language,<br />one lesson at a time
            </h1>
            <p className="text-lg text-n-500 mb-8 max-w-xl mx-auto">
              Practice reading, listening, dictation, grammar, and vocabulary with structured CEFR lessons.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/register"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-btn transition-colors"
              >
                Start for free
              </Link>
              <Link
                href="/english"
                className="text-n-700 hover:text-n-900 font-medium px-6 py-3 rounded-btn border border-n-200 hover:border-n-300 bg-white transition-colors"
              >
                Browse lessons
              </Link>
            </div>
          </div>
        </section>

        {/* Languages */}
        <section className="py-16">
          <div className="max-w-container mx-auto px-6">
            <h2 className="text-2xl font-bold text-n-900 mb-2">Choose your language</h2>
            <p className="text-n-500 mb-8">Select a language to explore skills and lessons.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {LANGUAGES_DATA.map((lang) => (
                <Link key={lang.id} href={`/${lang.slug}`} className="no-underline">
                  <Card hover className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <FlagIcon lang={lang.slug} size={36} />
                      <span className="text-lg font-semibold text-n-900">{lang.name}</span>
                    </div>
                    <p className="text-sm text-n-500">{lang.meta}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured lessons */}
        <section className="py-16 bg-white border-t border-n-200">
          <div className="max-w-container mx-auto px-6">
            <h2 className="text-2xl font-bold text-n-900 mb-2">Featured free lessons</h2>
            <p className="text-n-500 mb-8">Start learning today — no account required.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featuredLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/${lesson.lang.toLowerCase()}/${lesson.skill.toLowerCase()}/${lesson.id}`}
                  className="no-underline"
                >
                  <Card hover className="p-5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge color="blue">{lesson.level}</Badge>
                      <Badge color="green">Free</Badge>
                      <span className="text-xs text-n-400 ml-auto">{lesson.time}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-n-900 mb-1">{lesson.title}</h3>
                      <p className="text-sm text-n-500 line-clamp-2">{lesson.summary}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-2 text-xs text-n-400">
                      <span>{lesson.lang}</span>
                      <span>·</span>
                      <span>{lesson.skill}</span>
                      <span>·</span>
                      <span>{lesson.questions} questions</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
