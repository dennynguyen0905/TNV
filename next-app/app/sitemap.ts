import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";
import { getPublishedLessons } from "@/server/repositories/lessonRepository";
import { getAllActiveLanguages } from "@/server/repositories/languageRepository";
import { getAllActiveSkills } from "@/server/repositories/skillRepository";

export const dynamic = "force-dynamic";

/**
 * Sitemap contains ONLY public, published content:
 *  - the home page
 *  - active language landing pages
 *  - active language × skill list pages
 *  - PUBLISHED lessons (getPublishedLessons filters status = PUBLISHED)
 *
 * Admin, API, dashboard and auth routes are intentionally excluded (and also
 * blocked in robots.ts). Draft / review / archived lessons never appear.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [lessons, languages, skills] = await Promise.all([
    getPublishedLessons(),
    getAllActiveLanguages(),
    getAllActiveSkills(),
  ]);

  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
  ];

  for (const lang of languages) {
    entries.push({
      url: `${SITE_URL}/${lang.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const skill of skills) {
      entries.push({
        url: `${SITE_URL}/${lang.slug}/${skill.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  for (const lesson of lessons) {
    entries.push({
      url: `${SITE_URL}/${lesson.language.slug}/${lesson.skill.slug}/${lesson.slug}`,
      lastModified: lesson.updatedAt ?? lesson.publishedAt ?? now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
