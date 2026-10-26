import { SITE_URL } from '@/features/page/config';

/** Mirrors the backend's slugifyTitle so the form can suggest a slug live. */
export function slugifyTitle(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100)
    .replace(/-$/, '');
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSlug(slug: string): string | null {
  if (!slug) return 'Slug is required';
  if (slug.length > 100) return 'Slug must be 100 characters or fewer';
  if (!SLUG_PATTERN.test(slug)) {
    return 'Use lowercase letters, numbers and single hyphens only';
  }

  return null;
}

export function publicUrlFor(path: string): string {
  return `${SITE_URL}${path === '/' ? '' : path}`;
}

/** "/exams/upsc" + "syllabus" -> "/exams/upsc/syllabus" ; root parent "" -> "/syllabus" */
export function joinPath(parentPath: string, slug: string): string {
  return `${parentPath === '/' ? '' : parentPath}/${slug || '…'}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** <input type="datetime-local"> value <-> ISO string. */
export function toLocalInput(iso: string | null): string {
  if (!iso) return '';

  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function fromLocalInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}
