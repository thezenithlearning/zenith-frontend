'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { getApiErrorMessage } from '@/lib/apiError';
import { useAppDispatch } from '@/redux/hooks';

import { pageApi } from '../api/pageApi';
import { TREE_BRANCH_LIMIT } from '../config';
import type { IPageNode } from '../types';

export const ROOT_KEY = 'root';

export interface Branch {
  items: IPageNode[];
  total: number;
  error?: string;
}

/**
 * Lazy, branch-by-branch tree data. A branch is the direct children of one
 * node ("root" for the top level) and is only fetched when first requested,
 * so the dashboard never loads or renders the whole hierarchy.
 */
export function useTreeBranches(refreshToken: number) {
  const dispatch = useAppDispatch();
  const [requested, setRequested] = useState<ReadonlySet<string>>(() => new Set([ROOT_KEY]));
  const [branches, setBranches] = useState<Record<string, Branch>>({});

  const inflight = useRef<Set<string>>(new Set());

  const fetchBranch = useCallback(
    async (key: string) => {
      try {
        const result = await dispatch(
          pageApi.endpoints.getPageNodes.initiate(
            { parentId: key, limit: TREE_BRANCH_LIMIT, sortBy: 'order', sortOrder: 'asc' },
            { forceRefetch: true },
          ),
        ).unwrap();

        setBranches((current) => ({
          ...current,
          [key]: { items: result.items, total: result.pagination.total },
        }));
      } catch (error) {
        setBranches((current) => ({
          ...current,
          [key]: {
            items: current[key]?.items ?? [],
            total: 0,
            error: getApiErrorMessage(error, 'Could not load pages'),
          },
        }));
      } finally {
        inflight.current.delete(key);
      }
    },
    [dispatch],
  );

  // Load every requested branch that has no data yet.
  useEffect(() => {
    for (const key of requested) {
      if (branches[key] || inflight.current.has(key)) continue;

      inflight.current.add(key);
      void fetchBranch(key);
    }
  }, [requested, branches, fetchBranch]);

  // After a change elsewhere, quietly re-fetch what is already open.
  useEffect(() => {
    if (refreshToken === 0) return;

    for (const key of requested) {
      if (inflight.current.has(key)) continue;

      inflight.current.add(key);
      void fetchBranch(key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the token
  }, [refreshToken]);

  const request = useCallback((key: string) => {
    setRequested((current) => (current.has(key) ? current : new Set(current).add(key)));
  }, []);

  return { branches, request };
}
