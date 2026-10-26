'use client';

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useLead } from '@/features/lead/hooks/useLead';
import type { CreateLeadRequest } from '@/features/lead/api/leadApi';
import { useGetCoursesQuery } from '@/features/course/api/courseApi';

interface LeadForm {
  name: string;
  phone: string;
  email: string;
  course: string;
  source: string;
  pagePath: string;
  pageTitle: string;
}

const initialForm: LeadForm = {
  name: '',
  phone: '',
  email: '',
  course: '',
  source: '',
  pagePath: '',
  pageTitle: '',
};

const sources = [
  'Website',
  'Google',
  'Facebook',
  'Instagram',
  'LinkedIn',
  'YouTube',
  'WhatsApp',
  'Referral',
  'Walk-in',
  'Other',
];

const getApiErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const apiError = error as {
      data?: {
        message?: string;
      };
    };

    return apiError.data?.message || 'Failed to submit lead.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

export default function LeadPage() {
  const { createLead, isLoading: isSubmitting } = useLead();

  const {
    data: coursesResponse,
    isLoading: isCoursesLoading,
    isFetching: isCoursesFetching,
    isError: isCoursesError,
    refetch: refetchCourses,
  } = useGetCoursesQuery({
    page: 1,
    limit: 100,
    status: 'active',
    sortBy: 'title',
    sortOrder: 'asc',
  });

  const [form, setForm] = useState<LeadForm>(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [leadId, setLeadId] = useState('');

  const courses = useMemo(() => {
    const courseList = coursesResponse?.data ?? [];

    return courseList
      .filter((course) => course.status === 'active' && course.title?.trim())
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [coursesResponse]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setForm((prev) => ({
      ...prev,
      pagePath: window.location.pathname,
      pageTitle: document.title || 'Lead Form',
    }));
  }, []);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError('');
    }

    if (success) {
      setSuccess('');
      setLeadId('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setSuccess('');
    setLeadId('');

    if (!form.phone.trim()) {
      setError('Phone number is required.');
      return;
    }

    if (!form.email.trim()) {
      setError('Email address is required.');
      return;
    }

    if (!form.course.trim()) {
      setError('Please select a course.');
      return;
    }

    if (!form.source.trim()) {
      setError('Please select how you heard about us.');
      return;
    }

    const payload: CreateLeadRequest = {
      phone: form.phone.trim(),
      email: form.email.trim(),
      course: form.course.trim(),
      source: form.source.trim(),
      ...(form.name.trim() && {
        name: form.name.trim(),
      }),
      ...(form.pagePath.trim() && {
        pagePath: form.pagePath.trim(),
      }),
      ...(form.pageTitle.trim() && {
        pageTitle: form.pageTitle.trim(),
      }),
    };

    try {
      const response = await createLead(payload);

      setSuccess(
        response.message ||
          'Your enquiry has been submitted successfully.',
      );

      setLeadId(response.data?.leadId || '');

      setForm((prev) => ({
        ...initialForm,
        pagePath: prev.pagePath,
        pageTitle: prev.pageTitle,
      }));
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const coursesAreLoading = isCoursesLoading || isCoursesFetching;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left Section */}
          <section className="relative hidden overflow-hidden bg-blue-600 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500" />

            <div className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-green-400/20" />

            <div className="relative z-10">
              <div className="mb-10 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                Start your journey with us
              </div>

              <h1 className="max-w-md text-4xl font-bold leading-tight">
                Take the next step towards your career.
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
                Fill in your details and our team will connect with you to
                help you choose the right course.
              </p>
            </div>

            <div className="relative z-10 mt-12 space-y-5">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-400 font-bold text-green-950">
                  ✓
                </div>

                <div>
                  <p className="font-semibold">Expert guidance</p>

                  <p className="text-sm text-blue-100">
                    Get help selecting the right course.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-400 font-bold text-green-950">
                  ✓
                </div>

                <div>
                  <p className="font-semibold">Quick response</p>

                  <p className="text-sm text-blue-100">
                    Our team will contact you shortly.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-400 font-bold text-green-950">
                  ✓
                </div>

                <div>
                  <p className="font-semibold">No obligation</p>

                  <p className="text-sm text-blue-100">
                    Ask questions before making a decision.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Form Section */}
          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-xl">
              <div className="mb-8">
                <div className="mb-3 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-700">
                  Enquire Now
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Get in touch
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter your information below and our team will contact you.
                </p>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 font-bold text-white">
                      ✓
                    </div>

                    <div>
                      <p className="font-semibold text-green-800">
                        {success}
                      </p>

                      {leadId && (
                        <p className="mt-1 text-xs text-green-700">
                          Reference ID: {leadId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Lead Submit Error */}
              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name

                    <span className="ml-1 font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Phone Number
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email Address
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Course - Loaded from Course API */}
                  <div>
                    <label
                      htmlFor="course"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Interested Course
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    {isCoursesError ? (
                      <div className="space-y-2">
                        <div className="flex h-12 items-center rounded-xl border border-red-200 bg-red-50 px-4 text-sm text-red-700">
                          Unable to load courses.
                        </div>

                        <button
                          type="button"
                          onClick={() => refetchCourses()}
                          className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                        >
                          Try loading courses again
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          id="course"
                          name="course"
                          required
                          value={form.course}
                          onChange={handleChange}
                          disabled={
                            coursesAreLoading || courses.length === 0
                          }
                          className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          {coursesAreLoading ? (
                            <option value="">
                              Loading courses...
                            </option>
                          ) : courses.length === 0 ? (
                            <option value="">
                              No active courses available
                            </option>
                          ) : (
                            <>
                              <option value="">
                                Select a course
                              </option>

                              {courses.map((course) => (
                                <option
                                  key={course._id}
                                  value={course.title}
                                >
                                  {course.title}
                                </option>
                              ))}
                            </>
                          )}
                        </select>

                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                          {coursesAreLoading ? (
                            <span className="block h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-slate-400"
                            >
                              <path
                                d="M6 9L12 15L18 9"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Source */}
                  <div>
                    <label
                      htmlFor="source"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      How did you hear about us?
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <select
                        id="source"
                        name="source"
                        required
                        value={form.source}
                        onChange={handleChange}
                        className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      >
                        <option value="">
                          Select source
                        </option>

                        {sources.map((source) => (
                          <option
                            key={source}
                            value={source}
                          >
                            {source}
                          </option>
                        ))}
                      </select>

                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    coursesAreLoading ||
                    isCoursesError ||
                    courses.length === 0
                  }
                  className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Submitting...
                    </>
                  ) : coursesAreLoading ? (
                    'Loading courses...'
                  ) : (
                    'Submit Enquiry'
                  )}
                </button>

                <p className="text-center text-xs leading-5 text-slate-400">
                  By submitting this form, you agree to be contacted by our
                  team regarding your enquiry.
                </p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}