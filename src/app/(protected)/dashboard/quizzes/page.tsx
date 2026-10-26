'use client';

import Link from 'next/link';
import { ClipboardCheck, Users } from 'lucide-react';
import AdminContentList from '@/components/dashboard/content/AdminContentList';
import {
  useBulkDeleteQuizzesMutation,
  useDeleteQuizMutation,
  useGetAdminQuizzesQuery,
  useUpdateQuizStatusMutation,
  type IQuizSummary,
} from '@/features/quiz/api/quizApi';

type Row = IQuizSummary & { status: 'draft' | 'published' | 'scheduled' };

export default function QuizzesDashboardPage() {
  return (
    <AdminContentList<Row>
      heading="Mock Tests"
      description="Build MCQ mock tests with custom marking and publish them by course category."
      icon={ClipboardCheck}
      addHref="/dashboard/quizzes/add"
      addLabel="New mock test"
      itemLabel="Mock test"
      useListQuery={useGetAdminQuizzesQuery as never}
      useDelete={useDeleteQuizMutation}
      useBulkDelete={useBulkDeleteQuizzesMutation}
      useStatus={useUpdateQuizStatusMutation}
      getTitle={(q) => q.title}
      getSubtitle={(q) => q.seriesName}
      getEditHref={(q) => `/dashboard/quizzes/${q._id}`}
      getPublicHref={(q) => `/mock-tests/${q.slug}`}
      getMeta={(q) => (
        <>
          <span>{q.questionCount} questions</span>
          <span>{q.totalMarks} marks</span>
          <span>{q.durationMinutes ? `${q.durationMinutes} min` : 'Untimed'}</span>
        </>
      )}
      getExtraActions={(q) => (
        <Link
          href={`/dashboard/quizzes/${q._id}/attempts`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Users className="h-3.5 w-3.5" /> Attempts ({q.attemptCount})
        </Link>
      )}
    />
  );
}
