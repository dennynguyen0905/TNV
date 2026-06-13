import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Icon } from "@/components/ui/Icon";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getLanguageBySlug } from "@/server/repositories/languageRepository";
import { getSkillBySlug } from "@/server/repositories/skillRepository";
import { getPublicLessonsForSkill } from "@/server/services/lessonService";
import { LessonListClient } from "./LessonListClient";
import { SKILL_ICONS, SKILL_COLORS } from "@/data/constants/skills";
import type { SkillName } from "@/data/types";

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

  const skillName = skill.name as SkillName;
  const colors = SKILL_COLORS[skillName] ?? { bg: "#eef2ff", accent: "#3b82f6" };
  const iconName = SKILL_ICONS[skillName] ?? "book";

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pb-16">
        <div className="max-w-container mx-auto px-6 pt-7">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: lang.name, href: `/${lang.slug}` },
              { label: skill.name },
            ]}
          />
        </div>

        <section className="pt-8 pb-10">
          <div className="max-w-container mx-auto px-6">
            <div className="flex items-center gap-4 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: colors.bg, color: colors.accent }}
              >
                <Icon name={iconName} size={24} />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-n-900">
                {lang.name} {skill.name}
              </h1>
            </div>
            <p className="text-[17px] text-n-500 max-w-2xl mb-8 leading-relaxed">
              Browse {skill.name.toLowerCase()} lessons for {lang.name} learners, from beginner to advanced.
            </p>

            <LessonListClient
              lessons={lessons}
              languageSlug={lang.slug}
              skillSlug={skill.slug}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
