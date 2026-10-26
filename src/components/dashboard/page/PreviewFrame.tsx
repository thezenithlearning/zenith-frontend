'use client';

import { useEffect, useState } from 'react';

import type { PreviewMessage } from './builder/PreviewDialog';
import type { PublicPageView } from '@/features/page/types';
import { PublicPage } from '@/components/public/page/PublicPage';

/** Page rendered inside the builder's preview iframe. Receives the design via postMessage. */
export function PreviewFrame() {
  const [view, setView] = useState<PublicPageView | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent<PreviewMessage>) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== window.parent) return;

      if (event.data?.type === 'preview-view') setView(event.data.view);
    };

    window.addEventListener('message', onMessage);
    window.parent.postMessage(
      { type: 'preview-ready' } satisfies PreviewMessage,
      window.location.origin,
    );

    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (!view) {
    return <p className="p-8 text-sm text-gray-500">Preparing preview…</p>;
  }

  return <PublicPage view={view} />;
}
