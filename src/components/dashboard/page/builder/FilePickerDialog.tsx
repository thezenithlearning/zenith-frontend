'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { CloudUpload, LoaderCircle, Search, X } from 'lucide-react';

import { getApiErrorMessage } from '@/lib/apiError';
import { useGetFilesQuery, type IFile } from '@/features/file/api/fileApi';
import { useDebouncedValue } from '@/features/page/hooks/useDebouncedValue';
import { uploadPageFile } from '@/features/page/api/uploadPageFile';

import { Notice } from '../ui/Notice';
import { inputClass, secondaryButton } from '../ui/styles';

export type Asset = IFile;

interface FilePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (file: Asset) => void;
  /** Restrict the library to images (covers, backgrounds). */
  assetType?: 'image';
  title?: string;
}

const isImage = (file: Asset) =>
  file.assetType === 'image' || file.mimeType?.toLowerCase().startsWith('image/');

/**
 * Pick an existing file from the File Manager or upload a new one. Files are
 * stored and served exactly like every other upload in the dashboard.
 */
export function FilePickerDialog({
  open,
  onClose,
  onSelect,
  assetType,
  title = 'Choose from file manager',
}: FilePickerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debounced = useDebouncedValue(search, 250);
  const { data, isLoading, refetch } = useGetFilesQuery(undefined, { skip: !open });

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const files = useMemo(() => {
    const term = debounced.trim().toLowerCase();

    return (data?.data ?? []).filter((file) => {
      if (file.status === 'processing' || file.status === 'failed') return false;
      if (assetType === 'image' && !isImage(file)) return false;
      if (!term) return true;

      return [file.title, file.originalName, file.altText, file.slug]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term));
    });
  }, [data, debounced, assetType]);

  async function onUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) return;

    setError(null);
    setUploading(0);

    try {
      const uploaded = await uploadPageFile(file, setUploading);

      await refetch();
      onSelect(uploaded);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(null);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        if (uploading === null) onClose();
      }}
      className="m-auto w-full max-w-3xl rounded-lg border border-gray-200 bg-white p-0 text-gray-900 backdrop:bg-black/50"
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          aria-label="Close"
          className={secondaryButton}
          onClick={onClose}
          disabled={uploading !== null}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-48 flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search files"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button
            type="button"
            className={secondaryButton}
            onClick={() => inputRef.current?.click()}
            disabled={uploading !== null}
          >
            {uploading === null ? (
              <CloudUpload className="h-4 w-4" />
            ) : (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
            {uploading === null ? 'Upload' : `Uploading ${uploading}%`}
          </button>
          <input
            ref={inputRef}
            type="file"
            className="sr-only"
            accept={assetType === 'image' ? 'image/*' : undefined}
            onChange={onUpload}
          />
        </div>

        {error && <Notice tone="error">{error}</Notice>}

        {isLoading ? (
          <p className="py-10 text-center text-sm text-gray-500">Loading files…</p>
        ) : files.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">No files found.</p>
        ) : (
          <ul className="grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
            {files.map((file) => (
              <li key={file._id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(file);
                    onClose();
                  }}
                  className="flex w-full flex-col overflow-hidden rounded-md border border-gray-200 text-left hover:border-indigo-600"
                >
                  {isImage(file) ? (
                    // eslint-disable-next-line @next/next/no-img-element -- CDN-hosted file
                    <img
                      src={file.url}
                      alt={file.altText || ''}
                      className="h-24 w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-24 w-full items-center justify-center bg-gray-50 text-xs uppercase text-gray-500">
                      {file.format || file.assetType || 'file'}
                    </span>
                  )}
                  <span className="truncate px-2 py-1.5 text-xs">
                    {file.title || file.originalName}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}
