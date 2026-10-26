import { baseApi } from '../../../services/baseApi';
import type {
  CategoryRef,
  ItemResponse,
  ListResponse,
  PublishFields,
  PublishInput,
} from '../../content/types';

export type FaqScope = 'qna' | 'general';

export interface IFaq extends PublishFields {
  _id: string;
  question: string;
  answer: string;
  /** Missing on entries created before scopes existed; those are Q&A. */
  scope?: FaqScope;
  category?: CategoryRef;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FaqInput extends PublishInput {
  question: string;
  answer: string;
  scope?: FaqScope;
  category?: string;
  sortOrder?: number;
}

export interface FaqQuery {
  scope?: FaqScope;
  category?: string;
  search?: string;
  status?: 'draft' | 'published' | 'scheduled';
  page?: number;
  limit?: number;
}

const api = baseApi.enhanceEndpoints({ addTagTypes: ['Faq'] });

export const faqApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query<ListResponse<IFaq>, FaqQuery | void>({
      query: (params) => ({ url: '/faqs', params: params || {} }),
      providesTags: [{ type: 'Faq', id: 'PUBLIC' }],
    }),
    getAdminFaqs: builder.query<ListResponse<IFaq>, FaqQuery | void>({
      query: (params) => ({ url: '/faqs/admin', params: params || {} }),
      providesTags: [{ type: 'Faq', id: 'LIST' }],
    }),
    getAdminFaq: builder.query<ItemResponse<IFaq>, string>({
      query: (id) => ({ url: `/faqs/admin/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Faq', id }],
    }),
    createFaq: builder.mutation<ItemResponse<IFaq>, FaqInput>({
      query: (body) => ({ url: '/faqs', method: 'POST', body }),
      invalidatesTags: [{ type: 'Faq', id: 'LIST' }, { type: 'Faq', id: 'PUBLIC' }],
    }),
    updateFaq: builder.mutation<ItemResponse<IFaq>, { id: string; body: Partial<FaqInput> }>({
      query: ({ id, body }) => ({ url: `/faqs/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Faq', id },
        { type: 'Faq', id: 'LIST' },
        { type: 'Faq', id: 'PUBLIC' },
      ],
    }),
    updateFaqStatus: builder.mutation<ItemResponse<IFaq>, { id: string } & PublishInput>({
      query: ({ id, ...body }) => ({ url: `/faqs/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Faq', id },
        { type: 'Faq', id: 'LIST' },
        { type: 'Faq', id: 'PUBLIC' },
      ],
    }),
    deleteFaq: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/faqs/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Faq', id: 'LIST' }, { type: 'Faq', id: 'PUBLIC' }],
    }),
    bulkDeleteFaqs: builder.mutation<{ success: boolean }, string[]>({
      query: (ids) => ({ url: '/faqs/bulk-delete', method: 'POST', body: { ids } }),
      invalidatesTags: [{ type: 'Faq', id: 'LIST' }, { type: 'Faq', id: 'PUBLIC' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFaqsQuery,
  useGetAdminFaqsQuery,
  useGetAdminFaqQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useUpdateFaqStatusMutation,
  useDeleteFaqMutation,
  useBulkDeleteFaqsMutation,
} = faqApi;
