import { CalendarClock, CircleCheck, FileEdit } from 'lucide-react';
import { formatDateTime, type PublishFields } from '@/features/content/types';

export default function StatusBadge({ item }: { item: Partial<PublishFields> }) {
  const status = item.displayStatus ?? item.status;

  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
        <CircleCheck className="h-3 w-3" /> Published
      </span>
    );
  }

  if (status === 'scheduled') {
    return (
      <span
        title={`Goes live ${formatDateTime(item.publishAt)}`}
        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200"
      >
        <CalendarClock className="h-3 w-3" /> Scheduled · {formatDateTime(item.publishAt)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
      <FileEdit className="h-3 w-3" /> Draft
    </span>
  );
}
