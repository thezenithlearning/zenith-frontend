'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ContentStats, Pagination } from '@/features/content/types';

export function StatsRow({ stats, loading }: { stats?: ContentStats; loading?: boolean }) {
  const items = [
    { label: 'Total', value: stats?.total, tone: 'text-gray-900 bg-white' },
    { label: 'Published', value: stats?.published, tone: 'text-blue-700 bg-blue-50' },
    { label: 'Scheduled', value: stats?.scheduled, tone: 'text-amber-700 bg-amber-50' },
    { label: 'Drafts', value: stats?.draft, tone: 'text-gray-600 bg-gray-50' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className={`rounded-2xl border border-gray-200 p-4 shadow-sm ${s.tone}`}>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{s.label}</p>
          <p className="mt-1 text-2xl font-black">{loading || s.value === undefined ? '–' : s.value}</p>
        </div>
      ))}
    </div>
  );
}

export function Pager({
  pagination,
  onPage,
}: {
  pagination?: Pagination;
  onPage: (page: number) => void;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row">
      <p className="text-xs text-gray-500">
        Page {page} of {totalPages} · {total} items
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'draft', label: 'Draft' },
] as const;

/** Debounce-free search box state helper: returns className for inputs. */
export const inputClass =
  'w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500';
