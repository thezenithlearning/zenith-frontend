import { NextResponse } from 'next/server';
import { fetchSitemapEntries } from '@/features/page/api/publicPageApi';
import { SITE_URL } from '@/features/page/config';

export const revalidate = 3600; // Regenerate sitemap every hour at most

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Published, indexable CMS pages (Dashboard → Pages).
export async function GET() {
  const entries = await fetchSitemapEntries();

  const urls = entries
    .map(
      (entry) => `
  <url>
    <loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>
    <lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>${
      entry.changeFrequency ? `\n    <changefreq>${entry.changeFrequency}</changefreq>` : ''
    }${entry.priority !== null ? `\n    <priority>${entry.priority}</priority>` : ''}
  </url>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
