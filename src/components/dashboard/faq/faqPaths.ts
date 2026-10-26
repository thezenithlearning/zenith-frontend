import type { FaqScope } from '@/features/faq/api/faqApi';

export const faqBasePath = (scope: FaqScope) => (scope === 'qna' ? '/dashboard/qna' : '/dashboard/faqs');
