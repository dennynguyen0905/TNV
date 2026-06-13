import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FlagIcon } from "@/components/layout/FlagIcon";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getLanguageBySlug } from "@/server/repositories/languageRepository";
import { getAllActiveSkills } from "@/server/repositories/skillRepository";
import { getPopularLessonsForLanguage } from "@/server/services/lessonService";
import { SKILL_ICONS, SKILL_COLORS } from "@/data/constants/skills";
import type { SkillName } from "@/data/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ languageSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { languageSlug } = await params;
  const lang = await getLanguageBySlug(languageSlug);
  if (!lang) return { title: "Language not found" };
  return {
    title: `Learn ${lang.name} Online`,
    description: `${lang.description ?? lang.name} — choose a skill to start learning ${lang.name}.`,
  };
}

const skillDescs: Record<string, string> = {
  Reading: "Improve comprehension with short texts and questions.",
  Listening: "Listen to spoken audio and answer comprehension questions.",
  Dictation: "Train your ear by typing what you hear.",
  Grammar: "Practice verb tenses, sentence structure and common patterns.",
  Vocabulary: "Learn words by topic and review difficult terms.",
};

export default async function LanguagePage({ params }: Props) {
  const { languageSlug } = await params;
  const [lang, skills, popularLessons] = await Promise.all([
    getLanguageBySlug(languageSlug),
    getAllActiveSkills(),
    getPopularLessonsForLanguage(languageSlug, 3)
  ]);
  
  if (!lang) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pb-16">
        <div className="max-w-container mx-auto px-6 pt-7">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: lang.name },
            ]}
          />
        </div>

        {/* Hero */}
        <section className="pt-10">
          <div className="max-w-container mx-auto px-6">
            <div className="flex items-center gap-4 mb-3">
              <FlagIcon lang={lang.slug} size={40} />
              <h1 className="text-3xl md:text-4xl font-extrabold text-n-900">Learn {lang.name} Online</h1>
            </div>
            <p className="text-[17px] text-n-500 max-w-2xl mb-10 leading-relaxed">
              Choose a skill and practice {lang.name} with level-based lessons, exercises and instant feedback.
            </p>
          </div>
        </section>

        {/* Skills */}
        <section>
          <div className="max-w-container mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {skills.map((skill) => {
                const skillName = skill.name as SkillName;
                const colors = SKILL_COLORS[skillName] ?? { bg: "#e5e7eb", accent: "#6b7280" };
                const iconName = SKILL_ICONS[skillName] ?? "book";
                const desc = skillDescs[skillName] || `Browse ${lang.name} ${skill.name} lessons`;
                
                return (
                  <Link
                    key={skill.id}
                    href={`/${lang.slug}/${skill.slug}`}
                    className="block transition-transform hover:-translate-y-1"
                  >
                    <Card hover className="p-6 h-full border-2 border-transparent hover:border-blue-100 transition-colors">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: colors.bg, color: colors.accent }}
                      >
                        <Icon name={iconName} size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-n-900 mb-1.5">{skill.name}</h3>
                      <p className="text-[13px] text-n-500 leading-relaxed">{desc}</p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Quick stats */}
        <section className="pt-12">
          <div className="max-w-container mx-auto px-6">
            <h2 className="text-[22px] font-bold text-n-900 mb-5">What&apos;s available</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Reading texts', value: '368', icon: 'book', color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Listening texts', value: '153', icon: 'headphones', color: 'text-purple-500', bg: 'bg-purple-50' },
                { label: 'CEFR levels', value: '6', icon: 'layers', color: 'text-green-500', bg: 'bg-green-50' },
              ].map(s => (
                <div key={s.label} className="p-5 bg-white rounded-2xl border border-n-200 flex items-center gap-4 shadow-sm">
                  <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                    <Icon name={s.icon} size={20} className={s.color} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-n-900">{s.value}</div>
                    <div className="text-[13px] text-n-500">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Popular lessons preview */}
        {popularLessons.length > 0 && (
          <section className="pt-12">
            <div className="max-w-container mx-auto px-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-[22px] font-bold text-n-900">Popular {lang.name} lessons</h2>
                <Link href={`/${lang.slug}/reading`}>
                  <Button variant="ghost" size="sm">See all &rarr;</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {popularLessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/${lang.slug}/${lesson.skillSlug}/${lesson.slug}`}
                    className="block transition-transform hover:-translate-y-1"
                  >
                    <Card hover className="p-5 flex flex-col gap-3 h-full border-2 border-transparent hover:border-blue-100 transition-colors">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge color="blue">{lesson.level}</Badge>
                        {lesson.free ? (
                          <Badge color="green">Free</Badge>
                        ) : (
                          <Badge color="amber">Premium</Badge>
                        )}
                        <span className="text-xs font-medium text-n-400 ml-auto flex items-center gap-1">
                          <Icon name="clock" size={12} />~{lesson.estimatedMin} min
                        </span>
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-n-900 mb-1.5">{lesson.title}</h3>
                        <p className="text-sm text-n-500 line-clamp-2 leading-relaxed">{lesson.summary}</p>
                      </div>
                      <div className="mt-auto text-[13px] font-medium text-n-400 pt-3 border-t border-n-100 flex justify-between">
                        <span>{lesson.questionCount} questions</span>
                        {lesson.skill}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
