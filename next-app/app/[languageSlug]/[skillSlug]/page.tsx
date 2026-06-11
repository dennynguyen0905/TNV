import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/EmptyState";
import { getLanguageBySlug } from "@/server/repositories/languageRepository";
import { getSkillBySlug } from "@/server/repositories/skillRepository";
import { getPublicLessonsForSkill } from "@/server/services/lessonService";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ languageSlug: string; skillSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { languageSlug, skillSlug } = await params;
  const [lang, skill] = await Promise.all([
    getLanguageBySlug(languageSlug),
    getSkillBySlug(skillSlug),
  ]);
  if (!lang || !skill) return { title: "Not found" };
  return {
    title: `${lang.name} ${skill.name} Lessons`,
    description: `Browse ${lang.name} ${skill.name} lessons from A1 to C2.`,
    alternates: { canonical: `/${lang.slug}/${skill.slug}` },
  };
}

export default async function SkillLessonListPage({ params }: Props) {
  const { languageSlug, skillSlug } = await params;
  const [lang, skill] = await Promise.all([
    getLanguageBySlug(languageSlug),
    getSkillBySlug(skillSlug),
  ]);
  if (!lang || !skill) notFound();

  const lessons = await getPublicLessonsForSkill(languageSlug, skillSlug);

  return (
    <>
      <Header />
      <main>
        <section className="bg-white border-b border-n-200 py-8">
          <div className="max-w-container mx-auto px-6">
            <nav className="text-sm text-n-400 mb-4">
              <Link href="/" className="hover:text-n-600">
                Home
              </Link>
              <span className="mx-2">›</span>
              <Link href={`/${lang.slug}`} className="hover:text-n-600">
                {lang.name}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-n-700">{skill.name}</span>
            </nav>
            <h1 className="text-2xl font-bold text-n-900">
              {lang.name} — {skill.name}
            </h1>
            <p className="text-n-500 mt-1">{lessons.length} lessons available</p>
          </div>
        </section>

        <section className="py-10">
          <div className="max-w-container mx-auto px-6">
            {lessons.length === 0 ? (
              <Card>
                <EmptyState
                  icon="book"
                  title={`No ${lang.name} ${skill.name} lessons yet`}
                  description="New lessons are published regularly. Check back soon or explore another skill."
                  action={
                    <Link
                      href={`/${lang.slug}`}
                      className="text-sm font-medium text-blue-500 hover:text-blue-700"
                    >
                      ← Back to {lang.name} skills
                    </Link>
                  }
                />
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/${lang.slug}/${skill.slug}/${lesson.slug}`}
                    className="no-underline"
                  >
                    <Card hover className="p-5 flex flex-col gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge color="blue">{lesson.level}</Badge>
                        {lesson.free ? (
                          <Badge color="green">Free</Badge>
                        ) : (
                          <Badge color="amber">Premium</Badge>
                        )}
                        <span className="text-xs text-n-400 ml-auto flex items-center gap-1">
                          <Icon name="clock" size={12} />~{lesson.estimatedMin} min
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-n-900 mb-1">{lesson.title}</h3>
                        <p className="text-sm text-n-500 line-clamp-2">{lesson.summary}</p>
                      </div>
                      <div className="mt-auto text-xs text-n-400">
                        {lesson.questionCount} questions
                        {lesson.hasPdf ? " · PDF available" : ""}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
