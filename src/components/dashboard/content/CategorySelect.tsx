'use client';

import { useGetCourseCategoriesQuery } from '@/features/courseCategory/api/courseCategoryApi';

interface Props {
  value: string;
  onChange: (id: string) => void;
  /** when set, shows an "All categories" option (used for filters) */
  allLabel?: string;
  id?: string;
  className?: string;
  required?: boolean;
}

export default function CategorySelect({ value, onChange, allLabel, id, className, required }: Props) {
  const { data, isLoading } = useGetCourseCategoriesQuery();
  const categories = data?.data ?? [];

  return (
    <select
      id={id}
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      className={
        className ??
        'w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500'
      }
    >
      {allLabel !== undefined ? (
        <option value="">{allLabel}</option>
      ) : (
        <option value="" disabled>
          {isLoading ? 'Loading categories…' : 'Select a course category'}
        </option>
      )}
      {categories.map((c) => (
        <option key={c._id} value={c._id}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
