'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Search } from 'lucide-react';
import { CardSkeletons, CategoryChips, EmptyState, PublicHero, PublicPager } from '@/components/public/PublicParts';
import PyqActions from './PyqActions';
import { useGetPyqsQuery } from '@/features/pyq/api/pyqApi';

const fmtSize = (b?: number) => (!b ? '' : b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export default function PyqList() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get('category') ?? '';

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useGetPyqsQuery({
    page,
    limit: 18,
    ...(category ? { category } : {}),
    ...(debounced ? { search: debounced } : {}),
  });
  const pyqs = data?.data ?? [];

  const setCategory = (slug: string) => {
    setPage(1);
    router.replace(slug ? `/pyqs?category=${encodeURIComponent(slug)}` : '/pyqs', { scroll: false });
  };

  return (
    <main className="bg-slate-50">
      <PublicHero
        eyebrow="Previous year questions"
        title="Previous year question papers"
        text="Download past exam papers category-wise and practise with real questions."
      >
        <div className="relative mx-auto max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by exam, year or title…"
            aria-label="Search PYQs"
            className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-4 text-sm text-slate-900 shadow-xl outline-none ring-2 ring-transparent focus:ring-[#f2c75c]"
          />
        </div>
      </PublicHero>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <CategoryChips value={category} onChange={setCategory} />

        <div className="mt-8">
          {isLoading ? (
            <CardSkeletons />
          ) : isError ? (
            <EmptyState title="Couldn't load papers" text="Please refresh the page or try again shortly." />
          ) : pyqs.length === 0 ? (
            <EmptyState title="No papers found" text="Papers for this category will be added soon." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {pyqs.map((p) => (
                <article
                  key={p._id}
                  className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                      <FileText className="h-6 w-6" />
                    </span>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {p.year && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#2147a8]">{p.year}</span>}
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{p.category?.name}</span>
                    </div>
                  </div>
                  <h2 className="mt-4 text-lg font-black leading-snug text-slate-900">
                    <Link href={`/pyqs/${p.slug}`} className="hover:text-[#2147a8]">
                      {p.title}
                    </Link>
                  </h2>
                  {p.examName && <p className="mt-1 text-sm text-slate-500">{p.examName}</p>}
                  <p className="mt-3 text-xs font-medium text-slate-400">
                    PDF{p.pdf?.size ? ` · ${fmtSize(p.pdf.size)}` : ''}
                    {p.pdf?.pages ? ` · ${p.pdf.pages} pages` : ''}
                  </p>
                  <div className="mt-5 pt-1">
                    <PyqActions pyq={p} size="sm" />
                  </div>
                </article>
              ))}
            </div>
          )}
          <PublicPager page={page} totalPages={data?.pagination.totalPages ?? 1} onPage={setPage} />
        </div>
      </section>
    </main>
  );
}
