'use client';

import { useEffect, useRef, useState } from 'react';
import { Info, Loader2, Save, Trash2, Upload } from 'lucide-react';

import { PopupCard, TopBannerView } from '@/components/ads/AdParts';
import { inputClass } from '@/components/dashboard/content/ListParts';
import {
  AD_SPECS,
  useSaveAdMutation,
  type AdType,
  type IAdvertisement,
} from '@/features/advertisement/api/advertisementApi';
import { uploadFileWithProgress, waitForFileReady } from '@/features/file/api/uploadWithProgress';
import { errorMessage } from '@/features/content/types';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface Props {
  type: AdType;
  /** Saved banner, or null when none has been set up yet. */
  ad: IAdvertisement | null;
}

/** One image slot: upload, replace, remove, and a warning when the shape isn't the recommended one. */
function ImageUploader({
  label,
  hint,
  width,
  height,
  value,
  onChange,
  onError,
  uploadTitle,
}: {
  label: string;
  hint: string;
  width: number;
  height: number;
  value: string;
  onChange: (url: string) => void;
  onError: (message: string) => void;
  uploadTitle: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [measured, setMeasured] = useState<{ url: string; w: number; h: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const size = measured && measured.url === value ? measured : null;

  // Reading the real pixel size lets us warn when the image isn't the recommended shape.
  useEffect(() => {
    if (!value) return;
    let cancelled = false;
    const probe = new window.Image();
    probe.onload = () => {
      if (!cancelled) setMeasured({ url: value, w: probe.naturalWidth, h: probe.naturalHeight });
    };
    probe.src = value;
    return () => {
      cancelled = true;
    };
  }, [value]);

  const wantedRatio = width / height;
  const ratioOff = size ? Math.abs(size.w / size.h - wantedRatio) / wantedRatio > 0.1 : false;

  const pick = async (file?: File) => {
    if (!file) return;
    onError('');

    if (!ALLOWED_TYPES.includes(file.type)) return onError('Upload a JPG, PNG, WebP or GIF image.');
    if (file.size > MAX_IMAGE_BYTES) return onError('The image must be 5 MB or smaller.');

    const body = new FormData();
    body.append('file', file);
    body.append('title', uploadTitle);

    try {
      setUploading(true);
      setProgress(0);
      const result = await uploadFileWithProgress(body, ({ loaded, total }) =>
        setProgress(total ? Math.round((loaded / total) * 100) : 0),
      );
      const ready = await waitForFileReady(result.data);
      onChange(ready.url);
    } catch (err) {
      onError((err as { message?: string })?.message || 'Could not upload the image.');
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  return (
    <div>
      <span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span>
      <p className="mb-2 text-xs text-gray-500">{hint}</p>
      <input
        ref={fileInput}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      {value ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="max-h-44 w-full rounded-xl border border-gray-200 bg-gray-50 object-contain" />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
            >
              <Upload className="h-4 w-4" /> Replace image
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => onChange('')}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
            {size && (
              <span className={`text-xs ${ratioOff ? 'font-semibold text-amber-600' : 'text-gray-500'}`}>
                Uploaded: {size.w} × {size.h} px
                {ratioOff && ` — differs from the recommended ${width} × ${height}`}
              </span>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInput.current?.click()}
          className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-4 py-8 text-center transition hover:border-indigo-500 hover:bg-indigo-50/40 disabled:opacity-60"
        >
          <Upload className="mb-2 h-8 w-8 text-gray-300" />
          <span className="text-sm font-medium text-gray-600">Click to upload</span>
          <span className="mt-1 text-xs text-gray-400">
            {width} × {height} px
          </span>
        </button>
      )}
      {uploading && (
        <div className="mt-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1 text-xs text-gray-500">Uploading… {progress}%</p>
        </div>
      )}
    </div>
  );
}

/** Edits one banner (top bar or home popup): image(s), link, timing and on/off. */
export default function AdEditor({ type, ad }: Props) {
  const spec = AD_SPECS[type];
  const [saveAd, { isLoading: saving }] = useSaveAdMutation();

  const [imageUrl, setImageUrl] = useState(ad?.imageUrl ?? '');
  const [mobileImageUrl, setMobileImageUrl] = useState(ad?.mobileImageUrl ?? '');
  const [linkUrl, setLinkUrl] = useState(ad?.linkUrl ?? '');
  const [isActive, setIsActive] = useState(ad?.isActive ?? false);
  const [delaySeconds, setDelaySeconds] = useState(String(ad?.delaySeconds ?? 5));

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const save = async () => {
    setError('');
    setNotice('');

    if (!imageUrl) return setError(type === 'topbar' ? 'Upload the desktop banner image first.' : 'Upload a banner image first.');
    const link = linkUrl.trim();
    if (link && !/^\/(?!\/)/.test(link) && !/^https?:\/\//i.test(link)) {
      return setError('The link must start with / (a page on this site) or http(s)://');
    }
    const delay = Number(delaySeconds);
    if (type === 'popup' && (!Number.isInteger(delay) || delay < 0 || delay > 600)) {
      return setError('Popup delay must be a whole number of seconds from 0 to 600.');
    }

    try {
      await saveAd({
        type,
        body: {
          title: '',
          description: '',
          imageUrl,
          mobileImageUrl: type === 'topbar' ? mobileImageUrl : '',
          linkUrl: link,
          isActive,
          delaySeconds: type === 'popup' ? delay : 5,
        },
      }).unwrap();
      setNotice(isActive ? 'Saved — the banner is live on the website.' : 'Saved — the banner is switched off.');
    } catch (err) {
      setError(errorMessage(err, 'Could not save the banner'));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {notice}
          </div>
        )}

        <div className="flex gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold">
              {type === 'topbar'
                ? `Desktop image: ${spec.width} × ${spec.height} px · Phone image: ${spec.mobile?.width} × ${spec.mobile?.height} px`
                : `Image size: ${spec.width} × ${spec.height} px`}
            </p>
            <p className="text-indigo-800">{spec.note}</p>
            {spec.mobile && <p className="text-indigo-800">{spec.mobile.note}</p>}
            <p className="text-indigo-800">JPG, PNG or WebP, up to 5 MB each — under 500 KB loads fastest.</p>
          </div>
        </div>

        <ImageUploader
          label={type === 'topbar' ? 'Desktop image' : 'Banner image'}
          hint={
            type === 'topbar'
              ? 'Shown on screens 768 px wide and up.'
              : 'Shown at the top of the popup.'
          }
          width={spec.width}
          height={spec.height}
          value={imageUrl}
          onChange={setImageUrl}
          onError={(message) => {
            setError(message);
            setNotice('');
          }}
          uploadTitle={`${spec.label} banner`}
        />

        {type === 'topbar' && spec.mobile && (
          <ImageUploader
            label="Phone image (optional)"
            hint="Shown on screens under 768 px wide. Leave empty to use the desktop image on phones too."
            width={spec.mobile.width}
            height={spec.mobile.height}
            value={mobileImageUrl}
            onChange={setMobileImageUrl}
            onError={(message) => {
              setError(message);
              setNotice('');
            }}
            uploadTitle={`${spec.label} banner (mobile)`}
          />
        )}

        <div>
          <label htmlFor={`ad-link-${type}`} className="mb-1.5 block text-sm font-semibold text-gray-700">
            Navigation URL <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id={`ad-link-${type}`}
            value={linkUrl}
            maxLength={1000}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="/course/ib-dp-physics  or  https://…"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            The whole banner becomes a link to this address. Use a path starting with / for pages on this site.
          </p>
        </div>

        {type === 'popup' && (
          <div>
            <label htmlFor="ad-delay" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Show after (seconds)
            </label>
            <input
              id="ad-delay"
              type="number"
              min={0}
              max={600}
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(e.target.value)}
              className={`${inputClass} max-w-[160px]`}
            />
            <p className="mt-1 text-xs text-gray-500">
              How long after a visitor lands on the home page the popup opens. It appears again on every refresh.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-5">
          <label className="inline-flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-semibold text-gray-800">
              {isActive ? 'Live on the website' : 'Switched off'}
            </span>
          </label>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save banner
          </button>
        </div>
      </div>

      <aside className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">Preview</p>
        {!imageUrl ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
            Upload an image to see a preview.
          </div>
        ) : type === 'topbar' ? (
          <div className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">On desktop and tablet</p>
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 p-3">
                <TopBannerView ad={{ imageUrl, linkUrl }} variant="desktop" />
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">
                On a phone {mobileImageUrl ? '' : '(no phone image — desktop image is used)'}
              </p>
              <div className="mx-auto max-w-[375px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 p-3">
                <TopBannerView ad={{ imageUrl, mobileImageUrl, linkUrl }} variant="mobile" />
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 p-3">
            <PopupCard ad={{ imageUrl, linkUrl }} />
          </div>
        )}
        <p className="text-xs text-gray-500">
          {type === 'topbar'
            ? 'Shown above the navbar on every public page; visitors can close it.'
            : 'Opens as a popup on the home page after the delay you set.'}
        </p>
      </aside>
    </div>
  );
}
