'use client';

import { CalendarClock, FileEdit, Globe } from 'lucide-react';
import type { PublishStatus } from '@/features/content/types';

export interface PublishState {
  status: PublishStatus;
  /** value for <input type="datetime-local"> (local time) */
  publishAt: string;
}

const OPTIONS: { value: PublishStatus; label: string; hint: string; icon: typeof Globe }[] = [
  { value: 'draft', label: 'Save as draft', hint: 'Hidden from the website', icon: FileEdit },
  { value: 'published', label: 'Publish now', hint: 'Goes live immediately', icon: Globe },
  { value: 'scheduled', label: 'Schedule', hint: 'Goes live at a set date & time', icon: CalendarClock },
];

const nowLocalMin = (): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 1);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function PublishPanel({
  value,
  onChange,
}: {
  value: PublishState;
  onChange: (next: PublishState) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900">Visibility</h3>
      <p className="mt-0.5 text-xs text-gray-500">Choose when this goes live on the public website.</p>

      <div className="mt-4 space-y-2" role="radiogroup" aria-label="Publishing status">
        {OPTIONS.map(({ value: v, label, hint, icon: Icon }) => {
          const active = value.status === v;
          return (
            <label
              key={v}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all ${
                active
                  ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/15'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="publish-status"
                className="sr-only"
                checked={active}
                onChange={() => onChange({ ...value, status: v })}
              />
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-gray-900">{label}</span>
                <span className="block text-xs text-gray-500">{hint}</span>
              </span>
            </label>
          );
        })}
      </div>

      {value.status === 'scheduled' && (
        <div className="mt-4">
          <label htmlFor="publish-at" className="mb-1.5 block text-xs font-semibold text-gray-600">
            Publish date &amp; time
          </label>
          <input
            id="publish-at"
            type="datetime-local"
            min={nowLocalMin()}
            value={value.publishAt}
            onChange={(e) => onChange({ ...value, publishAt: e.target.value })}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Uses your local time ({Intl.DateTimeFormat().resolvedOptions().timeZone}). It appears on the
            website automatically at that moment.
          </p>
        </div>
      )}
    </div>
  );
}
