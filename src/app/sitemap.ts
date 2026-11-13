import type { MetadataRoute } from "next";
import { allLessons } from "@/content/registry";

/** Public pages plus every public lesson (requiresAuth lessons stay out). */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.BASE_URL ?? "http://localhost:3000";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/lekcje`, changeFrequency: "weekly", priority: 0.9 },
    ...allLessons
      .filter((lesson) => !lesson.requiresAuth)
      .map((lesson) => ({
        url: `${base}/lekcje/${lesson.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    { url: `${base}/logowanie`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/rejestracja`, changeFrequency: "yearly", priority: 0.5 },
  ];
}
