import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.BASE_URL ?? "http://localhost:3000";
  return {
    // /lekcje and below redirect anonymous visitors to /logowanie,
    // and /profil is personal — keep crawlers on public content.
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/lekcje", "/profil"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
