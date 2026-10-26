'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  BookOpen,
  WifiOff,
} from 'lucide-react';
import { useCourse } from '@/features/course/hooks/useCourse';
import {
  getCourseErrorMessage,
  getCourseErrorStatus,
} from '@/features/course/utils/courseError';
import CourseForm from '@/components/dashboard/CourseForm';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { useGetCourseById, updateCourse } = useCourse();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: courseData, isLoading, refetch, error: fetchError } = useGetCourseById(id);

  useEffect(() => {
    if (id) refetch();
  }, [id, refetch]);

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    if (!navigator.onLine) {
      setError('You are offline. Please check your internet connection.');
      setSaving(false);
      return;
    }

    try {
      await updateCourse({ id, body: formData });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/courses'), 2000);
    } catch (err: unknown) {
      setError(getCourseErrorMessage(err, 'Failed to update course.'));

      if (getCourseErrorStatus(err) === 401) {
        setTimeout(() => router.push('/login'), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="mb-3 h-12 w-12 text-red-500" />
        <p className="font-medium text-gray-800">Failed to load course data</p>
        <p className="mt-1 text-sm text-gray-500">Check your connection and try again.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const course = courseData?.data;

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-gray-600">Course not found</p>
        <Link href="/dashboard/courses" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">You are offline. Please check your internet connection.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/courses" className="p-2 bg-white rounded-xl shadow-sm text-gray-600 hover:text-indigo-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Edit Course
            </h1>
            <p className="text-sm text-gray-500 mt-1">{course.title}</p>
          </div>
        </div>
        <Link href="/dashboard/courses" className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700">
          Cancel
        </Link>
      </div>

      {success && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-700">Success</p>
            <p className="text-sm text-blue-600">Course updated successfully! Redirecting...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button id="dashboard-courses-edit-dismiss-error-button" onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      <CourseForm initialData={course} onSubmit={handleSubmit} loading={saving} isEdit />
    </div>
  );
}
