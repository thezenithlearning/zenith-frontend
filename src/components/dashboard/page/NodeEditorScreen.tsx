'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

import { Notice } from '@/components/dashboard/page/ui/Notice';
import { secondaryButton } from '@/components/dashboard/page/ui/styles';

import { useNodeDetail } from '@/features/page/hooks/useNodeDetail';
import { DASHBOARD_PAGES_PATH } from '@/features/page/config';

import { NodeForm } from './NodeForm';

function Screen({ id }: { id: string }) {
  const { detail, error, isLoading } = useNodeDetail(id);
  const justCreated = useSearchParams().get('created') === '1';

  if (isLoading && !detail) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-gray-500">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Loading page…
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <Notice tone="error">{error ?? 'Page not found.'}</Notice>
        <Link href={DASHBOARD_PAGES_PATH} className={secondaryButton}>
          Back to pages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {justCreated && <Notice tone="success">Created. You can keep editing below.</Notice>}

      <NodeForm key={detail.node.id} mode="edit" type={detail.node.type} node={detail.node} />
    </div>
  );
}

export function NodeEditorScreen({ id }: { id: string }) {
  return (
    <Suspense fallback={null}>
      <Screen id={id} />
    </Suspense>
  );
}
