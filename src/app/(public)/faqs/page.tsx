import type { Metadata } from 'next';
import { Suspense } from 'react';
import GeneralFaqsExplorer from '@/components/faq/GeneralFaqsExplorer';

export const metadata: Metadata = {
  title: 'FAQs',
  description:
    'Answers about Zenith Learning programs, live 1:1 classes, mentorship, progress tracking and admissions.',
  alternates: { canonical: '/faqs' },
};

export default function FAQsPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <GeneralFaqsExplorer />
    </Suspense>
  );
}
