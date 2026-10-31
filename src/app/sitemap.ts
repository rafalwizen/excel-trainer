import type { MetadataRoute } from "next";

/** Public pages only — lesson pages sit behind a session. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.BASE_URL ?? "http://localhost:3000";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/logowanie`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/rejestracja`, changeFrequency: "yearly", priority: 0.5 },
  ];
}
