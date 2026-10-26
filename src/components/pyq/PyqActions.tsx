'use client';

import { useEffect, useState } from 'react';
import { Download, Eye, Loader2, LockOpen } from 'lucide-react';
import LeadCaptureModal, { type LeadValues } from '@/components/public/LeadCaptureModal';
import { useRequestPyqAccessMutation, type PyqAccess } from '@/features/pyq/api/pyqApi';
import { errorMessage } from '@/features/content/types';

type Action = 'view' | 'download';

const key = (id: string) => `pyq-access:${id}`;

const readUnlocked = (id: string): PyqAccess['file'] | null => {
  try {
    const raw = sessionStorage.getItem(key(id));
    return raw ? (JSON.parse(raw) as PyqAccess['file']) : null;
  } catch {
    return null;
  }
};

export default function PyqActions({
  pyq,
  size = 'md',
}: {
  pyq: { _id: string; title: string };
  size?: 'sm' | 'md';
}) {
  const [requestAccess] = useRequestPyqAccessMutation();
  const [file, setFile] = useState<PyqAccess['file'] | null>(null);
  const [pending, setPending] = useState<Action | null>(null);
  const [downloading, setDownloading] = useState(false);

  // restore the unlocked state for this browser tab session
  useEffect(() => {
    setFile(readUnlocked(pyq._id));
  }, [pyq._id]);

  const view = (f: PyqAccess['file']) => window.open(f.url, '_blank', 'noopener,noreferrer');

  const download = async (f: PyqAccess['file']) => {
    setDownloading(true);
    try {
      const res = await fetch(f.url);
      if (!res.ok) throw new Error('download failed');
      const blob = await res.blob();
      const { saveAs } = await import('file-saver');
      saveAs(blob, f.originalName || `${pyq.title}.pdf`);
    } catch {
      // cross-origin or network problem – let the browser handle it directly
      window.open(f.url, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  const perform = (action: Action, f: PyqAccess['file']) => (action === 'view' ? view(f) : download(f));

  const onClick = (action: Action) => {
    if (file) perform(action, file);
    else setPending(action);
  };

  const submitLead = async (values: LeadValues) => {
    try {
      const res = await requestAccess({ id: pyq._id, ...values }).unwrap();
      const unlocked = res.data.file;
      try {
        sessionStorage.setItem(key(pyq._id), JSON.stringify(unlocked));
      } catch {
        /* ignore */
      }
      setFile(unlocked);
      const action = pending;
      setPending(null);
      if (action) perform(action, unlocked);
    } catch (err) {
      throw new Error(errorMessage(err, 'Could not unlock the PDF. Please try again.'));
    }
  };

  const pad = size === 'sm' ? 'px-3.5 py-2 text-xs' : 'px-5 py-3 text-sm';

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onClick('view')}
          className={`inline-flex items-center gap-2 rounded-xl border border-[#2147a8] font-bold text-[#2147a8] transition-colors hover:bg-blue-50 ${pad}`}
        >
          {file ? <LockOpen className="h-4 w-4" /> : <Eye className="h-4 w-4" />} View
        </button>
        <button
          type="button"
          disabled={downloading}
          onClick={() => onClick('download')}
          className={`inline-flex items-center gap-2 rounded-xl bg-[#2147a8] font-bold text-white transition-all hover:bg-[#1b3b8c] hover:shadow-md disabled:opacity-60 ${pad}`}
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Download PDF
        </button>
      </div>

      <LeadCaptureModal
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Get instant access"
        subtitle={`Enter your details to ${pending === 'download' ? 'download' : 'view'} “${pyq.title}”.`}
        cta={pending === 'download' ? 'Unlock & download' : 'Unlock & view'}
        onSubmit={submitLead}
      />
    </>
  );
}
