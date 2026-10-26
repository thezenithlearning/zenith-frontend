import type { MetadataRoute } from "next";

const SITE_URL = "https://thezenithlearning.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/login"] },
    sitemap: [
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemaps/blog.xml`,
      `${SITE_URL}/sitemaps/pages.xml`,
    ],
    host: SITE_URL,
  };
}
