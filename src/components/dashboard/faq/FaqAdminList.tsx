'use client';

import { CircleHelp, MessagesSquare } from 'lucide-react';
import AdminContentList from '@/components/dashboard/content/AdminContentList';
import {
  useBulkDeleteFaqsMutation,
  useDeleteFaqMutation,
  useGetAdminFaqsQuery,
  useUpdateFaqStatusMutation,
  type FaqQuery,
  type FaqScope,
  type IFaq,
} from '@/features/faq/api/faqApi';
import { faqBasePath } from '@/components/dashboard/faq/faqPaths';
import { stripHtml } from '@/features/content/types';

// Module-level hooks so each list keeps a stable hook identity.
const useGeneralList = (args: FaqQuery) => useGetAdminFaqsQuery({ ...args, scope: 'general' });
const useQnaList = (args: FaqQuery) => useGetAdminFaqsQuery({ ...args, scope: 'qna' });

export default function FaqAdminList({ scope }: { scope: FaqScope }) {
  const isQna = scope === 'qna';
  const base = faqBasePath(scope);

  return (
    <AdminContentList<IFaq>
      heading={isQna ? 'QnA' : 'FAQs'}
      description={
        isQna
          ? 'Create, schedule and manage the course-wise questions shown on the public QnA page.'
          : 'Create, schedule and manage the general questions shown on the public FAQs page.'
      }
      icon={isQna ? MessagesSquare : CircleHelp}
      addHref={`${base}/add`}
      addLabel={isQna ? 'New QnA' : 'New FAQ'}
      itemLabel={isQna ? 'QnA' : 'FAQ'}
      useListQuery={isQna ? useQnaList : useGeneralList}
      useDelete={useDeleteFaqMutation}
      useBulkDelete={useBulkDeleteFaqsMutation}
      useStatus={useUpdateFaqStatusMutation}
      getTitle={(f) => f.question}
      getSubtitle={(f) => stripHtml(f.answer)}
      getEditHref={(f) => `${base}/${f._id}`}
      getPublicHref={(f) => (isQna ? `/qna?category=${f.category?.slug ?? ''}` : '/faqs')}
    />
  );
}
