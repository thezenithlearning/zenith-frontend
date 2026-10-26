export interface CourseApiErrorData {
  message?: string;
  detail?: string;
  issues?: Array<{ message?: string }>;
}

export const getCourseErrorStatus = (error: unknown): number | string | undefined => {
  if (!error || typeof error !== 'object') return undefined;
  return (error as { status?: number | string }).status;
};

export const getCourseErrorMessage = (
  error: unknown,
  fallback = 'Course request failed.',
): string => {
  if (!error || typeof error !== 'object') {
    return typeof error === 'string' && error.trim() ? error : fallback;
  }

  const apiError = error as {
    status?: number | string;
    error?: string;
    message?: string;
    data?: CourseApiErrorData | string;
  };

  if (apiError.status === 'FETCH_ERROR' || apiError.error === 'FETCH_ERROR') {
    return 'Network error. Please check that the backend is running and try again.';
  }

  if (apiError.status === 401) return 'Session expired. Please login again.';
  if (apiError.status === 403) return 'You do not have permission to perform this action.';
  if (apiError.status === 404) return 'Course not found.';

  if (typeof apiError.data === 'string' && apiError.data.trim()) {
    return apiError.data;
  }

  const data = apiError.data as CourseApiErrorData | undefined;

  return (
    data?.message ||
    data?.detail ||
    data?.issues?.find((issue) => issue.message)?.message ||
    apiError.message ||
    fallback
  );
};
