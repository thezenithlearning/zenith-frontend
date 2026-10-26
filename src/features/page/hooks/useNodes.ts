'use client';

import { getApiErrorMessage } from '@/lib/apiError';
import { useGetPageNodesQuery } from '../api/pageApi';
import type { NodeListQuery } from '../types';

/**
 * Loads a list of nodes. Previous results stay visible while the next ones
 * load; mutations invalidate the list so it refreshes by itself.
 */
export function useNodes(query: NodeListQuery) {
  const { data, error, isFetching, refetch } = useGetPageNodesQuery(query);

  return {
    items: data?.items ?? [],
    pagination: data?.pagination,
    error: error ? getApiErrorMessage(error, 'Could not load pages') : undefined,
    isLoading: isFetching,
    reload: () => void refetch(),
  };
}
