'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Pager } from '@/components/dashboard/content/ListParts';
import { useGetQuizAttemptsQuery } from '@/features/quiz/api/quizApi';
import { formatDateTime } from '@/features/content/types';

const fmtTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

export default function QuizAttemptsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetQuizAttemptsQuery({ id, page, limit: 20 });
  const attempts = data?.data ?? [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/quizzes"
          aria-label="Back to mock tests"
          className="rounded-xl bg-white p-2 text-gray-600 shadow-sm hover:text-indigo-600 hover:shadow-md"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attempts</h1>
          <p className="text-sm text-gray-500">
            Every attempt is also saved as a lead (source: mock-test) in{' '}
            <Link href="/dashboard/leads" className="font-medium text-indigo-600 hover:underline">Leads</Link>.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-7 w-7 animate-spin text-indigo-600" /></div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-red-600">Could not load attempts.</p>
        ) : attempts.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-500">No attempts yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  {['Candidate', 'Contact', 'Score', 'Right / Wrong / Skipped', 'Time', 'Submitted'].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attempts.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-semibold text-gray-900">{a.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{a.email}</div>
                      <div className="text-xs text-gray-400">{a.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900">{a.score}</span>
                      <span className="text-gray-400"> / {a.totalMarks}</span>
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${a.passed ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-600'}`}>
                        {a.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.correct} / {a.wrong} / {a.unattempted}</td>
                    <td className="px-4 py-3 text-gray-600">{fmtTime(a.timeTakenSec)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager pagination={data?.pagination} onPage={setPage} />
      </div>
    </div>
  );
}
