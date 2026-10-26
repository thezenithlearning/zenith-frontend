'use client';

import { use } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import FaqForm from '@/components/dashboard/faq/FaqForm';
import { useGetAdminFaqQuery } from '@/features/faq/api/faqApi';

export default function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError } = useGetAdminFaqQuery(id);

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
        <p className="font-semibold text-gray-900">FAQ not found</p>
        <Link href="/dashboard/faqs" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline">
          Back to FAQs
        </Link>
      </div>
    );
  }

  // key forces a fresh form (and editor) if the record id changes
  return <FaqForm key={data.data._id} faq={data.data} />;
}
