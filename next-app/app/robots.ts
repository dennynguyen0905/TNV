import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

/**
 * Block crawlers from non-public surfaces. Admin CMS, API routes, the learner
 * dashboard, and auth pages must never be indexed. Everything else (public
 * lesson content) is allowed, and the sitemap points only to published content.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/dashboard", "/login", "/register"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
