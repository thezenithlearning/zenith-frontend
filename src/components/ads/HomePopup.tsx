'use client';

import { useEffect, useState } from 'react';
import { useGetPublicAdsQuery } from '@/features/advertisement/api/advertisementApi';
import { PopupCard } from './AdParts';

/**
 * Home-page popup managed from Dashboard → Advertisement. Opens `delaySeconds`
 * after the home page loads — on every visit and every refresh. Closing it only
 * hides it until the page is loaded again.
 */
export default function HomePopup() {
  const { data } = useGetPublicAdsQuery();
  const ad = data?.data.popup ?? null;
  const delaySeconds = ad?.delaySeconds ?? 0;
  const hasAd = Boolean(ad);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!hasAd) return;
    const timer = window.setTimeout(() => setOpen(true), Math.max(0, delaySeconds) * 1000);
    return () => window.clearTimeout(timer);
  }, [hasAd, delaySeconds]);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!ad || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div role="dialog" aria-modal="true" aria-label="Announcement" className="max-h-full w-full max-w-xl overflow-y-auto">
        <PopupCard ad={ad} onClose={close} />
      </div>
    </div>
  );
}
