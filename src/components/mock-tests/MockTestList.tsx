'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ClipboardCheck, Clock, ListChecks, Search, Trophy, Users } from 'lucide-react';
import { CardSkeletons, CategoryChips, EmptyState, PublicHero, PublicPager } from '@/components/public/PublicParts';
import { useGetQuizzesQuery } from '@/features/quiz/api/quizApi';

export default function MockTestList() {
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

  const { data, isLoading, isError } = useGetQuizzesQuery({
    page,
    limit: 18,
    ...(category ? { category } : {}),
    ...(debounced ? { search: debounced } : {}),
  });
  const quizzes = data?.data ?? [];

  const setCategory = (slug: string) => {
    setPage(1);
    router.replace(slug ? `/mock-tests?category=${encodeURIComponent(slug)}` : '/mock-tests', { scroll: false });
  };

  return (
    <main className="bg-slate-50">
      <PublicHero
        eyebrow="Mock test series"
        title="Practice with timed mock tests"
        text="Real exam-style MCQ tests with marking schemes, a live timer and instant score analysis."
      >
        <div className="relative mx-auto max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mock tests or series…"
            aria-label="Search mock tests"
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
            <EmptyState title="Couldn't load mock tests" text="Please refresh the page or try again shortly." />
          ) : quizzes.length === 0 ? (
            <EmptyState title="No mock tests yet" text="New tests for this category are coming soon. Check back shortly." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {quizzes.map((q) => (
                <Link
                  key={q._id}
                  href={`/mock-tests/${q.slug}`}
                  className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#2147a8]/40 hover:shadow-xl hover:shadow-blue-900/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2147a8]">
                      <ClipboardCheck className="h-5 w-5" />
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {q.category?.name}
                    </span>
                  </div>
                  {q.seriesName && (
                    <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#2147a8]">{q.seriesName}</p>
                  )}
                  <h2 className={`${q.seriesName ? 'mt-1' : 'mt-4'} text-lg font-black leading-snug text-slate-900`}>{q.title}</h2>
                  {q.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{q.description}</p>}

                  <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
                    <span className="inline-flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" />{q.questionCount} questions</span>
                    <span className="inline-flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" />{q.totalMarks} marks</span>
                    <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{q.durationMinutes ? `${q.durationMinutes} min` : 'Untimed'}</span>
                    {q.attemptCount > 0 && (
                      <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{q.attemptCount} attempts</span>
                    )}
                  </div>

                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#2147a8]">
                    Start test <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          )}
          <PublicPager page={page} totalPages={data?.pagination.totalPages ?? 1} onPage={setPage} />
        </div>
      </section>
    </main>
  );
}
