'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, LoaderCircle } from 'lucide-react';

import { usePageActions } from '@/features/page/hooks/usePage';
import { ROOT_KEY, useTreeBranches, type Branch } from '@/features/page/hooks/useTreeBranches';
import { TREE_BRANCH_LIMIT } from '@/features/page/config';
import type { IPageNode } from '@/features/page/types';

import { NodeIcon } from './StatusBadge';

interface NodeTreeProps {
  /** Highlighted node (null = the "Pages" root). */
  selectedId: string | null;
  onSelect: (node: IPageNode | null) => void;
  /** Bump to re-fetch the branches that are already open. */
  refreshToken?: number;
  /** Open every ancestor of this node (deep links, search results). */
  revealId?: string | null;
  /** These nodes - and everything below them - cannot be chosen (move dialogs). */
  disabledIds?: string[];
  /** Show a selectable "Top level" row (move / parent pickers). */
  showRootRow?: boolean;
  rootLabel?: string;
}

const INDENT_PX = 14;
const MAX_VISUAL_DEPTH = 14;

export function NodeTree({
  selectedId,
  onSelect,
  refreshToken = 0,
  revealId = null,
  disabledIds = [],
  showRootRow = true,
  rootLabel = 'Pages',
}: NodeTreeProps) {
  const { branches, request } = useTreeBranches(refreshToken);
  const { getNode } = usePageActions();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());

  // Expand the chain of ancestors so a deep node is visible immediately.
  useEffect(() => {
    if (!revealId) return;

    let cancelled = false;

    getNode(revealId)
      .then(({ breadcrumbs }) => {
        if (cancelled) return;

        const ids = [...breadcrumbs.map((crumb) => crumb.id), revealId];

        setExpanded((current) => new Set([...current, ...ids]));
        ids.forEach(request);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getNode is stable per mount
  }, [revealId, request]);

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        request(id);
      }

      return next;
    });
  }

  const disabled = new Set(disabledIds);

  return (
    <div role="tree" aria-label="Page hierarchy" className="overflow-x-auto">
      <div className="min-w-max pb-2">
        {showRootRow && (
          <button
            type="button"
            role="treeitem"
            aria-selected={selectedId === null}
            onClick={() => onSelect(null)}
            className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm font-semibold ${
              selectedId === null ? 'bg-indigo-50 text-indigo-700 ' : 'text-gray-900 hover:bg-indigo-50 '
            }`}
          >
            {rootLabel}
          </button>
        )}

        <Branch
          parentKey={ROOT_KEY}
          depth={0}
          branches={branches}
          expanded={expanded}
          selectedId={selectedId}
          disabled={disabled}
          inheritedDisabled={false}
          onToggle={toggle}
          onSelect={onSelect}
        />
      </div>
    </div>
  );
}

interface BranchProps {
  parentKey: string;
  depth: number;
  branches: Record<string, Branch>;
  expanded: ReadonlySet<string>;
  selectedId: string | null;
  disabled: ReadonlySet<string>;
  inheritedDisabled: boolean;
  onToggle: (id: string) => void;
  onSelect: (node: IPageNode | null) => void;
}

function Branch({
  parentKey,
  depth,
  branches,
  expanded,
  selectedId,
  disabled,
  inheritedDisabled,
  onToggle,
  onSelect,
}: BranchProps) {
  const branch = branches[parentKey];
  const padding = Math.min(depth, MAX_VISUAL_DEPTH) * INDENT_PX + 8;

  if (!branch) {
    return (
      <div
        className="flex items-center gap-2 py-1.5 text-xs text-gray-500"
        style={{ paddingLeft: padding + 20 }}
      >
        <LoaderCircle className="h-3 w-3 animate-spin" />
        Loading…
      </div>
    );
  }

  if (branch.error) {
    return (
      <p className="py-1 text-xs text-red-700" style={{ paddingLeft: padding + 20 }}>
        {branch.error}
      </p>
    );
  }

  if (branch.items.length === 0 && parentKey === ROOT_KEY) {
    return <p className="px-3 py-2 text-xs text-gray-500">No pages yet.</p>;
  }

  return (
    <ul role="group">
      {branch.items.map((node) => {
        const isOpen = expanded.has(node.id);
        const isDisabled = inheritedDisabled || disabled.has(node.id);
        const isSelected = selectedId === node.id;
        const hasChildren = node.childCount > 0;

        return (
          <li key={node.id} role="none">
            <div className="flex items-center" style={{ paddingLeft: padding }}>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => onToggle(node.id)}
                  aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${node.title}`}
                  aria-expanded={isOpen}
                  className="rounded p-0.5 text-gray-500 hover:bg-indigo-50 "
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <span className="inline-block w-5" />
              )}

              <button
                type="button"
                role="treeitem"
                aria-selected={isSelected}
                aria-disabled={isDisabled}
                disabled={isDisabled}
                title={isDisabled ? 'Cannot be chosen here' : node.path}
                onClick={() => onSelect(node)}
                className={`flex min-w-0 flex-1 items-center gap-1.5 rounded px-1.5 py-1 text-left text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                  isSelected
                    ? 'bg-indigo-50 font-medium text-indigo-700 '
                    : 'text-gray-900 hover:bg-indigo-50 '
                }`}
              >
                <NodeIcon type={node.type} open={isOpen} />
                <span className="truncate">{node.title}</span>

                {node.status !== 'published' && (
                  <span
                    className="rounded bg-amber-50 px-1 text-[10px] font-medium uppercase text-amber-700 "
                    title={`Status: ${node.status}`}
                  >
                    {node.status === 'draft' ? 'draft' : node.status}
                  </span>
                )}

                {hasChildren && (
                  <span className="ml-auto pl-2 text-xs text-gray-500">{node.childCount}</span>
                )}
              </button>
            </div>

            {isOpen && hasChildren && (
              <Branch
                parentKey={node.id}
                depth={depth + 1}
                branches={branches}
                expanded={expanded}
                selectedId={selectedId}
                disabled={disabled}
                inheritedDisabled={isDisabled}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            )}
          </li>
        );
      })}

      {branch.total > TREE_BRANCH_LIMIT && (
        <li className="py-1 text-xs text-gray-500" style={{ paddingLeft: padding + 24 }}>
          +{branch.total - TREE_BRANCH_LIMIT} more - open the folder to see all
        </li>
      )}
    </ul>
  );
}
