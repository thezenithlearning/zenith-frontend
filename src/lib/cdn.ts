// Central helper for building media URLs.
//
// All uploaded media is served by the CDN (CloudFront on a media subdomain,
// e.g. https://media.thezenithlearning.com) straight from object storage; the API never
// streams files. The base is set per environment via NEXT_PUBLIC_CDN_BASE_URL.
// When it is empty, keys resolve against the site origin, so files placed in
// `public/` keep working in local development.
export const CDN_BASE = (process.env.NEXT_PUBLIC_CDN_BASE_URL || "").replace(
  /\/+$/,
  "",
);

const ABSOLUTE_URL = /^https?:\/\//i;

// Old deployments served media through the API (`<host>/api/v1/assets/<key>`).
const LEGACY_API_ASSET_URL = /^https?:\/\/[^/]+\/api\/v1\/assets\//i;

const encodeKey = (key: string): string =>
  key
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");

/**
 * Build a public media URL from an object key or relative path.
 *   cdn("blogs/banners/physics--1a2b.webp") -> https://media.thezenithlearning.com/blogs/banners/physics--1a2b.webp
 *   cdn("/hero.webp")                   -> https://media.thezenithlearning.com/hero.webp
 * Absolute URLs are returned unchanged, except legacy `…/api/v1/assets/<key>`
 * URLs, which are mapped onto the CDN.
 */
export const cdn = (path: string): string => {
  if (!path) return "";

  const legacy = LEGACY_API_ASSET_URL.exec(path);
  if (legacy) return `${CDN_BASE}/${path.slice(legacy[0].length)}`;

  if (ABSOLUTE_URL.test(path)) return path;

  return `${CDN_BASE}/${encodeKey(path.replace(/^\/+/, ""))}`;
};
