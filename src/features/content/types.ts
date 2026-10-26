// Shared types + helpers for the FAQ / Mock Test / PYQ modules.

export type PublishStatus = 'draft' | 'published' | 'scheduled';

export interface CategoryRef {
  _id: string;
  name: string;
  slug: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContentStats {
  total: number;
  published: number;
  scheduled: number;
  draft: number;
}

export interface PublishFields {
  status: PublishStatus;
  publishAt?: string | null;
  publishedAt?: string | null;
  /** computed by the API for admin views */
  isLive?: boolean;
  displayStatus?: PublishStatus;
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  stats?: ContentStats;
}

export interface ItemResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PublishInput {
  status: PublishStatus;
  /** ISO string, only meaningful when status === 'scheduled' */
  publishAt?: string;
}

/** ISO string → value for <input type="datetime-local"> in the viewer's timezone. */
export const toLocalInput = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** <input type="datetime-local"> value → ISO string (undefined when blank/invalid). */
export const fromLocalInput = (value: string): string | undefined => {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

export const formatDateTime = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (iso?: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Pulls a readable message out of an RTK Query error. */
export const errorMessage = (err: unknown, fallback = 'Something went wrong'): string => {
  const e = err as { data?: { message?: string }; error?: string; message?: string } | undefined;
  return e?.data?.message || e?.message || e?.error || fallback;
};

export const stripHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
