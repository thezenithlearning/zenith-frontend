'use client';

import Link from 'next/link';
import { ArrowLeft, LoaderCircle } from 'lucide-react';

import { Notice } from '@/components/dashboard/page/ui/Notice';
import { secondaryButton } from '@/components/dashboard/page/ui/styles';
import { getApiErrorMessage } from '@/lib/apiError';

import { useGetPagePreviewQuery } from '@/features/page/api/pageApi';
import { DASHBOARD_PAGES_PATH } from '@/features/page/config';
import { PublicPage } from '@/components/public/page/PublicPage';

/** Renders a node exactly like the public site would, drafts included. */
export function PreviewScreen({ id }: { id: string }) {
  const {
    data: view,
    error: queryError,
    isFetching,
  } = useGetPagePreviewQuery(id, {
    refetchOnMountOrArgChange: true,
  });

  const current =
    isFetching && !view && !queryError
      ? null
      : {
          view,
          error: queryError ? getApiErrorMessage(queryError, 'Something went wrong') : undefined,
        };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-amber-50 px-4 py-2 text-sm text-amber-700 ">
        <span>
          <strong>Preview.</strong> Drafts and unpublished pages are shown here only - visitors
          cannot see them.
        </span>
        <Link href={`${DASHBOARD_PAGES_PATH}/${id}`} className={secondaryButton}>
          <ArrowLeft className="h-4 w-4" />
          Back to editor
        </Link>
      </div>

      {!current ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-gray-500">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Rendering preview…
        </div>
      ) : current.error || !current.view ? (
        <Notice tone="error">{current.error ?? 'Preview unavailable.'}</Notice>
      ) : (
        <div className="rounded-lg border border-gray-200 ">
          <PublicPage view={current.view} />
        </div>
      )}
    </div>
  );
}
