// Extracts a human-readable message from an RTK Query / fetch error.
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!error) return fallback;
  if (typeof error === 'string') return error.trim() || fallback;
  if (typeof error !== 'object') return fallback;

  const err = error as {
    status?: number | string;
    error?: string;
    message?: string;
    data?: unknown;
  };

  if (err.status === 'FETCH_ERROR') {
    return 'Unable to reach the server. Please check your connection and try again.';
  }
  if (err.status === 'TIMEOUT_ERROR') {
    return 'The request timed out. Please try again.';
  }

  const data = err.data;
  if (typeof data === 'string' && data.trim()) return data;

  if (data && typeof data === 'object') {
    const d = data as {
      message?: string;
      error?: string;
      issues?: Array<{ message?: string }>;
    };
    if (d.message) return d.message;
    const issue = d.issues?.find((i) => i.message)?.message;
    if (issue) return issue;
    if (typeof d.error === 'string' && d.error) return d.error;
  }

  if (err.status === 401) return 'Invalid email or password.';
  if (err.status === 403) return 'You do not have permission to perform this action.';
  if (err.status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (typeof err.status === 'number' && err.status >= 500) {
    return 'Server error. Please try again later.';
  }

  return err.message || fallback;
};

// Password strength rules (kept in sync with the backend validation).
export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export const getPasswordError = (password: string): string | null => {
  const failed = PASSWORD_RULES.filter((r) => !r.test(password));
  if (failed.length === 0) return null;
  return `Password must have: ${failed.map((r) => r.label.toLowerCase()).join(', ')}.`;
};
