// Shared Tailwind class strings so every screen in the module looks the same.

export const inputClass =
  'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900  outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60';

export const labelClass = 'mb-1 block text-sm font-medium text-gray-600 ';

export const hintClass = 'mt-1 text-xs text-gray-500';

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export const primaryButton = `${buttonBase} bg-indigo-600 text-white hover:bg-indigo-700`;

export const secondaryButton = `${buttonBase} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`;

export const dangerButton = `${buttonBase} bg-red-600 text-white hover:bg-red-700`;

export const cardClass = 'rounded-lg border border-gray-200 bg-white ';
