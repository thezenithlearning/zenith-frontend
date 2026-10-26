'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';

import type { PublicPageView } from '@/features/page/types';

export const PREVIEW_FRAME_PATH = '/preview-frame';

export type PreviewMessage =
  { type: 'preview-ready' } | { type: 'preview-view'; view: PublicPageView };

const DEVICES = [
  { id: 'desktop', label: 'Desktop', width: '100%', icon: Monitor },
  { id: 'tablet', label: 'Tablet', width: '820px', icon: Tablet },
  { id: 'mobile', label: 'Mobile', width: '390px', icon: Smartphone },
] as const;

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  /** The page as currently designed - saved or not. */
  view: PublicPageView;
}

/**
 * Full-screen preview of the UNSAVED design. It renders inside an iframe so
 * the device buttons change the real viewport width (responsive CSS reacts
 * exactly as it will for visitors).
 */
export function PreviewDialog({ open, onClose, view }: PreviewDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-0 h-screen w-screen max-h-none max-w-none bg-white p-0 text-gray-900 backdrop:bg-black/60 "
    >
      {open && <PreviewBody view={view} onClose={onClose} />}
    </dialog>
  );
}

function PreviewBody({ view, onClose }: { view: PublicPageView; onClose: () => void }) {
  const [device, setDevice] = useState<(typeof DEVICES)[number]['id']>('desktop');
  const frameRef = useRef<HTMLIFrameElement>(null);

  const send = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'preview-view', view } satisfies PreviewMessage,
      window.location.origin,
    );
  }, [view]);

  // The frame announces itself once mounted; answer with the current design.
  useEffect(() => {
    const onMessage = (event: MessageEvent<PreviewMessage>) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;

      if (event.data?.type === 'preview-ready') send();
    };

    window.addEventListener('message', onMessage);

    return () => window.removeEventListener('message', onMessage);
  }, [send]);

  const width = DEVICES.find((item) => item.id === device)?.width ?? '100%';

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-2 ">
        <div>
          <p className="text-sm font-semibold">Preview</p>
          <p className="text-xs text-gray-500">
            Shows your current design, including unsaved changes.
          </p>
        </div>

        <div
          role="group"
          aria-label="Preview device"
          className="flex gap-1 rounded-md border border-gray-200 p-1 "
        >
          {DEVICES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setDevice(id)}
              aria-pressed={device === id}
              className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-sm ${
                device === id
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'text-gray-600 hover:bg-indigo-50 '
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-indigo-50 "
        >
          <X className="h-4 w-4" />
          Close preview
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50 p-4 ">
        <iframe
          ref={frameRef}
          title="Page preview"
          src={PREVIEW_FRAME_PATH}
          onLoad={send}
          style={{ width }}
          className="mx-auto block h-full min-h-[70vh] max-w-full rounded-md border border-gray-200 bg-white shadow-sm "
        />
      </div>
    </div>
  );
}

/** Builds the render model from what is currently in the form. */
export function buildPreviewView(input: {
  id: string;
  title: string;
  heading: string;
  summary: string;
  type: PublicPageView['type'];
  path: string;
  appearance: PublicPageView['appearance'];
  sections: PublicPageView['sections'];
  folderBehavior: PublicPageView['folderBehavior'];
}): PublicPageView {
  return {
    id: input.id,
    title: input.title,
    heading: input.heading || input.title,
    summary: input.summary,
    html: '',
    sections: input.sections,
    type: input.type,
    folderBehavior: input.folderBehavior,
    appearance: input.appearance,
    path: input.path,
    seo: {
      title: input.title,
      description: input.summary,
      canonicalUrl: '',
      robots: 'noindex, nofollow',
      keywords: [],
      openGraph: {
        title: input.title,
        description: input.summary,
        image: null,
        type: 'website',
        url: '',
      },
      twitter: { card: 'summary', title: input.title, description: input.summary, image: null },
    },
    breadcrumbs: [{ id: input.id, label: input.title, path: input.path }],
    breadcrumbJsonLd: {},
    children: [],
    updatedAt: new Date().toISOString(),
  };
}
