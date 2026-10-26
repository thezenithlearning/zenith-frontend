'use client';

import { useGetPageSummaryQuery } from '../api/pageApi';

export function useSummary() {
  return useGetPageSummaryQuery().data;
}
