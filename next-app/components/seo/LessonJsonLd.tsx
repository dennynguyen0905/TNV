import { absoluteUrl } from "@/lib/config";

interface LessonJsonLdProps {
  title: string;
  description: string;
  url: string;
  lang: string;
  skill: string;
  level: string;
  free: boolean;
}

/**
 * Basic JSON-LD for an educational lesson page (schema.org LearningResource).
 * This is an MVP placeholder — it surfaces the lesson as structured data for
 * search engines without committing to a full Course/educational program graph.
 * Rendered only on public, published lesson pages.
 */
export function LessonJsonLd({
  title,
  description,
  url,
  lang,
  skill,
  level,
  free,
}: LessonJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: title,
    description: description || `${lang} ${skill} lesson (${level}) on LangPath.`,
    url: absoluteUrl(url),
    inLanguage: lang,
    educationalLevel: level,
    learningResourceType: `${skill} lesson`,
    teaches: `${lang} ${skill}`,
    isAccessibleForFree: free,
    provider: {
      "@type": "Organization",
      name: "LangPath",
      url: absoluteUrl("/"),
    },
  };

  return (
    <script
      type="application/ld+json"
      // Structured data is static, server-rendered, and not user-controlled.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
