'use client';

import { Library } from 'lucide-react';
import AdminContentList from '@/components/dashboard/content/AdminContentList';
import {
  useBulkDeletePyqsMutation,
  useDeletePyqMutation,
  useGetAdminPyqsQuery,
  useUpdatePyqStatusMutation,
  type IPyq,
} from '@/features/pyq/api/pyqApi';

export default function PyqsDashboardPage() {
  return (
    <AdminContentList<IPyq>
      heading="PYQs"
      description="Upload previous year question papers. Visitors unlock the PDF via a lead form."
      icon={Library}
      addHref="/dashboard/pyqs/add"
      addLabel="New PYQ"
      itemLabel="PYQ"
      useListQuery={useGetAdminPyqsQuery}
      useDelete={useDeletePyqMutation}
      useBulkDelete={useBulkDeletePyqsMutation}
      useStatus={useUpdatePyqStatusMutation}
      getTitle={(p) => p.title}
      getSubtitle={(p) => [p.examName, p.year].filter(Boolean).join(' · ')}
      getEditHref={(p) => `/dashboard/pyqs/${p._id}`}
      getPublicHref={(p) => `/pyqs/${p.slug}`}
      getMeta={(p) => <span>{p.accessCount ?? 0} downloads/views (leads)</span>}
    />
  );
}
