'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

import { Notice } from '@/components/dashboard/page/ui/Notice';
import { secondaryButton } from '@/components/dashboard/page/ui/styles';

import { useNodeDetail } from '@/features/page/hooks/useNodeDetail';
import { DASHBOARD_PAGES_PATH } from '@/features/page/config';
import type { NodeType } from '@/features/page/types';

import { NodeForm } from './NodeForm';

function Screen() {
  const params = useSearchParams();

  const type: NodeType = params.get('type') === 'folder' ? 'folder' : 'page';
  const parentId = params.get('parent');

  // Default the location to the folder the user was browsing.
  const { detail, error, isLoading } = useNodeDetail(parentId);

  if (parentId && isLoading && !detail) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-gray-500">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }

  if (parentId && !detail) {
    return (
      <div className="space-y-4">
        <Notice tone="error">{error ?? 'The selected parent no longer exists.'}</Notice>
        <Link href={DASHBOARD_PAGES_PATH} className={secondaryButton}>
          Back to pages
        </Link>
      </div>
    );
  }

  return (
    <NodeForm
      key={`${type}-${parentId ?? 'root'}`}
      mode="new"
      type={type}
      initialParentId={detail?.node.id ?? null}
      initialParentPath={detail?.node.path ?? '/'}
    />
  );
}

export function NewNodeScreen() {
  return (
    <Suspense fallback={null}>
      <Screen />
    </Suspense>
  );
}
