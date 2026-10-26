// Same resolution as services/baseApi.ts, without importing the client-only RTK Query
// setup, so server components (public page rendering, sitemap) can use it too.
const resolveApiBaseUrl = (): string => {
  const raw = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1')
    .trim()
    .replace(/\/+$/, '');
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
};

export const PAGES_ENDPOINT = `${resolveApiBaseUrl()}/pages`;

/** Public website origin, used for URL previews and the sitemap. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thezenithlearning.com').replace(
  /\/+$/,
  '',
);

export const DASHBOARD_PAGES_PATH = '/dashboard/pages';

export const TREE_BRANCH_LIMIT = 200;
