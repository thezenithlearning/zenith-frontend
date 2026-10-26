'use client';

import type { ReactNode } from 'react';
import { useGetCourseCategoriesQuery } from '@/features/courseCategory/api/courseCategoryApi';

export function PublicHero({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0a1a40] px-4 pb-14 pt-14 text-center text-white sm:pb-16 sm:pt-20">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#3b6fe0]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="relative mx-auto max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-[.2em] text-[#f2c75c]">{eyebrow}</span>
        <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-blue-50/70 sm:text-base">{text}</p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

/** "All" + one chip per course category. Value is the category slug. */
export function CategoryChips({ value, onChange }: { value: string; onChange: (slug: string) => void }) {
  const { data, isLoading } = useGetCourseCategoriesQuery();
  const categories = data?.data ?? [];

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
      active
        ? 'border-[#2147a8] bg-[#2147a8] text-white shadow-md shadow-blue-900/10'
        : 'border-slate-200 bg-white text-slate-600 hover:border-[#2147a8]/40 hover:text-[#2147a8]'
    }`;

  return (
    <div role="tablist" aria-label="Course categories" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <button role="tab" aria-selected={value === ''} type="button" onClick={() => onChange('')} className={chip(value === '')}>
        All
      </button>
      {isLoading && <span className="px-2 py-2 text-sm text-slate-400">Loading…</span>}
      {categories.map((c) => (
        <button
          key={c._id}
          role="tab"
          aria-selected={value === c.slug}
          type="button"
          onClick={() => onChange(c.slug)}
          className={chip(value === c.slug)}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <p className="text-lg font-bold text-slate-800">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{text}</p>
    </div>
  );
}

export function CardSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-3xl bg-slate-100" />
      ))}
    </div>
  );
}

export function PublicPager({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#2147a8] disabled:opacity-40">
        Previous
      </button>
      <span className="text-sm text-slate-500">
        Page {page} of {totalPages}
      </span>
      <button type="button" disabled={page >= totalPages} onClick={() => onPage(page + 1)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#2147a8] disabled:opacity-40">
        Next
      </button>
    </div>
  );
}
