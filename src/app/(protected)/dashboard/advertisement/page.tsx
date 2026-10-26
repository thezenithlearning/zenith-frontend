'use client';

import { useState } from 'react';
import { Loader2, Megaphone } from 'lucide-react';

import AdEditor from '@/components/dashboard/advertisement/AdEditor';
import { AD_SPECS, useGetAdminAdsQuery, type AdType } from '@/features/advertisement/api/advertisementApi';

const TABS: AdType[] = ['topbar', 'popup'];

export default function AdvertisementDashboardPage() {
  const [tab, setTab] = useState<AdType>('topbar');
  const { data, isLoading, isError, refetch } = useGetAdminAdsQuery();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Megaphone className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisement</h1>
          <p className="text-sm text-gray-500">
            Manage the top banner and the home-page popup. Changes go live as soon as you save.
          </p>
        </div>
      </div>

      <div role="tablist" aria-label="Banner type" className="flex gap-2 border-b border-gray-200">
        {TABS.map((type) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={tab === type}
            onClick={() => setTab(type)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === type ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {AD_SPECS[type].label}
            {data?.data[type]?.isActive && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">LIVE</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <p className="font-semibold text-gray-900">Couldn&apos;t load the banners</p>
          <button type="button" onClick={() => refetch()} className="mt-3 text-sm font-medium text-indigo-600 hover:underline">
            Try again
          </button>
        </div>
      ) : (
        // key resets the form when switching tabs or when the saved banner changes
        <AdEditor key={`${tab}-${data?.data[tab]?.updatedAt ?? 'new'}`} type={tab} ad={data?.data[tab] ?? null} />
      )}
    </div>
  );
}
