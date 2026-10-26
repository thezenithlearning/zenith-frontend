'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import PyqActions from './PyqActions';
import ContentPreview from '@/components/editor/ContentPreview';
import { EmptyState } from '@/components/public/PublicParts';
import { useGetPyqBySlugQuery } from '@/features/pyq/api/pyqApi';
import { formatDate } from '@/features/content/types';

export default function PyqDetail({ slug }: { slug: string }) {
  const { data, isLoading, isError } = useGetPyqBySlugQuery(slug);
  const pyq = data?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2147a8]" />
      </div>
    );
  }

  if (isError || !pyq) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24">
        <EmptyState title="Paper not found" text="This paper may have been removed or is not published yet." />
        <div className="mt-6 text-center">
          <Link href="/pyqs" className="font-semibold text-[#2147a8] hover:underline">
            Browse all PYQs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-slate-50 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/pyqs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#2147a8]">
          <ArrowLeft className="h-4 w-4" /> All PYQs
        </Link>

        <article className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-blue-900/5">
          <div className="flex items-start gap-4 bg-[#0a1a40] px-6 py-8 text-white sm:px-10">
            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:flex">
              <FileText className="h-7 w-7 text-[#f2c75c]" />
            </span>
            <div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[#f2c75c]">{pyq.category?.name}</span>
                {pyq.year && <span className="rounded-full bg-white/10 px-3 py-1">{pyq.year}</span>}
                {pyq.examName && <span className="rounded-full bg-white/10 px-3 py-1">{pyq.examName}</span>}
              </div>
              <h1 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">{pyq.title}</h1>
              {pyq.publishedAt && <p className="mt-2 text-xs text-blue-50/60">Added {formatDate(pyq.publishedAt)}</p>}
            </div>
          </div>

          <div className="space-y-6 px-6 py-7 sm:px-10">
            {pyq.description && <ContentPreview html={pyq.description} className="text-sm leading-relaxed text-slate-600" />}
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="mb-3 text-sm font-semibold text-slate-700">Free access — just tell us where to send updates.</p>
              <PyqActions pyq={pyq} />
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
