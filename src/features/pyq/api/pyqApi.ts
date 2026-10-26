import { baseApi } from '../../../services/baseApi';
import type {
  CategoryRef,
  ItemResponse,
  ListResponse,
  PublishFields,
  PublishInput,
} from '../../content/types';

export interface IPyq extends Partial<PublishFields> {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: CategoryRef;
  examName: string;
  year?: number;
  keywords: string[];
  seoTitle: string;
  seoDescription: string;
  accessCount: number;
  publishedAt?: string | null;
  createdAt: string;
  /** Public API only exposes size/pages – never the file location. */
  pdf?: { size?: number; pages?: number; originalName?: string; url?: string };
}

export interface PyqAccess {
  leadId: string;
  title: string;
  file: { url: string; originalName: string; mimeType: string; size: number };
}

export interface PyqQuery {
  category?: string;
  search?: string;
  year?: number;
  status?: 'draft' | 'published' | 'scheduled';
  page?: number;
  limit?: number;
}

export interface PyqFormValues extends PublishInput {
  title: string;
  slug?: string;
  description: string;
  category: string;
  examName: string;
  year?: string;
  keywords: string;
  seoTitle: string;
  seoDescription: string;
}

/** Builds the multipart body the API expects (text fields + optional `pdf`). */
export const buildPyqFormData = (values: Partial<PyqFormValues>, pdf?: File | null): FormData => {
  const fd = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    fd.append(key, String(value));
  });
  if (pdf) fd.append('pdf', pdf);
  return fd;
};

const api = baseApi.enhanceEndpoints({ addTagTypes: ['Pyq'] });

export const pyqApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPyqs: builder.query<ListResponse<IPyq>, PyqQuery | void>({
      query: (params) => ({ url: '/pyqs', params: params || {} }),
      providesTags: [{ type: 'Pyq', id: 'PUBLIC' }],
    }),
    getPyqBySlug: builder.query<ItemResponse<IPyq>, string>({
      query: (slug) => ({ url: `/pyqs/slug/${slug}` }),
      providesTags: (_r, _e, slug) => [{ type: 'Pyq', id: `slug:${slug}` }],
    }),
    requestPyqAccess: builder.mutation<
      ItemResponse<PyqAccess>,
      { id: string; name: string; email: string; phone: string }
    >({
      query: ({ id, ...body }) => ({ url: `/pyqs/${id}/access`, method: 'POST', body }),
      invalidatesTags: [{ type: 'lead' as never, id: 'LIST' }, { type: 'lead' as never, id: 'STATS' }],
    }),

    getAdminPyqs: builder.query<ListResponse<IPyq>, PyqQuery | void>({
      query: (params) => ({ url: '/pyqs/admin', params: params || {} }),
      providesTags: [{ type: 'Pyq', id: 'LIST' }],
    }),
    getAdminPyq: builder.query<ItemResponse<IPyq>, string>({
      query: (id) => ({ url: `/pyqs/admin/${id}` }),
      providesTags: (_r, _e, id) => [{ type: 'Pyq', id }],
    }),
    createPyq: builder.mutation<ItemResponse<IPyq>, FormData>({
      query: (body) => ({ url: '/pyqs', method: 'POST', body }),
      invalidatesTags: [{ type: 'Pyq', id: 'LIST' }, { type: 'Pyq', id: 'PUBLIC' }],
    }),
    updatePyq: builder.mutation<ItemResponse<IPyq>, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `/pyqs/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Pyq', id },
        { type: 'Pyq', id: 'LIST' },
        { type: 'Pyq', id: 'PUBLIC' },
      ],
    }),
    updatePyqStatus: builder.mutation<ItemResponse<IPyq>, { id: string } & PublishInput>({
      query: ({ id, ...body }) => ({ url: `/pyqs/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Pyq', id },
        { type: 'Pyq', id: 'LIST' },
        { type: 'Pyq', id: 'PUBLIC' },
      ],
    }),
    deletePyq: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({ url: `/pyqs/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Pyq', id: 'LIST' }, { type: 'Pyq', id: 'PUBLIC' }],
    }),
    bulkDeletePyqs: builder.mutation<{ success: boolean }, string[]>({
      query: (ids) => ({ url: '/pyqs/bulk-delete', method: 'POST', body: { ids } }),
      invalidatesTags: [{ type: 'Pyq', id: 'LIST' }, { type: 'Pyq', id: 'PUBLIC' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPyqsQuery,
  useGetPyqBySlugQuery,
  useRequestPyqAccessMutation,
  useGetAdminPyqsQuery,
  useGetAdminPyqQuery,
  useCreatePyqMutation,
  useUpdatePyqMutation,
  useUpdatePyqStatusMutation,
  useDeletePyqMutation,
  useBulkDeletePyqsMutation,
} = pyqApi;
