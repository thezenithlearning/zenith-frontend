import { Suspense } from 'react';

import { PagesWorkspace } from '@/components/dashboard/page';

export const metadata = { title: 'Pages · Dashboard' };

export default function PagesDashboard() {
  // PagesWorkspace reads ?folder= from the URL, which needs a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <PagesWorkspace />
    </Suspense>
  );
}
