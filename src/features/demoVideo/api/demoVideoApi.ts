import { baseApi } from "@/services/baseApi";
import type { ListResponse, CategoryRef } from "@/features/content/types";

export interface DemoVideo {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category: CategoryRef;
  videoUrl: string;
  posterUrl: string;
  durationSeconds: number;
  transcript: string;
}

const api = baseApi.injectEndpoints({
  endpoints: builder => ({
    getDemoVideos: builder.query<ListResponse<DemoVideo>, { page: number; search?: string }>({
      query: params => ({ url: "/demo-videos", params: { ...params, limit: 12 } }),
    }),
  }),
});
export const { useGetDemoVideosQuery } = api;
