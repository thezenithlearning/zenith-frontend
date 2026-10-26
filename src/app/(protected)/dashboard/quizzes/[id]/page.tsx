'use client';

import { use } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import QuizForm from '@/components/dashboard/quiz/QuizForm';
import { useGetAdminQuizQuery } from '@/features/quiz/api/quizApi';

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError } = useGetAdminQuizQuery(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="font-semibold text-gray-900">Mock test not found</p>
        <Link href="/dashboard/quizzes" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline">
          Back to mock tests
        </Link>
      </div>
    );
  }

  return <QuizForm key={data.data._id} quiz={data.data} />;
}
