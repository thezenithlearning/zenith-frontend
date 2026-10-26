import { baseApi } from '../../../services/baseApi';

export type AdType = 'popup' | 'topbar';

export interface IAdvertisement {
  _id?: string;
  type: AdType;
  title: string;
  description: string;
  imageUrl: string;
  /** Top banner only: separate image for phones; empty = the main image is used everywhere. */
  mobileImageUrl?: string;
  /** Absolute URL or a site path like /course. Empty = banner is not a link. */
  linkUrl: string;
  isActive?: boolean;
  /** Popup only: seconds after the home page loads. */
  delaySeconds: number;
  updatedAt?: string;
}

export interface AdsResponse {
  success: boolean;
  data: { popup: IAdvertisement | null; topbar: IAdvertisement | null };
}

export interface SaveAdInput {
  title: string;
  description: string;
  imageUrl: string;
  mobileImageUrl: string;
  linkUrl: string;
  isActive: boolean;
  delaySeconds: number;
}

const api = baseApi.enhanceEndpoints({ addTagTypes: ['Advertisement'] });

export const advertisementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPublicAds: builder.query<AdsResponse, void>({
      query: () => ({ url: '/advertisements/public' }),
      providesTags: [{ type: 'Advertisement', id: 'PUBLIC' }],
    }),
    getAdminAds: builder.query<AdsResponse, void>({
      query: () => ({ url: '/advertisements' }),
      providesTags: [{ type: 'Advertisement', id: 'ADMIN' }],
    }),
    saveAd: builder.mutation<{ success: boolean; data: IAdvertisement }, { type: AdType; body: SaveAdInput }>({
      query: ({ type, body }) => ({ url: `/advertisements/${type}`, method: 'PUT', body }),
      invalidatesTags: [
        { type: 'Advertisement', id: 'PUBLIC' },
        { type: 'Advertisement', id: 'ADMIN' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPublicAdsQuery, useGetAdminAdsQuery, useSaveAdMutation } = advertisementApi;

type ImageSpec = { width: number; height: number; note: string };

/** Where each banner type is shown, and the image sizes the admin should upload. */
export const AD_SPECS: Record<AdType, { label: string; width: number; height: number; note: string; mobile?: ImageSpec }> = {
  topbar: {
    label: 'Top banner',
    width: 1920,
    height: 75,
    note: 'Desktop and tablet image (screens 768 px wide and up). It always spans the full width and is never cropped or stretched, so the strip is about 56 px tall on a 1440 px laptop and 75 px on a 1920 px monitor.',
    mobile: {
      width: 750,
      height: 120,
      note: 'Phone image (screens under 768 px wide), about 60 px tall on a 375 px phone. Optional: if you skip it, the desktop image is used on phones too, and will look very thin.',
    },
  },
  popup: {
    label: 'Home popup',
    width: 1200,
    height: 675,
    note: 'The popup shows only this image (16:9) with a close button, and clicking the image opens the navigation URL. Keep important content away from the edges.',
  },
};
