'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import CategorySelect from './CategorySelect';
import StatusBadge from './StatusBadge';
import { Pager, StatsRow, STATUS_FILTER_OPTIONS, inputClass } from './ListParts';
import {
  errorMessage,
  formatDate,
  type CategoryRef,
  type ListResponse,
  type PublishFields,
} from '@/features/content/types';

interface ListArgs {
  category?: string;
  search?: string;
  status?: 'draft' | 'published' | 'scheduled';
  page?: number;
  limit?: number;
}

type MutationHook = () => readonly [
  (arg: never) => { unwrap: () => Promise<unknown> },
  ...unknown[],
];

type Row = Partial<PublishFields> & { _id: string; category?: CategoryRef; createdAt?: string };

interface Props<T extends Row> {
  heading: string;
  description: string;
  icon: LucideIcon;
  addHref: string;
  addLabel: string;
  itemLabel: string;
  useListQuery: (args: ListArgs) => {
    data?: ListResponse<T>;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    refetch: () => unknown;
  };
  useDelete: MutationHook;
  useBulkDelete: MutationHook;
  useStatus: MutationHook;
  getTitle: (item: T) => string;
  getSubtitle?: (item: T) => ReactNode;
  getEditHref: (item: T) => string;
  getPublicHref?: (item: T) => string;
  getExtraActions?: (item: T) => ReactNode;
  getMeta?: (item: T) => ReactNode;
}

export default function AdminContentList<T extends Row>({
  heading,
  description,
  icon: Icon,
  addHref,
  addLabel,
  itemLabel,
  useListQuery,
  useDelete,
  useBulkDelete,
  useStatus,
  getTitle,
  getSubtitle,
  getEditHref,
  getPublicHref,
  getExtraActions,
  getMeta,
}: Props<T>) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'error' | 'ok'; text: string } | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useListQuery({
    page,
    limit: 20,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(category ? { category } : {}),
    ...(status ? { status: status as ListArgs['status'] } : {}),
  });

  const [deleteItem] = useDelete();
  const [bulkDelete, bulkState] = useBulkDelete();
  const [changeStatus] = useStatus();

  const items = data?.data ?? [];
  const allSelected = items.length > 0 && items.every((i) => selected.includes(i._id));
  const bulkBusy = Boolean((bulkState as { isLoading?: boolean } | undefined)?.isLoading);

  const resetPage = () => {
    setPage(1);
    setSelected([]);
  };

  const run = async (id: string, action: () => Promise<unknown>, okText: string) => {
    setBusyId(id);
    setNotice(null);
    try {
      await action();
      setNotice({ type: 'ok', text: okText });
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = (item: T) => {
    if (!confirm(`Delete "${getTitle(item)}"? This cannot be undone.`)) return;
    run(
      item._id,
      async () => {
        await deleteItem(item._id as never).unwrap();
        setSelected((s) => s.filter((id) => id !== item._id));
      },
      `${itemLabel} deleted`,
    );
  };

  const onToggleLive = (item: T) => {
    const live = (item.displayStatus ?? item.status) === 'published';
    run(
      item._id,
      () => changeStatus({ id: item._id, status: live ? 'draft' : 'published' } as never).unwrap(),
      live ? `${itemLabel} moved to drafts` : `${itemLabel} published`,
    );
  };

  const onBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} selected item(s)? This cannot be undone.`)) return;
    setNotice(null);
    try {
      await bulkDelete(selected as never).unwrap();
      setSelected([]);
      setNotice({ type: 'ok', text: `${selected.length} item(s) deleted` });
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/25">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <Link
          href={addHref}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-cyan-700"
        >
          <Plus className="h-4 w-4" /> {addLabel}
        </Link>
      </div>

      <StatsRow stats={data?.stats} loading={isLoading} />

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_200px_180px_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              placeholder="Search…"
              aria-label="Search"
              className={`${inputClass} pl-9`}
            />
          </div>
          <CategorySelect
            value={category}
            allLabel="All categories"
            onChange={(v) => {
              setCategory(v);
              resetPage();
            }}
          />
          <select
            value={status}
            aria-label="Filter by status"
            onChange={(e) => {
              setStatus(e.target.value);
              resetPage();
            }}
            className={inputClass}
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => refetch()}
            aria-label="Refresh"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-3 text-gray-500 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {selected.length > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-red-50 px-4 py-2.5">
            <span className="text-sm font-medium text-red-700">{selected.length} selected</span>
            <button
              type="button"
              onClick={onBulkDelete}
              disabled={bulkBusy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete selected
            </button>
          </div>
        )}
      </div>

      {notice && (
        <div
          role={notice.type === 'error' ? 'alert' : 'status'}
          className={`rounded-xl border px-4 py-3 text-sm ${
            notice.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-blue-200 bg-blue-50 text-blue-700'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-600">Could not load data. Try refreshing.</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-semibold text-gray-900">No {itemLabel.toLowerCase()}s found</p>
            <p className="mt-1 text-sm text-gray-500">Try different filters, or create a new one.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5">
              <input
                type="checkbox"
                aria-label="Select all"
                checked={allSelected}
                onChange={() => setSelected(allSelected ? [] : items.map((i) => i._id))}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {data?.pagination.total ?? items.length} {itemLabel.toLowerCase()}s
              </span>
            </div>

            <ul className="divide-y divide-gray-100">
              {items.map((item) => {
                const live = (item.displayStatus ?? item.status) === 'published';
                const busy = busyId === item._id;
                return (
                  <li key={item._id} className="flex gap-3 px-4 py-4 transition-colors hover:bg-gray-50/60">
                    <input
                      type="checkbox"
                      aria-label={`Select ${getTitle(item)}`}
                      checked={selected.includes(item._id)}
                      onChange={() =>
                        setSelected((s) =>
                          s.includes(item._id) ? s.filter((id) => id !== item._id) : [...s, item._id],
                        )
                      }
                      className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={getEditHref(item)}
                            className="line-clamp-2 font-semibold text-gray-900 hover:text-indigo-700"
                          >
                            {getTitle(item)}
                          </Link>
                          {getSubtitle && (
                            <div className="mt-0.5 line-clamp-1 text-sm text-gray-500">{getSubtitle(item)}</div>
                          )}
                        </div>
                        <StatusBadge item={item} />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500">
                        {item.category && (
                          <span className="rounded-md bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
                            {item.category.name}
                          </span>
                        )}
                        {getMeta?.(item)}
                        {item.createdAt && <span>Created {formatDate(item.createdAt)}</span>}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Link
                          href={getEditHref(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </Link>
                        {getExtraActions?.(item)}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onToggleLive(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          {busy ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : live ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                          {live ? 'Unpublish' : 'Publish now'}
                        </button>
                        {getPublicHref && live && (
                          <a
                            href={getPublicHref(item)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> View live
                          </a>
                        )}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onDelete(item)}
                          className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Pager
              pagination={data?.pagination}
              onPage={(p) => {
                setPage(p);
                setSelected([]);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
