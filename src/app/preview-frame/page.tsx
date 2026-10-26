import type { Metadata } from 'next';

import { PreviewFrame } from '@/components/dashboard/page/PreviewFrame';

export const metadata: Metadata = {
  title: 'Preview',
  robots: { index: false, follow: false },
};

// Lives outside the dashboard shell so the preview shows only the page itself.
export default function PreviewFramePage() {
  return <PreviewFrame />;
}
