import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FlagIcon } from "@/components/layout/FlagIcon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { getAllActiveLanguages } from "@/server/repositories/languageRepository";
import { getFeaturedFreePublicLessons } from "@/server/services/lessonService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LangPath — Language Learning Platform",
  description:
    "Learn English, German, French and Spanish with reading, listening, dictation, grammar and vocabulary lessons.",
};

export default async function HomePage() {
  const [languages, featuredLessons] = await Promise.all([
    getAllActiveLanguages(),
    getFeaturedFreePublicLessons(3),
  ]);

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#EEF2FF] via-[#F8FAFC] to-[#ECFDF5] border-b border-n-200 py-20">
          <div className="max-w-container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex gap-2 mb-5">
                <Badge color="blue">Free lessons available</Badge>
                <Badge color="green">A1 – C2</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-n-900 leading-tight mb-5 tracking-tight">
                Learn languages with <span className="text-blue-500">short lessons</span> and interactive exercises
              </h1>
              <p className="text-[18px] leading-relaxed text-n-500 mb-8 max-w-lg">
                Practice reading, listening, dictation, grammar and vocabulary through level-based lessons from A1 to C2.
              </p>
              <div className="flex items-center gap-3">
                <Link href="/register">
                  <Button variant="primary" size="lg">Start learning</Button>
                </Link>
                <Link href="#languages-section">
                  <Button variant="outline" size="lg">Explore languages</Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-n-50 rounded-3xl p-8 border border-n-200 grid grid-cols-2 gap-4">
              {[
                { icon: 'globe', label: '16 Languages', color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: 'layers', label: '5 Learning Skills', color: 'text-green-500', bg: 'bg-green-50' },
                { icon: 'award', label: 'A1 – C2 Levels', color: 'text-purple-500', bg: 'bg-purple-50' },
                { icon: 'star', label: 'Free & Premium', color: 'text-amber-500', bg: 'bg-amber-50' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-n-200 shadow-sm">
                  <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                    <Icon name={s.icon} size={20} className={s.color} />
                  </div>
                  <span className="text-sm font-semibold text-n-700">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Language Cards */}
        <section id="languages-section" className="py-20">
          <div className="max-w-container mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-n-900 mb-3">Choose your language</h2>
              <p className="text-base text-n-500 max-w-xl mx-auto">
                Start with one of our most popular languages and build your skills step by step.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {languages.map((lang) => (
                <Link key={lang.id} href={`/${lang.slug}`} className="block transition-transform hover:-translate-y-1">
                  <Card hover className="p-6 h-full border-2 border-transparent hover:border-blue-100 transition-colors">
                    <div className="flex items-center gap-4 mb-4">
                      <FlagIcon lang={lang.slug} size={40} />
                      <span className="text-xl font-bold text-n-900">{lang.name}</span>
                    </div>
                    <p className="text-sm text-n-500 leading-relaxed">{lang.description ?? lang.name}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white border-y border-n-200">
          <div className="max-w-container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-n-900 mb-3">How it works</h2>
              <p className="text-base text-n-500">Three simple steps to start improving your language skills.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { step: '01', title: 'Choose a language & skill', desc: 'Pick from our supported languages and skill types: reading, listening, dictation, grammar, or vocabulary.' },
                { step: '02', title: 'Practice with lessons', desc: 'Work through level-based lessons (A1–C2) with texts, audio, and exercises.' },
                { step: '03', title: 'Track your progress', desc: 'Take quizzes, get instant feedback, and watch your skills improve over time.' },
              ].map(item => (
                <div key={item.step} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-5 text-xl font-extrabold text-blue-500">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-n-900 mb-2.5">{item.title}</h3>
                  <p className="text-sm text-n-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Lessons */}
        <section className="py-20">
          <div className="max-w-container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-n-900 mb-2">Featured free lessons</h2>
                <p className="text-[15px] text-n-500">Start with one of our most popular free lessons.</p>
              </div>
              <Link href="/english/reading">
                <Button variant="outline" size="sm">View all →</Button>
              </Link>
            </div>
            
            {featuredLessons.length === 0 ? (
              <p className="text-n-400 text-sm italic">
                No published lessons yet. Run the seed to add sample data.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {featuredLessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/${lesson.langSlug}/${lesson.skillSlug}/${lesson.slug}`}
                    className="block transition-transform hover:-translate-y-1"
                  >
                    <Card hover className="p-5 flex flex-col gap-3 h-full border-2 border-transparent hover:border-blue-100 transition-colors">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge color="blue">{lesson.level}</Badge>
                        <Badge color="green">Free</Badge>
                        <span className="text-xs font-medium text-n-400 ml-auto">
                          ~{lesson.estimatedMin} min
                        </span>
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-n-900 mb-1.5">{lesson.title}</h3>
                        <p className="text-sm text-n-500 line-clamp-2 leading-relaxed">{lesson.summary}</p>
                      </div>
                      <div className="mt-auto flex items-center gap-2 text-[13px] font-medium text-n-400 pt-3 border-t border-n-100">
                        <span>{lesson.lang}</span>
                        <span>·</span>
                        <span>{lesson.skill}</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="max-w-container mx-auto px-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[24px] p-10 md:p-14 text-center text-white shadow-lg">
              <h2 className="text-3xl font-extrabold mb-3 text-white">Ready to start learning?</h2>
              <p className="text-base text-white/80 mb-8 max-w-lg mx-auto">
                Create a free account to save your progress and access all free lessons.
              </p>
              <Link href="/register">
                <Button variant="primary" size="lg" className="bg-white text-blue-600 hover:bg-n-50 shadow-sm border-none">
                  Create free account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
