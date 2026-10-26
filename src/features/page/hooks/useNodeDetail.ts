'use client';

import { skipToken } from '@reduxjs/toolkit/query';
import { getApiErrorMessage } from '@/lib/apiError';
import { useGetPageNodeQuery } from '../api/pageApi';

/** One node plus its breadcrumbs. Pass null for "no node" (the top level). */
export function useNodeDetail(id: string | null) {
  const { data, error, isFetching } = useGetPageNodeQuery(id ?? skipToken, {
    refetchOnMountOrArgChange: true,
  });

  return {
    detail: id ? data : undefined,
    error: id && error ? getApiErrorMessage(error, 'Could not load page') : undefined,
    isLoading: Boolean(id) && isFetching && !data,
  };
}
