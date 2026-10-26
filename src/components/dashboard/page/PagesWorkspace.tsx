'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { cardClass, secondaryButton } from '@/components/dashboard/page/ui/styles';

import { DASHBOARD_PAGES_PATH } from '@/features/page/config';

import { NodeExplorer } from './NodeExplorer';
import { NodeTree } from './NodeTree';

/**
 * Dashboard "Pages" screen: lazy tree on the left, folder contents on the
 * right. The open folder lives in the URL (?folder=<id>) so refreshing,
 * sharing a link or coming back from the editor keeps the context.
 */
export function PagesWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const folderId = searchParams.get('folder');

  const [refreshToken, setRefreshToken] = useState(0);
  const [treeOpen, setTreeOpen] = useState(true);

  const navigate = useCallback(
    (id: string | null) => {
      router.push(id ? `${DASHBOARD_PAGES_PATH}?folder=${id}` : DASHBOARD_PAGES_PATH);
    },
    [router],
  );

  const onChanged = useCallback(() => setRefreshToken((token) => token + 1), []);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <aside className={`${treeOpen ? 'lg:w-72' : 'lg:w-auto'} shrink-0`}>
        <div className="mb-2 flex items-center justify-between lg:mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {treeOpen ? 'Structure' : ''}
          </h2>
          <button
            type="button"
            onClick={() => setTreeOpen((open) => !open)}
            aria-label={treeOpen ? 'Hide page tree' : 'Show page tree'}
            aria-expanded={treeOpen}
            className={`${secondaryButton} px-2 py-1`}
          >
            {treeOpen ? (
              <PanelLeftClose className="h-4 w-4" />
            ) : (
              <PanelLeftOpen className="h-4 w-4" />
            )}
            <span className="lg:sr-only">{treeOpen ? 'Hide tree' : 'Show tree'}</span>
          </button>
        </div>

        {treeOpen && (
          <div className={`${cardClass} max-h-72 overflow-y-auto p-2 lg:max-h-[calc(100vh-12rem)]`}>
            <NodeTree
              selectedId={folderId}
              revealId={folderId}
              refreshToken={refreshToken}
              onSelect={(node) => navigate(node?.id ?? null)}
            />
          </div>
        )}
      </aside>

      <section className="min-w-0 flex-1">
        <NodeExplorer
          folderId={folderId}

          onNavigate={navigate}
          onChanged={onChanged}
        />
      </section>
    </div>
  );
}
