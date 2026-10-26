'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  CloudUpload,
  Code2,
  Copy,
  FolderOpen,
  LoaderCircle,
} from 'lucide-react';

import { Notice } from '@/components/dashboard/page/ui/Notice';
import { cardClass, secondaryButton } from '@/components/dashboard/page/ui/styles';
import { getApiErrorMessage } from '@/lib/apiError';
import { uploadPageFile } from '@/features/page/api/uploadPageFile';

import { FilePickerDialog, type Asset } from './FilePickerDialog';

import { embedSnippet } from '@/features/page/utils/sections';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Upload (or pick) a file, then copy its URL - or a ready-made HTML snippet
 * - to paste anywhere: the visual editor, the code editor, a CTA link...
 */
export function FileHelperPanel() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(list: File[]) {
    setError(null);

    for (const file of list) {
      setUploading((count) => count + 1);

      try {
        const asset = await uploadPageFile(file);

        setFiles((current) => [asset, ...current]);
      } catch (err) {
        setError(`${file.name}: ${getApiErrorMessage(err, 'Upload failed')}`);
      } finally {
        setUploading((count) => count - 1);
      }
    }
  }

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((current) => (current === key ? null : current)), 1500);
    } catch {
      setError('Could not copy to the clipboard.');
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    void upload(Array.from(event.dataTransfer.files));
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    const list = Array.from(event.target.files ?? []);

    event.target.value = '';
    void upload(list);
  }

  return (
    <section className={cardClass} aria-label="File helper">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        <span className="font-medium">File helper</span>
        <span className="text-sm text-gray-500">
          Upload a file, copy its URL, embed it anywhere
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-gray-200 p-4 ">
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
              dragging ? 'border-indigo-600 bg-indigo-50 ' : 'border-gray-200 '
            }`}
          >
            {uploading > 0 ? (
              <LoaderCircle className="h-6 w-6 animate-spin text-gray-500" />
            ) : (
              <CloudUpload className="h-6 w-6 text-gray-500" />
            )}
            <span className="font-medium">
              {uploading > 0
                ? `Uploading ${uploading} file${uploading > 1 ? 's' : ''}…`
                : 'Drop files here or click to upload'}
            </span>
            <span className="text-xs text-gray-500">
              Images, PDFs, videos, documents - stored in your media library
            </span>
            <input ref={inputRef} type="file" multiple className="sr-only" onChange={onInput} />
          </label>

          <div>
            <button type="button" className={secondaryButton} onClick={() => setPickerOpen(true)}>
              <FolderOpen className="h-4 w-4" />
              Pick from media library
            </button>
          </div>

          {error && <Notice tone="error">{error}</Notice>}

          {files.length > 0 && (
            <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 ">
              {files.map((asset) => (
                <li key={asset._id} className="flex flex-wrap items-center gap-3 p-3">
                  {asset.assetType === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element -- configurable asset host
                    <img src={asset.url} alt="" className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded bg-gray-50 text-xs uppercase text-gray-500 ">
                      {asset.format || asset.assetType}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {asset.title || asset.originalName}
                    </p>
                    <p className="truncate text-xs text-gray-500" title={asset.url}>
                      {asset.url}
                    </p>
                    <p className="text-xs text-gray-500">{formatSize(asset.size)}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={secondaryButton}
                      onClick={() => void copy(`${asset._id}-url`, asset.url)}
                    >
                      {copied === `${asset._id}-url` ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copied === `${asset._id}-url` ? 'Copied' : 'Copy URL'}
                    </button>
                    <button
                      type="button"
                      className={secondaryButton}
                      onClick={() => void copy(`${asset._id}-html`, embedSnippet(asset))}
                    >
                      {copied === `${asset._id}-html` ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Code2 className="h-4 w-4" />
                      )}
                      {copied === `${asset._id}-html` ? 'Copied' : 'Copy HTML'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <FilePickerDialog
        open={pickerOpen}
        title="Choose a file"
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) => {
          setFiles((current) => [asset, ...current.filter((item) => item._id !== asset._id)]);
          setOpen(true);
        }}
      />
    </section>
  );
}
