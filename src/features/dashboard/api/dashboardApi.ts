import { baseApi } from '../../../services/baseApi';

export interface PublishCounts {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
}

export interface DashboardStats {
  generatedAt: string;
  users: { total: number; verified: number };
  courses: { total: number; live: number; upcoming: number; ended: number };
  blogs: { total: number; published: number; draft: number };
  leads: { total: number; new: number; contacted: number; enrolled: number; lost: number };
  qna: PublishCounts;
  pdfs: PublishCounts & { bytes: number; accesses: number };
  mcqs: PublishCounts & { questions: number; attempts: number };
  storage: {
    files: number;
    bytes: number;
    byType: { type: string; files: number; bytes: number }[];
  };
  leadsDaily: { date: string; count: number }[];
  contentByMonth: {
    month: string;
    courses: number;
    blogs: number;
    pdfs: number;
    mcqs: number;
    qna: number;
  }[];
}

export type TrafficRange = 'day' | 'month' | 'year';

export interface TrafficTotals {
  visitors: number;
  views: number;
}

export interface TrafficStats {
  range: TrafficRange;
  timezone: string;
  generatedAt: string;
  totals: {
    allTime: TrafficTotals;
    today: TrafficTotals;
    yesterday: TrafficTotals;
    thisMonth: TrafficTotals;
    thisYear: TrafficTotals;
  };
  devices: { device: 'mobile' | 'tablet' | 'desktop'; visitors: number }[];
  series: { period: string; visitors: number; views: number }[];
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ({ url: '/dashboard/stats' }),
      transformResponse: (response: { data: DashboardStats }) => response.data,
    }),
    getTrafficStats: builder.query<TrafficStats, TrafficRange>({
      query: (range) => ({ url: '/dashboard/traffic', params: { range } }),
      transformResponse: (response: { data: TrafficStats }) => response.data,
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetTrafficStatsQuery } = dashboardApi;
