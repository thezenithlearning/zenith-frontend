import type { Metadata } from 'next';
import { Suspense } from 'react';
import PyqList from '@/components/pyq/PyqList';

export const metadata: Metadata = {
  title: 'Previous Year Question Papers (PYQ) PDF',
  description:
    'Download past papers for IB, IGCSE, A Level, SAT, AP, JEE and NEET, organised by program category.',
  alternates: { canonical: '/pyqs' },
};

export default function PyqsPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <PyqList />
    </Suspense>
  );
}
