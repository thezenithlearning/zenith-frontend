'use client';

import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

import {
  hintClass,
  inputClass,
  labelClass,
  secondaryButton,
} from '@/components/dashboard/page/ui/styles';
import { FilePickerDialog, type Asset } from './FilePickerDialog';

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className={hintClass}>{hint}</p>
      )}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  type = 'text',
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
  label: string;
}) {
  return (
    <input
      type={type}
      aria-label={label}
      className={inputClass}
      value={value}
      maxLength={maxLength}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {children}
    </label>
  );
}

/** A URL box with "Choose" (media library / upload) and a thumbnail. */
export function AssetField({
  label,
  hint,
  value,
  onChange,
  onPickAsset,
  assetType,
  placeholder = 'https://… or choose from library',
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  /** Called with the full asset when one is chosen (to fill in name, type...). */
  onPickAsset?: (asset: Asset) => void;
  /** Limit the library to images. Omit to allow any file. */
  assetType?: 'image';
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const looksLikeImage =
    assetType === 'image' || /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(value);

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        {value && looksLikeImage && (
          // eslint-disable-next-line @next/next/no-img-element -- configurable asset host
          <img
            src={value}
            alt=""
            className="h-12 w-20 rounded border border-gray-200 object-cover "
          />
        )}
        <input
          aria-label={label}
          className={`${inputClass} min-w-48 flex-1`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        <button type="button" className={secondaryButton} onClick={() => setOpen(true)}>
          Choose
        </button>
        {value && (
          <button type="button" className={secondaryButton} onClick={() => onChange('')}>
            Clear
          </button>
        )}
      </div>
      {hint && <p className={hintClass}>{hint}</p>}

      <FilePickerDialog
        open={open}
        assetType={assetType}
        title={assetType === 'image' ? 'Choose an image' : 'Choose a file'}
        onClose={() => setOpen(false)}
        onSelect={(asset) => {
          onChange(asset.url);
          onPickAsset?.(asset);
        }}
      />
    </div>
  );
}

/** Row chrome for repeatable items: reorder + remove. */
export function ItemFrame({
  title,
  index,
  total,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  const iconButton = 'rounded p-1.5 text-gray-500 hover:bg-indigo-50 disabled:opacity-30 ';

  return (
    <div className="rounded-md border border-gray-200 ">
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-3 py-1.5 ">
        <span className="truncate text-sm font-medium">
          {index + 1}. {title}
        </span>
        <div className="flex shrink-0">
          <button
            type="button"
            className={iconButton}
            disabled={index === 0}
            onClick={() => onMove(-1)}
            aria-label={`Move item ${index + 1} up`}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={iconButton}
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            aria-label={`Move item ${index + 1} down`}
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={`${iconButton} hover:text-red-700`}
            onClick={onRemove}
            aria-label={`Remove item ${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-3 p-3">{children}</div>
    </div>
  );
}

/** Immutable array helpers used by every list editor. */
export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;

  if (target < 0 || target >= items.length) return items;

  const next = [...items];

  [next[index], next[target]] = [next[target], next[index]];

  return next;
}

export function replaceAt<T>(items: T[], index: number, value: T): T[] {
  return items.map((item, position) => (position === index ? value : item));
}

export function removeAt<T>(items: T[], index: number): T[] {
  return items.filter((_, position) => position !== index);
}
