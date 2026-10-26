'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import type { IAdvertisement } from '@/features/advertisement/api/advertisementApi';

type AdContent = Pick<IAdvertisement, 'title' | 'description' | 'imageUrl' | 'linkUrl'>;

/** Site paths use next/link; anything else opens in a new tab. No link = plain wrapper. */
export function AdLink({
  href,
  className,
  children,
  label,
  onClick,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  label?: string;
  onClick?: () => void;
}) {
  if (!href) return <div className={className}>{children}</div>;

  if (href.startsWith('/')) {
    return (
      <Link href={href} className={className} aria-label={label} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={label} onClick={onClick}>
      {children}
    </a>
  );
}

/**
 * The long banner above the navbar: images only, the whole bar is the link.
 * Phones get the mobile image (when one is set); everything else gets the desktop
 * image. Either way the image keeps its own proportions at full width, so the strip
 * is never cropped or stretched. `variant` forces one version (for dashboard previews).
 */
export function TopBannerView({
  ad,
  onClose,
  variant = 'responsive',
}: {
  ad: Pick<AdContent, 'imageUrl' | 'linkUrl'> & { mobileImageUrl?: string };
  onClose?: () => void;
  variant?: 'responsive' | 'desktop' | 'mobile';
}) {
  const mobileSrc = ad.mobileImageUrl || '';
  const src = variant === 'mobile' ? mobileSrc || ad.imageUrl : ad.imageUrl;

  return (
    <div className="relative bg-slate-900">
      <AdLink href={ad.linkUrl} label="Advertisement" className="block">
        <picture>
          {variant === 'responsive' && mobileSrc && <source media="(max-width: 767px)" srcSet={mobileSrc} />}
          <img src={src} alt="Advertisement" className="block h-auto w-full" draggable={false} />
        </picture>
      </AdLink>
      {onClose && (
        <button
          type="button"
          aria-label="Close announcement"
          onClick={onClose}
          className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60 sm:right-3 sm:h-7 sm:w-7"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

/** The home-page popup: just the image (which is the link) and a close button. */
export function PopupCard({ ad, onClose }: { ad: Pick<AdContent, 'imageUrl' | 'linkUrl'>; onClose?: () => void }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
      {onClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75"
        >
          <X size={18} />
        </button>
      )}
      <AdLink href={ad.linkUrl} label="Advertisement" onClick={onClose} className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ad.imageUrl} alt="Advertisement" className="block aspect-video w-full object-cover" draggable={false} />
      </AdLink>
    </div>
  );
}
