import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FlagIcon } from "@/components/layout/FlagIcon";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { LANGUAGES_DATA } from "@/data/constants/languages";
import { SKILL_ICONS, SKILL_COLORS } from "@/data/constants/skills";
import type { SkillName } from "@/data/types";

interface Props {
  params: Promise<{ languageSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { languageSlug } = await params;
  const lang = LANGUAGES_DATA.find((l) => l.slug === languageSlug);
  if (!lang) return { title: "Language not found" };
  return {
    title: `Learn ${lang.name}`,
    description: `${lang.meta} — choose a skill to start learning ${lang.name}.`,
  };
}

export function generateStaticParams() {
  return LANGUAGES_DATA.map((l) => ({ languageSlug: l.slug }));
}

export default async function LanguagePage({ params }: Props) {
  const { languageSlug } = await params;
  const lang = LANGUAGES_DATA.find((l) => l.slug === languageSlug);
  if (!lang) notFound();

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-white border-b border-n-200 py-10">
          <div className="max-w-container mx-auto px-6">
            <nav className="text-sm text-n-400 mb-4">
              <Link href="/" className="hover:text-n-600">Home</Link>
              <span className="mx-2">›</span>
              <span className="text-n-700">{lang.name}</span>
            </nav>
            <div className="flex items-center gap-4">
              <FlagIcon lang={lang.slug} size={48} />
              <div>
                <h1 className="text-3xl font-bold text-n-900">{lang.name}</h1>
                <p className="text-n-500 mt-1">{lang.meta}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="py-12">
          <div className="max-w-container mx-auto px-6">
            <h2 className="text-xl font-semibold text-n-800 mb-6">Choose a skill</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lang.skills.map((skill) => {
                const skillName = skill as SkillName;
                const colors = SKILL_COLORS[skillName];
                const iconName = SKILL_ICONS[skillName];
                return (
                  <Link
                    key={skill}
                    href={`/${lang.slug}/${skill.toLowerCase()}`}
                    className="no-underline"
                  >
                    <Card hover className="p-6">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: colors.bg, color: colors.accent }}
                      >
                        <Icon name={iconName} size={22} />
                      </div>
                      <h3 className="font-semibold text-n-900 mb-1">{skill}</h3>
                      <p className="text-sm text-n-500">Browse {lang.name} {skill} lessons</p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
