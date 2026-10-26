'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, Search } from 'lucide-react';
import { CardSkeletons, CategoryChips, EmptyState, PublicHero, PublicPager } from '@/components/public/PublicParts';
import ContentPreview from '@/components/editor/ContentPreview';
import { useGetFaqsQuery } from '@/features/faq/api/faqApi';
import { stripHtml } from '@/features/content/types';

export default function FaqExplorer() {
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get('category') ?? '';

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching, isError } = useGetFaqsQuery({
    page,
    limit: 30,
    scope: 'qna',
    ...(category ? { category } : {}),
    ...(debounced ? { search: debounced } : {}),
  });
  const faqs = useMemo(() => data?.data ?? [], [data]);

  const setCategory = (slug: string) => {
    setPage(1);
    setOpenId(null);
    router.replace(slug ? `/qna?category=${encodeURIComponent(slug)}` : '/qna', { scroll: false });
  };

  const jsonLd = useMemo(
    () =>
      faqs.length
        ? JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: stripHtml(f.answer) },
            })),
          }).replace(/</g, '\\u003c')
        : null,
    [faqs],
  );

  return (
    <main className="bg-slate-50">
      <PublicHero
        eyebrow="Help center"
        title="QnA"
        text="Quick answers about exams, eligibility, preparation and our courses — organised by course category."
      >
        <div className="relative mx-auto max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            aria-label="Search FAQs"
            className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-4 text-sm text-slate-900 shadow-xl outline-none ring-2 ring-transparent focus:ring-[#f2c75c]"
          />
        </div>
      </PublicHero>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <CategoryChips value={category} onChange={setCategory} />

        <div className="mt-8" aria-busy={isFetching}>
          {isLoading ? (
            <CardSkeletons count={4} />
          ) : isError ? (
            <EmptyState title="Couldn't load FAQs" text="Please refresh the page or try again shortly." />
          ) : faqs.length === 0 ? (
            <EmptyState title="No questions found" text="Try another category or a different search term." />
          ) : (
            <ul className="space-y-3">
              {faqs.map((faq) => {
                const open = openId === faq._id;
                return (
                  <li
                    key={faq._id}
                    className={`overflow-hidden rounded-2xl border bg-white transition-shadow ${
                      open ? 'border-[#2147a8]/40 shadow-lg shadow-blue-900/5' : 'border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <h2>
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`faq-${faq._id}`}
                        onClick={() => setOpenId(open ? null : faq._id)}
                        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                      >
                        <span className="text-base font-bold text-slate-900">{faq.question}</span>
                        <ChevronDown
                          className={`mt-1 h-5 w-5 shrink-0 text-[#2147a8] transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </h2>
                    <div id={`faq-${faq._id}`} hidden={!open} className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6">
                      {faq.category && (
                        <span className="mb-3 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2147a8]">
                          {faq.category.name}
                        </span>
                      )}
                      <ContentPreview html={faq.answer} className="text-sm leading-relaxed text-slate-600" />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <PublicPager page={page} totalPages={data?.pagination.totalPages ?? 1} onPage={setPage} />
        </div>
      </section>

      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
    </main>
  );
}
