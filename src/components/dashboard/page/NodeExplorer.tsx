'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  Copy,
  CopyPlus,
  Eye,
  EyeOff,
  FilePlus2,
  FolderInput,
  FolderPlus,
  Globe,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';

import { ConfirmDialog } from '@/components/dashboard/page/ui/ConfirmDialog';
import { Notice } from '@/components/dashboard/page/ui/Notice';
import {
  cardClass,
  dangerButton,
  inputClass,
  primaryButton,
  secondaryButton,
} from '@/components/dashboard/page/ui/styles';
import { getApiErrorMessage } from '@/lib/apiError';
import { useDebouncedValue } from '@/features/page/hooks/useDebouncedValue';

import { useNodeDetail } from '@/features/page/hooks/useNodeDetail';
import { useNodes } from '@/features/page/hooks/useNodes';
import { useSummary } from '@/features/page/hooks/useSummary';
import { usePageActions } from '@/features/page/hooks/usePage';
import { DASHBOARD_PAGES_PATH } from '@/features/page/config';
import {
  NODE_STATUSES,
  NODE_TYPES,
  type BulkAction,
  type NodeImpact,
  type NodeListQuery,
  type NodeStatus,
  type NodeType,
  type IPageNode,
} from '@/features/page/types';
import { formatDateTime } from '@/features/page/utils';

import { NodePicker } from './NodePicker';
import { RowMenu, type MenuItem } from './RowMenu';
import { FlagBadges, NodeIcon, StatusBadge } from './StatusBadge';

interface NodeExplorerProps {
  /** Folder being browsed; null = top level. */
  folderId: string | null;
  onNavigate: (id: string | null) => void;
  /** Tell the workspace something changed (refreshes tree, counts, list). */
  onChanged: () => void;
}

interface Filters {
  search: string;
  type: NodeType | '';
  status: NodeStatus | '';
  navigation: '' | 'true' | 'false';
  indexed: '' | 'true' | 'false';
  sort: 'order:asc' | 'title:asc' | 'title:desc' | 'updatedAt:desc' | 'createdAt:desc';
  page: number;
}

const initialFilters: Filters = {
  search: '',
  type: '',
  status: '',
  navigation: '',
  indexed: '',
  sort: 'order:asc',
  page: 1,
};

const PAGE_SIZE = 100;

type Feedback = { tone: 'error' | 'success'; message: string } | null;

