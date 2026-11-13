import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.BASE_URL ?? "http://localhost:3000";
  return {
    // Lesson pages are public SEO content; /profil is personal and /api/
    // is machine-only — keep crawlers off those alone.
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/profil"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
