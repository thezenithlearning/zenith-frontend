'use client';

import { use } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import PyqForm from '@/components/dashboard/pyq/PyqForm';
import { useGetAdminPyqQuery } from '@/features/pyq/api/pyqApi';

export default function EditPyqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError } = useGetAdminPyqQuery(id);

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
        <p className="font-semibold text-gray-900">PYQ not found</p>
        <Link href="/dashboard/pyqs" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline">
          Back to PYQs
        </Link>
      </div>
    );
  }

  return <PyqForm key={data.data._id} pyq={data.data} />;
}
