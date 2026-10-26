import { NextResponse } from "next/server";

interface IBlog {
  slug: string;
  updatedAt: string;
}

interface SitemapApiResponse {
  success: boolean;
  data: IBlog[];
}

const SITE_URL = "https://thezenithlearning.com";

// Fetch the base backend API URL, default to localhost during development
const resolveApiBaseUrl = (): string => {
  const raw = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"
  )
    .trim()
    .replace(/\/+$/, "");
  return raw.endsWith("/api/v1") ? raw : `${raw}/api/v1`;
};

export const revalidate = 3600; // Regenerate sitemap every hour at most

export async function GET() {
  try {
    const apiBase = resolveApiBaseUrl();
    // Fetch only slug and updatedAt from the new backend endpoint
    const response = await fetch(`${apiBase}/blogs/sitemap-data`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blogs, status: ${response.status}`);
    }

    const result: SitemapApiResponse = await response.json();
    const blogs = result?.data || [];

    const urls = blogs
      .map(
        (blog) => `
  <url>
    <loc>${SITE_URL}/blog/${blog.slug}</loc>
    <lastmod>${new Date(blog.updatedAt).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`,
      )
      .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>${urls}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating dynamic blog sitemap:", error);
    // Fallback static sitemap with just the blog index page
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    return new NextResponse(fallbackXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
}
