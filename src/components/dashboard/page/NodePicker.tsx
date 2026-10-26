'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Search, X } from 'lucide-react';

import { inputClass, primaryButton, secondaryButton } from '@/components/dashboard/page/ui/styles';

import { useDebouncedValue } from '@/features/page/hooks/useDebouncedValue';

import { useNodes } from '@/features/page/hooks/useNodes';
import type { IPageNode } from '@/features/page/types';

import { NodeTree } from './NodeTree';
import { NodeIcon } from './StatusBadge';

interface NodePickerProps {
  open: boolean;
  title: string;
  confirmLabel: string;
  onClose: () => void;
  /** null = top level. */
  onPick: (parentId: string | null, node: IPageNode | null) => void;
  /** Node being moved: it and everything beneath it are disabled. */
  blockedNode?: { id: string; path: string };
  /** Pre-selected destination. */
  initialId?: string | null;
  allowRoot?: boolean;
  /** Extra information shown above the buttons (e.g. URL impact). */
  note?: ReactNode;
  isBusy?: boolean;
}

/** Tree + search destination picker shared by Move and the Parent field. */
export function NodePicker(props: NodePickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { open, onClose } = props;

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
      className="m-auto h-[80vh] w-full max-w-lg rounded-lg border border-gray-200 bg-white p-0 text-gray-900 backdrop:bg-black/50 "
    >
      {open && <PickerBody {...props} />}
    </dialog>
  );
}

function PickerBody({
  title,
  confirmLabel,
  onClose,
  onPick,
  blockedNode,
  initialId = null,
  allowRoot = true,
  note,
  isBusy = false,
}: NodePickerProps) {
  const [selected, setSelected] = useState<{ id: string | null; node: IPageNode | null }>({
    id: initialId,
    node: null,
  });
  const [search, setSearch] = useState('');
  const debounced = useDebouncedValue(search).trim();

  const { items, isLoading } = useNodes({ search: debounced || undefined, limit: 30 });

  const isBlocked = (node: IPageNode) =>
    Boolean(
      blockedNode &&
      (node.id === blockedNode.id ||
        node.path === blockedNode.path ||
        node.path.startsWith(`${blockedNode.path}/`)),
    );

  const canConfirm = allowRoot || selected.id !== null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 p-4 ">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded p-1 hover:bg-indigo-50 "
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-gray-200 p-3 ">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or slug…"
            aria-label="Search destinations"
            className={`${inputClass} pl-9`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {debounced ? (
          <ul>
            {items.length === 0 && !isLoading && (
              <li className="p-3 text-sm text-gray-500">No matching pages found.</li>
            )}
            {items.map((node) => {
              const blocked = isBlocked(node);

              return (
                <li key={node.id}>
                  <button
                    type="button"
                    disabled={blocked}
                    onClick={() => setSelected({ id: node.id, node })}
                    className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                      selected.id === node.id ? 'bg-indigo-50 text-indigo-700 ' : 'hover:bg-indigo-50 '
                    }`}
                  >
                    <NodeIcon type={node.type} />
                    <span className="min-w-0">
                      <span className="block truncate">{node.title}</span>
                      <span className="block truncate text-xs text-gray-500">{node.path}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <NodeTree
            selectedId={selected.id}
            onSelect={(node) => setSelected({ id: node?.id ?? null, node })}
            disabledIds={blockedNode ? [blockedNode.id] : []}
            showRootRow={allowRoot}
            rootLabel="Top level (no parent)"
            revealId={initialId}
          />
        )}
      </div>

      <div className="space-y-3 border-t border-gray-200 p-4 ">
        <p className="text-sm text-gray-600 ">
          Destination:{' '}
          <strong className="text-gray-900 ">
            {selected.id === null ? 'Top level' : (selected.node?.path ?? 'Selected page')}
          </strong>
        </p>

        {note}

        <div className="flex justify-end gap-2">
          <button type="button" className={secondaryButton} onClick={onClose} disabled={isBusy}>
            Cancel
          </button>
          <button
            type="button"
            className={primaryButton}
            disabled={!canConfirm || isBusy}
            onClick={() => onPick(selected.id, selected.node)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
