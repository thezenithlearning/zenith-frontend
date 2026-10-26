import { cache } from 'react';

import { PAGES_ENDPOINT } from '../config';
import type { ResolveResult, SitemapEntry } from '../types';

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Resolves a public URL on the server. Returns null when nothing is
 * published there. Wrapped in cache() so generateMetadata and the page
 * itself share one request.
 */
export const resolvePublicPath = cache(
  async (segments: string[]): Promise<ResolveResult | null> => {
    const path = segments.map(decodeSegment).join('/');

    const response = await fetch(
      `${PAGES_ENDPOINT}/public/resolve?path=${encodeURIComponent(path)}`,
      {
        // Never serve a stale page: edits and unpublishing must show immediately.
        cache: 'no-store',
      },
    );

    if (response.status === 404) return null;

    if (!response.ok) {
      throw new Error(`Page service responded with ${response.status}`);
    }

    return ((await response.json()) as { data: ResolveResult }).data;
  },
);

export async function fetchSitemapEntries(): Promise<SitemapEntry[]> {
  try {
    const response = await fetch(`${PAGES_ENDPOINT}/public/sitemap`, {
      // Sitemaps are crawled, not browsed: a short cache is fine.
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    return ((await response.json()) as { data: SitemapEntry[] }).data;
  } catch {
    // Backend unreachable (e.g. during a build): serve an empty sitemap rather than failing.
    return [];
  }
}
