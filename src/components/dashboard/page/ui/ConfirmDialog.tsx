'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';

import { dangerButton, secondaryButton } from './styles';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isBusy?: boolean;
  /** Keeps the confirm button disabled (e.g. until a checkbox is ticked). */
  confirmDisabled?: boolean;
  /** Extra content under the description (impact details, options...). */
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  isBusy = false,
  confirmDisabled = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Native <dialog> gives focus trapping, Esc handling and a backdrop.
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();

        if (!isBusy) onCancel();
      }}
      className="m-auto w-full max-w-md rounded-lg border border-gray-200 bg-white p-0 text-gray-900 backdrop:bg-black/50 "
    >
      <div className="space-y-2 p-5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-gray-600 ">{description}</p>
        {children}
      </div>

      <div className="flex justify-end gap-2 border-t border-gray-200 p-4 ">
        <button type="button" className={secondaryButton} onClick={onCancel} disabled={isBusy}>
          Cancel
        </button>
        <button
          type="button"
          className={dangerButton}
          onClick={onConfirm}
          disabled={isBusy || confirmDisabled}
        >
          {isBusy && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
