'use client';

export interface MediaSeoValue {
  title: string;
  description: string;
  altText: string;
  caption: string;
}

/** All four media metadata fields are optional and start empty. */
export const createMediaSeoDefaults = (): MediaSeoValue => ({
  title: '',
  description: '',
  altText: '',
  caption: '',
});

interface MediaSeoFieldsProps {
  value: MediaSeoValue;
  onChange: (value: MediaSeoValue) => void;
  accent?: 'teal' | 'blue';
  compact?: boolean;
}

export default function MediaSeoFields({
  value,
  onChange,
  accent = 'teal',
  compact = false,
}: MediaSeoFieldsProps) {
  const focusClass =
    accent === 'blue'
      ? 'focus:ring-blue-500'
      : 'focus:ring-indigo-500';
  const inputClass = `w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 ${focusClass}`;

  const update = (field: keyof MediaSeoValue, nextValue: string) => {
    onChange({ ...value, [field]: nextValue });
  };

  return (
    <div className={`${compact ? 'mt-3' : 'mt-4'} grid gap-3 sm:grid-cols-2`}>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Media title <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={value.title}
          onChange={(event) => update('title', event.target.value)}
          maxLength={200}
          placeholder="Descriptive media title"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Alt text <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={value.altText}
          onChange={(event) => update('altText', event.target.value)}
          maxLength={300}
          placeholder="Describe the image for accessibility"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Description <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={value.description}
          onChange={(event) => update('description', event.target.value)}
          maxLength={1000}
          rows={2}
          placeholder="Internal or SEO-friendly description"
          className={`${inputClass} resize-y`}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-600">
          Caption <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={value.caption}
          onChange={(event) => update('caption', event.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Caption displayed with the media"
          className={`${inputClass} resize-y`}
        />
      </div>
    </div>
  );
}