export function NodeExplorer({ folderId, onNavigate, onChanged }: NodeExplorerProps) {
  const { bulkNodes, deleteNode, duplicateNode, getImpact, moveNode, reorderNodes, updateNode } =
    usePageActions();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [busy, setBusy] = useState(false);

  const [moveTarget, setMoveTarget] = useState<{ node: IPageNode; impact: NodeImpact } | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<{ node: IPageNode; impact: NodeImpact } | null>(
    null,
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [confirmCascade, setConfirmCascade] = useState(false);

  const debouncedSearch = useDebouncedValue(filters.search).trim();
  const searching = debouncedSearch.length > 0;

  const [sortBy, sortOrder] = filters.sort.split(':') as [
    NonNullable<NodeListQuery['sortBy']>,
    'asc' | 'desc',
  ];

  const query: NodeListQuery = {
    // Searching looks across the whole tree; otherwise show this folder.
    parentId: searching ? undefined : (folderId ?? 'root'),
    search: searching ? debouncedSearch : undefined,
    type: filters.type || undefined,
    status: filters.status || undefined,
    navigation: filters.navigation ? filters.navigation === 'true' : undefined,
    indexed: filters.indexed ? filters.indexed === 'true' : undefined,
    page: filters.page,
    limit: PAGE_SIZE,
    sortBy,
    sortOrder,
  };

  const { items, pagination, error, isLoading, reload } = useNodes(query);
  const { detail } = useNodeDetail(folderId);
  const summary = useSummary();

  const folder = detail?.node;
  const hasFilters = Boolean(
    filters.type || filters.status || filters.navigation || filters.indexed,
  );

  const canReorder =
    !searching &&
    !hasFilters &&
    filters.sort === 'order:asc' &&
    pagination !== undefined &&
    pagination.total === items.length;

  /* ------------------------------------------------------------ helpers */

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === 'page' ? (value as number) : 1,
    }));
    setSelected(new Set());
  }

  function changed(message?: string) {
    if (message) setFeedback({ tone: 'success', message });

    setSelected(new Set());
    onChanged();
  }

  async function run(action: () => Promise<void>, successMessage: string) {
    setBusy(true);
    setFeedback(null);

    try {
      await action();
      changed(successMessage);
    } catch (err) {
      setFeedback({ tone: 'error', message: getApiErrorMessage(err, 'Something went wrong') });
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl(node: IPageNode) {
    try {
      await navigator.clipboard.writeText(node.publicUrl);
      setFeedback({ tone: 'success', message: `Copied ${node.publicUrl}` });
    } catch {
      setFeedback({ tone: 'error', message: 'Could not copy to the clipboard.' });
    }
  }

  async function openMove(node: IPageNode) {
    try {
      setMoveTarget({ node, impact: await getImpact(node.id) });
    } catch (err) {
      setFeedback({ tone: 'error', message: getApiErrorMessage(err, 'Something went wrong') });
    }
  }

  async function openDelete(node: IPageNode) {
    try {
      setConfirmCascade(false);
      setDeleteTarget({ node, impact: await getImpact(node.id) });
    } catch (err) {
      setFeedback({ tone: 'error', message: getApiErrorMessage(err, 'Something went wrong') });
    }
  }

  async function reorder(node: IPageNode, direction: -1 | 1) {
    const ids = items.map((item) => item.id);
    const index = ids.indexOf(node.id);
    const target = index + direction;

    if (index < 0 || target < 0 || target >= ids.length) return;

    [ids[index], ids[target]] = [ids[target], ids[index]];

    await run(() => reorderNodes(folderId, ids), 'Order saved.');
  }

  async function bulk(action: BulkAction, cascade = false) {
    setBusy(true);
    setFeedback(null);

    try {
      const result = await bulkNodes(action, [...selected], cascade);
      const failed = result.failed.length;

      setFeedback(
        failed === 0
          ? { tone: 'success', message: `${result.succeeded.length} updated.` }
          : {
              tone: 'error',
              message: `${result.succeeded.length} updated, ${failed} failed: ${result.failed
                .slice(0, 3)
                .map((item) => item.message)
                .join(' · ')}`,
            },
      );

      setSelected(new Set());
      onChanged();
    } catch (err) {
      setFeedback({ tone: 'error', message: getApiErrorMessage(err, 'Something went wrong') });
    } finally {
      setBusy(false);
      setBulkDeleteOpen(false);
    }
  }

  const newHref = (type: NodeType, parentId: string | null) =>
    `${DASHBOARD_PAGES_PATH}/new?type=${type}${parentId ? `&parent=${parentId}` : ''}`;

  function menuItems(node: IPageNode): MenuItem[] {
    const isPublished = node.status === 'published';

    return [
      {
        label: 'Open folder',
        icon: <ChevronRight className="h-4 w-4" />,
        onSelect: () => onNavigate(node.id),
        hidden: node.childCount === 0 && node.type !== 'folder',
      },
      {
        label: 'Edit',
        icon: <Pencil className="h-4 w-4" />,
        href: `${DASHBOARD_PAGES_PATH}/${node.id}`,
      },
      {
        label: 'Preview',
        icon: <Eye className="h-4 w-4" />,
        href: `${DASHBOARD_PAGES_PATH}/${node.id}/preview`,
      },
      {
        label: 'View public page',
        icon: <Globe className="h-4 w-4" />,
        href: node.publicUrl,
        external: true,
        hidden: !node.isLive,
      },
      {
        label: 'Add page inside',
        icon: <FilePlus2 className="h-4 w-4" />,
        href: newHref('page', node.id),
      },
      {
        label: 'Add folder inside',
        icon: <FolderPlus className="h-4 w-4" />,
        href: newHref('folder', node.id),
      },
      {
        label: 'Duplicate (as draft)',
        icon: <CopyPlus className="h-4 w-4" />,
        onSelect: () =>
          void run(async () => void (await duplicateNode(node.id)), 'Duplicated as a draft.'),
      },
      {
        label: 'Move…',
        icon: <FolderInput className="h-4 w-4" />,
        onSelect: () => void openMove(node),
      },
      {
        label: isPublished ? 'Unpublish' : 'Publish',
        icon: isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
        onSelect: () =>
          void run(
            async () =>
              void (await updateNode(node.id, { status: isPublished ? 'draft' : 'published' })),
            isPublished ? 'Unpublished.' : 'Published.',
          ),
      },
      {
        label: 'Copy public URL',
        icon: <Copy className="h-4 w-4" />,
        onSelect: () => void copyUrl(node),
      },
      {
        label: 'Delete…',
        icon: <Trash2 className="h-4 w-4" />,
        danger: true,
        onSelect: () => void openDelete(node),
      },
    ];
  }

  /* ------------------------------------------------------------- render */

  const allSelected = items.length > 0 && items.every((item) => selected.has(item.id));
  const crumbs = detail?.breadcrumbs ?? [];

  return (
    <div className="space-y-4">
      {/* Breadcrumbs + title */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <nav
            aria-label="Folder path"
            className="flex flex-wrap items-center gap-1 text-sm text-gray-500"
          >
            <button type="button" className="hover:text-gray-900 " onClick={() => onNavigate(null)}>
              Pages
            </button>
            {crumbs.map((crumb) => (
              <span key={crumb.id} className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5" />
                <button
                  type="button"
                  className="hover:text-gray-900 "
                  onClick={() => onNavigate(crumb.id)}
                >
                  {crumb.label}
                </button>
              </span>
            ))}
            {folder && (
              <span className="flex items-center gap-1">
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="font-medium text-gray-900 ">{folder.title}</span>
              </span>
            )}
          </nav>

          <h1 className="mt-1 truncate text-2xl font-semibold text-gray-900 ">
            {folder ? folder.title : 'Pages'}
          </h1>
          {folder && (
            <p className="truncate text-sm text-gray-500">
              {folder.path} · <StatusBadge node={folder} />
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {folder && (
            <Link href={`${DASHBOARD_PAGES_PATH}/${folder.id}`} className={secondaryButton}>
              <Pencil className="h-4 w-4" />
              Edit this {folder.type}
            </Link>
          )}
          <Link href={newHref('folder', folderId)} className={secondaryButton}>
            <FolderPlus className="h-4 w-4" />
            New folder
          </Link>
          <Link href={newHref('page', folderId)} className={primaryButton}>
            <Plus className="h-4 w-4" />
            New page
          </Link>
        </div>
      </div>

      {/* Summary (top level only) */}
      {!folderId && summary && !searching && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ['Pages', summary.pages],
            ['Folders', summary.folders],
            ['Published', summary.published],
            ['Draft', summary.draft],
            ['Archived', summary.archived],
            ['Noindex', summary.noindex],
          ].map(([label, value]) => (
            <div key={label} className={`${cardClass} px-4 py-3`}>
              <dt className="text-xs text-gray-500">{label}</dt>
              <dd className="text-xl font-semibold text-gray-900 ">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Toolbar */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Search title or slug (all pages)…"
            aria-label="Search pages"
            className={`${inputClass} pl-9`}
          />
        </div>

        <select
          aria-label="Filter by type"
          className={inputClass}
          value={filters.type}
          onChange={(event) => updateFilter('type', event.target.value as Filters['type'])}
        >
          <option value="">All types</option>
          {NODE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          className={inputClass}
          value={filters.status}
          onChange={(event) => updateFilter('status', event.target.value as Filters['status'])}
        >
          <option value="">Any status</option>
          {NODE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by navigation"
          className={inputClass}
          value={filters.navigation}
          onChange={(event) =>
            updateFilter('navigation', event.target.value as Filters['navigation'])
          }
        >
          <option value="">Nav: any</option>
          <option value="true">In navigation</option>
          <option value="false">Hidden from navigation</option>
        </select>

        <select
          aria-label="Filter by indexing"
          className={inputClass}
          value={filters.indexed}
          onChange={(event) => updateFilter('indexed', event.target.value as Filters['indexed'])}
        >
          <option value="">Indexing: any</option>
          <option value="true">Indexed</option>
          <option value="false">Noindex</option>
        </select>
      </div>

      <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {selected.size > 0 ? (
            <>
              <span className="text-sm text-gray-600 ">{selected.size} selected</span>
              <button
                type="button"
                className={secondaryButton}
                disabled={busy}
                onClick={() => void bulk('publish')}
              >
                Publish
              </button>
              <button
                type="button"
                className={secondaryButton}
                disabled={busy}
                onClick={() => void bulk('unpublish')}
              >
                Unpublish
              </button>
              <button
                type="button"
                className={secondaryButton}
                disabled={busy}
                onClick={() => void bulk('showInNavigation')}
              >
                Show in nav
              </button>
              <button
                type="button"
                className={secondaryButton}
                disabled={busy}
                onClick={() => void bulk('hideFromNavigation')}
              >
                Hide from nav
              </button>
              <button
                type="button"
                className={dangerButton}
                disabled={busy}
                onClick={() => {
                  setConfirmCascade(false);
                  setBulkDeleteOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          ) : (
            <select
              aria-label="Sort"
              className={`${inputClass} w-auto`}
              value={filters.sort}
              onChange={(event) => updateFilter('sort', event.target.value as Filters['sort'])}
            >
              <option value="order:asc">Custom order</option>
              <option value="title:asc">Title A-Z</option>
              <option value="title:desc">Title Z-A</option>
              <option value="updatedAt:desc">Recently updated</option>
              <option value="createdAt:desc">Newest</option>
            </select>
          )}
        </div>

        <button type="button" className={secondaryButton} onClick={reload} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {feedback && <Notice tone={feedback.tone}>{feedback.message}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      {/* Table */}
      {isLoading && items.length === 0 ? (
        <div className="space-y-2" aria-busy="true">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-md bg-gray-50 " />
          ))}
        </div>
      ) : items.length === 0 && !error ? (
        <div className="rounded-lg border border-dashed border-gray-200 py-16 text-center ">
          <p className="text-sm text-gray-600 ">
            {searching || hasFilters
              ? 'No matching pages found.'
              : folderId
                ? 'This folder is empty. Add a page or folder.'
                : 'No pages created yet. Create your first page or folder.'}
          </p>
          {searching || hasFilters ? (
            <button
              type="button"
              className={`${secondaryButton} mt-4`}
              onClick={() => setFilters(initialFilters)}
            >
              Clear search and filters
            </button>
          ) : (
            <div className="mt-4 flex justify-center gap-2">
              <Link href={newHref('folder', folderId)} className={secondaryButton}>
                New folder
              </Link>
              <Link href={newHref('page', folderId)} className={primaryButton}>
                New page
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`${cardClass} overflow-x-auto transition-opacity ${isLoading ? 'opacity-60' : ''}`}
        >
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 ">
              <tr>
                <th className="w-10 px-3 py-2">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allSelected}
                    onChange={() =>
                      setSelected(allSelected ? new Set() : new Set(items.map((item) => item.id)))
                    }
                  />
                </th>
                <th className="px-3 py-2">Name</th>
                <th className="hidden px-3 py-2 md:table-cell">Slug</th>
                <th className="px-3 py-2">Status</th>
                <th className="hidden px-3 py-2 lg:table-cell">Children</th>
                <th className="hidden px-3 py-2 lg:table-cell">Updated</th>
                <th className="w-24 px-3 py-2 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 ">
              {items.map((node, index) => (
                <tr key={node.id} className={selected.has(node.id) ? 'bg-indigo-50 ' : ''}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Select ${node.title}`}
                      checked={selected.has(node.id)}
                      onChange={() =>
                        setSelected((current) => {
                          const next = new Set(current);

                          if (!next.delete(node.id)) next.add(node.id);

                          return next;
                        })
                      }
                    />
                  </td>

                  <td className="max-w-xs px-3 py-2">
                    <div className="flex items-center gap-2">
                      <NodeIcon type={node.type} />
                      {node.type === 'folder' || node.childCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => onNavigate(node.id)}
                          className="truncate font-medium text-gray-900 hover:underline "
                        >
                          {node.title}
                        </button>
                      ) : (
                        <Link
                          href={`${DASHBOARD_PAGES_PATH}/${node.id}`}
                          className="truncate font-medium text-gray-900 hover:underline "
                        >
                          {node.title}
                        </Link>
                      )}
                    </div>
                    <p className="truncate pl-6 text-xs text-gray-500">{node.path}</p>
                  </td>

                  <td className="hidden px-3 py-2 text-gray-600 md:table-cell ">{node.slug}</td>

                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      <StatusBadge node={node} />
                      <FlagBadges node={node} />
                    </div>
                  </td>

                  <td className="hidden px-3 py-2 text-gray-600 lg:table-cell ">
                    {node.childCount > 0 ? node.childCount : '-'}
                  </td>

                  <td className="hidden px-3 py-2 text-xs text-gray-500 lg:table-cell">
                    {formatDateTime(node.updatedAt)}
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-0.5">
                      {canReorder && (
                        <>
                          <button
                            type="button"
                            aria-label={`Move ${node.title} up`}
                            disabled={busy || index === 0}
                            onClick={() => void reorder(node, -1)}
                            className="rounded p-1 text-gray-500 hover:bg-indigo-50 disabled:opacity-30 "
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${node.title} down`}
                            disabled={busy || index === items.length - 1}
                            onClick={() => void reorder(node, 1)}
                            className="rounded p-1 text-gray-500 hover:bg-indigo-50 disabled:opacity-30 "
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <RowMenu label={`Actions for ${node.title}`} items={menuItems(node)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600 ">
          <span>
            {pagination.total} items · page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className={secondaryButton}
              disabled={isLoading || pagination.page <= 1}
              onClick={() => updateFilter('page', pagination.page - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className={secondaryButton}
              disabled={isLoading || pagination.page >= pagination.totalPages}
              onClick={() => updateFilter('page', pagination.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {busy && (
        <p className="flex items-center gap-2 text-xs text-gray-500" role="status">
          <LoaderCircle className="h-3 w-3 animate-spin" />
          Saving…
        </p>
      )}

      {/* Move */}
      <NodePicker
        open={moveTarget !== null}
        title={moveTarget ? `Move “${moveTarget.node.title}”` : 'Move'}
        confirmLabel="Move here"
        blockedNode={
          moveTarget ? { id: moveTarget.node.id, path: moveTarget.node.path } : undefined
        }
        initialId={moveTarget?.node.parentId ?? null}
        isBusy={busy}
        note={
          moveTarget && moveTarget.impact.descendants > 0 ? (
            <Notice tone="error">
              This page contains {moveTarget.impact.descendants} nested{' '}
              {moveTarget.impact.descendants === 1 ? 'page' : 'pages'}. Moving it changes all of
              their public URLs.
            </Notice>
          ) : null
        }
        onClose={() => setMoveTarget(null)}
        onPick={(parentId) => {
          const target = moveTarget;

          setMoveTarget(null);

          if (target)
            void run(async () => void (await moveNode(target.node.id, parentId)), 'Moved.');
        }}
      />

      {/* Delete one */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={deleteTarget ? `Delete “${deleteTarget.node.title}”?` : 'Delete'}
        description={
          deleteTarget && deleteTarget.impact.descendants > 0
            ? `This ${deleteTarget.node.type} contains ${deleteTarget.impact.directChildren} direct ${deleteTarget.impact.directChildren === 1 ? 'child' : 'children'} (${deleteTarget.impact.descendants} in total). Deleting it permanently removes all of them.`
            : 'This permanently removes the page. Uploaded files stay in the media library.'
        }
        confirmLabel={
          deleteTarget && deleteTarget.impact.descendants > 0 ? 'Delete everything' : 'Delete'
        }
        isBusy={busy}
        confirmDisabled={Boolean(
          deleteTarget && deleteTarget.impact.descendants > 0 && !confirmCascade,
        )}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          const target = deleteTarget;

          if (!target) return;

          setDeleteTarget(null);
          void run(() => deleteNode(target.node.id, target.impact.descendants > 0), 'Deleted.');
        }}
      >
        {deleteTarget && deleteTarget.impact.descendants > 0 && (
          <label className="mt-3 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={confirmCascade}
              onChange={(event) => setConfirmCascade(event.target.checked)}
            />
            I understand that {deleteTarget.impact.descendants} nested pages will be deleted.
          </label>
        )}
      </ConfirmDialog>

      {/* Bulk delete */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Delete ${selected.size} selected?`}
        description="Pages that contain other pages are skipped unless you also allow deleting their contents."
        confirmLabel="Delete"
        isBusy={busy}
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={() => void bulk('delete', confirmCascade)}
      >
        <label className="mt-3 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={confirmCascade}
            onChange={(event) => setConfirmCascade(event.target.checked)}
          />
          Also delete everything inside the selected folders.
        </label>
      </ConfirmDialog>
    </div>
  );
}
