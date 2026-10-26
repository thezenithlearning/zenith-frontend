import type { Metadata } from 'next';
import { Suspense } from 'react';
import MockTestList from '@/components/mock-tests/MockTestList';

export const metadata: Metadata = {
  title: 'Free Mock Tests & Test Series',
  description:
    'Attempt timed MCQ mock tests for IB, SAT, AP, JEE and NEET. Get instant scores, accuracy and answer review.',
  alternates: { canonical: '/mock-tests' },
};

export default function MockTestsPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <MockTestList />
    </Suspense>
  );
}
