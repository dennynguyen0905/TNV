import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { LANGUAGES_DATA } from "@/data/constants/languages";
import { SAMPLE_LESSONS } from "@/data/mock/lessons";

interface Props {
  params: Promise<{ languageSlug: string; skillSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { languageSlug, skillSlug } = await params;
  const lang = LANGUAGES_DATA.find((l) => l.slug === languageSlug);
  if (!lang) return { title: "Not found" };
  const skill = lang.skills.find((s) => s.toLowerCase() === skillSlug.toLowerCase());
  return {
    title: `${lang.name} ${skill ?? skillSlug} Lessons`,
    description: `Browse ${lang.name} ${skill ?? skillSlug} lessons from A1 to C2.`,
  };
}

export default async function SkillLessonListPage({ params }: Props) {
  const { languageSlug, skillSlug } = await params;
  const lang = LANGUAGES_DATA.find((l) => l.slug === languageSlug);
  if (!lang) notFound();

  const skill = lang.skills.find((s) => s.toLowerCase() === skillSlug.toLowerCase());
  if (!skill) notFound();

  const lessons = SAMPLE_LESSONS.filter(
    (l) => l.lang.toLowerCase() === lang.name.toLowerCase() && l.skill.toLowerCase() === skill.toLowerCase()
  );

  return (
    <>
      <Header />
      <main>
        <section className="bg-white border-b border-n-200 py-8">
          <div className="max-w-container mx-auto px-6">
            <nav className="text-sm text-n-400 mb-4">
              <Link href="/" className="hover:text-n-600">Home</Link>
              <span className="mx-2">›</span>
              <Link href={`/${lang.slug}`} className="hover:text-n-600">{lang.name}</Link>
              <span className="mx-2">›</span>
              <span className="text-n-700">{skill}</span>
            </nav>
            <h1 className="text-2xl font-bold text-n-900">
              {lang.name} — {skill}
            </h1>
            <p className="text-n-500 mt-1">{lessons.length} lessons available</p>
          </div>
        </section>

        <section className="py-10">
          <div className="max-w-container mx-auto px-6">
            {lessons.length === 0 ? (
              <Card className="p-8 text-center text-n-400">
                <p>No lessons available yet for {lang.name} {skill}.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/${lang.slug}/${skillSlug}/${lesson.id}`}
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
                          <Icon name="clock" size={12} />
                          {lesson.time}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-n-900 mb-1">{lesson.title}</h3>
                        <p className="text-sm text-n-500 line-clamp-2">{lesson.summary}</p>
                      </div>
                      <div className="mt-auto text-xs text-n-400">
                        {lesson.questions} questions{lesson.hasPdf ? " · PDF available" : ""}
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
