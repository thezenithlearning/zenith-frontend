import type { Metadata } from 'next';
import { Suspense } from 'react';
import FaqExplorer from '@/components/faq/FaqExplorer';

export const metadata: Metadata = {
  title: 'QnA',
  description:
    'Answers to common questions about curricula, exam preparation and Zenith Learning programs — filtered by program category.',
  alternates: { canonical: '/qna' },
};

export default function QnaPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <FaqExplorer />
    </Suspense>
  );
}
