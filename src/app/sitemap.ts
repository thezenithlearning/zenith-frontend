import type { MetadataRoute } from "next";

const SITE_URL = "https://thezenithlearning.com";

// Static routes. Blog posts and CMS pages are listed in the sub-sitemaps
// (/sitemaps/blog.xml and /sitemaps/pages.xml), advertised from robots.ts.
const ROUTES = [
  "",
  "/about-us",
  "/course",
  "/blog",
  "/mock-tests",
  "/pyqs",
  "/qna",
  "/faqs",
  "/contact-us",
  "/privacy-policy",
  "/terms-conditions",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
