import { baseApi } from '../../../services/baseApi';
import type {
  BulkAction,
  BulkResult,
  CreateNodePayload,
  IPageNode,
  NodeDetail,
  NodeImpact,
  NodeInput,
  NodeListQuery,
  NodeListResult,
  PublicPageView,
  Summary,
} from '../types';

interface Envelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

const unwrap = <T>(body: Envelope<T>): T => body.data;

const api = baseApi.enhanceEndpoints({ addTagTypes: ['Page'] });

export const pageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPageNodes: builder.query<NodeListResult, NodeListQuery>({
      query: (params) => ({ url: '/pages', params }),
      transformResponse: (
        body: Envelope<IPageNode[]> & { pagination: NodeListResult['pagination'] },
      ) => ({ items: body.data, pagination: body.pagination }),
      providesTags: [{ type: 'Page', id: 'LIST' }],
    }),
    getPageNode: builder.query<NodeDetail, string>({
      query: (id) => ({ url: `/pages/${id}` }),
      transformResponse: unwrap<NodeDetail>,
      providesTags: (_r, _e, id) => [{ type: 'Page', id }],
    }),
    getPageImpact: builder.query<NodeImpact, string>({
      query: (id) => ({ url: `/pages/${id}/impact` }),
      transformResponse: unwrap<NodeImpact>,
    }),
    getPageSummary: builder.query<Summary, void>({
      query: () => ({ url: '/pages/summary' }),
      transformResponse: unwrap<Summary>,
      providesTags: [{ type: 'Page', id: 'SUMMARY' }],
    }),
    getPagePreview: builder.query<PublicPageView, string>({
      query: (id) => ({ url: `/pages/${id}/preview` }),
      transformResponse: unwrap<PublicPageView>,
    }),
    createPageNode: builder.mutation<IPageNode, CreateNodePayload>({
      query: (body) => ({ url: '/pages', method: 'POST', body }),
      transformResponse: unwrap<IPageNode>,
      invalidatesTags: [
        { type: 'Page', id: 'LIST' },
        { type: 'Page', id: 'SUMMARY' },
      ],
    }),
    updatePageNode: builder.mutation<IPageNode, { id: string; body: Partial<NodeInput> }>({
      query: ({ id, body }) => ({ url: `/pages/${id}`, method: 'PATCH', body }),
      transformResponse: unwrap<IPageNode>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Page', id },
        { type: 'Page', id: 'LIST' },
        { type: 'Page', id: 'SUMMARY' },
      ],
    }),
    movePageNode: builder.mutation<IPageNode, { id: string; parentId: string | null }>({
      query: ({ id, parentId }) => ({
        url: `/pages/${id}/move`,
        method: 'PATCH',
        body: { parentId },
      }),
      transformResponse: unwrap<IPageNode>,
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Page', id },
        { type: 'Page', id: 'LIST' },
      ],
    }),
    reorderPageNodes: builder.mutation<void, { parentId: string | null; orderedIds: string[] }>({
      query: (body) => ({ url: '/pages/reorder', method: 'PUT', body }),
      invalidatesTags: [{ type: 'Page', id: 'LIST' }],
    }),
    duplicatePageNode: builder.mutation<IPageNode, string>({
      query: (id) => ({ url: `/pages/${id}/duplicate`, method: 'POST', body: {} }),
      transformResponse: unwrap<IPageNode>,
      invalidatesTags: [
        { type: 'Page', id: 'LIST' },
        { type: 'Page', id: 'SUMMARY' },
      ],
    }),
    deletePageNode: builder.mutation<void, { id: string; cascade: boolean }>({
      query: ({ id, cascade }) => ({ url: `/pages/${id}`, method: 'DELETE', params: { cascade } }),
      invalidatesTags: [
        { type: 'Page', id: 'LIST' },
        { type: 'Page', id: 'SUMMARY' },
      ],
    }),
    bulkPageNodes: builder.mutation<
      BulkResult,
      { action: BulkAction; ids: string[]; cascade?: boolean }
    >({
      query: ({ action, ids, cascade = false }) => ({
        url: '/pages/bulk',
        method: 'POST',
        body: { action, ids, cascade },
      }),
      transformResponse: unwrap<BulkResult>,
      invalidatesTags: [
        { type: 'Page', id: 'LIST' },
        { type: 'Page', id: 'SUMMARY' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPageNodesQuery,
  useGetPageNodeQuery,
  useGetPageSummaryQuery,
  useLazyGetPageNodeQuery,
  useLazyGetPageImpactQuery,
  useLazyGetPagePreviewQuery,
  useGetPagePreviewQuery,
  useCreatePageNodeMutation,
  useUpdatePageNodeMutation,
  useMovePageNodeMutation,
  useReorderPageNodesMutation,
  useDuplicatePageNodeMutation,
  useDeletePageNodeMutation,
  useBulkPageNodesMutation,
} = pageApi;
