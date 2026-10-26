interface SeoPreviewProps {
  title: string;
  url: string;
  description: string;
}

const clip = (value: string, max: number) =>
  value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value;

/** Approximation of a search result - a quick sanity check, not a Google simulator. */
export function SeoPreview({ title, url, description }: SeoPreviewProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-white p-4 ">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        Search result preview
      </p>
      <p className="truncate text-xs text-green-700 ">{url}</p>
      <p className="truncate text-lg text-indigo-700 ">{clip(title || 'Untitled page', 60)}</p>
      <p className="text-sm text-gray-600 ">
        {clip(
          description || 'No description yet. Search engines will pick text from the page.',
          160,
        )}
      </p>
    </div>
  );
}
