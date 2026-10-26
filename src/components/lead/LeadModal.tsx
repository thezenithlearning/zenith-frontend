'use client';

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle2, ChevronDown, Loader2, Search, X } from 'lucide-react';

import { useGetCoursesQuery } from '@/features/course/api/courseApi';
import { useCreateLeadMutation } from '@/features/lead/api/leadApi';

type LeadModalContextValue = { open: (source?: string) => void };

const LeadModalContext = createContext<LeadModalContextValue>({ open: () => undefined });

export const useLeadModal = () => useContext(LeadModalContext);

const fieldClass =
  'w-full border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1b3b8c] focus:ring-2 focus:ring-[#1b3b8c]/20';

const errorMessageOf = (error: unknown) => {
  const data = (error as { data?: { message?: string } })?.data;
  return data?.message || 'Something went wrong. Please try again.';
};

/** Provides `useLeadModal().open()` to the public site and renders the modal itself. */
export function LeadModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState('start-learning');

  const open = useCallback((nextSource = 'start-learning') => {
    setSource(nextSource);
    setIsOpen(true);
  }, []);
  const value = useMemo(() => ({ open }), [open]);

  return (
    <LeadModalContext.Provider value={value}>
      {children}
      {isOpen && <LeadModal source={source} onClose={() => setIsOpen(false)} />}
    </LeadModalContext.Provider>
  );
}

function LeadModal({ source, onClose }: { source: string; onClose: () => void }) {
  const pathname = usePathname();
  const titleId = useId();
  const listId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const courseBoxRef = useRef<HTMLDivElement>(null);

  const { data, isLoading: coursesLoading } = useGetCoursesQuery({ page: 1, limit: 100, status: 'active' });
  const courseTitles = useMemo(
    () => Array.from(new Set((data?.data ?? []).map((course) => course.title))),
    [data],
  );
  const [createLead, { isLoading: submitting }] = useCreateLeadMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [course, setCourse] = useState('');
  const [courseQuery, setCourseQuery] = useState('');
  const [courseOpen, setCourseOpen] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const filteredCourses = useMemo(() => {
    const q = courseQuery.trim().toLowerCase();
    // Typing after a selection searches again; a just-picked title shows the full list.
    if (!q || courseQuery === course) return courseTitles;
    return courseTitles.filter((title) => title.toLowerCase().includes(q));
  }, [courseQuery, course, courseTitles]);

  useEffect(() => {
    nameRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (courseOpen) setCourseOpen(false);
      else onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [courseOpen, onClose]);

  useEffect(() => {
    if (!courseOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !courseBoxRef.current?.contains(event.target)) setCourseOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [courseOpen]);

  const pickCourse = (title: string) => {
    setCourse(title);
    setCourseQuery(title);
    setCourseOpen(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/[\s()-]/g, '');
    if (name.trim().length < 2) return setError('Please enter your name.');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Please enter a valid email address.');
    if (!/^\+?\d{7,14}$/.test(cleanPhone)) return setError('Please enter a valid phone number (7–14 digits).');
    if (!course) return setError('Please choose the program you are interested in.');

    try {
      await createLead({
        name: name.trim(),
        email: email.trim(),
        phone: cleanPhone,
        course,
        ...(message.trim() ? { message: message.trim() } : {}),
        source,
        pagePath: pathname || '/',
        pageTitle: typeof document !== 'undefined' ? document.title.slice(0, 300) : undefined,
      }).unwrap();
      setDone(true);
    } catch (err) {
      setError(errorMessageOf(err));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[95vh] w-full max-w-lg overflow-y-auto bg-white shadow-2xl sm:rounded-2xl"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <X size={18} />
        </button>

        {done ? (
          <div className="px-6 py-14 text-center sm:px-8">
            <CheckCircle2 className="mx-auto h-14 w-14 text-[#1b3b8c]" />
            <h2 id={titleId} className="mt-4 text-2xl font-black text-slate-900">
              Thank you!
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
              We&apos;ve received your details for <strong>{course}</strong>. Our team will contact you shortly.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex h-11 items-center bg-[#1b3b8c] px-8 text-sm font-bold text-white transition hover:bg-[#0c1d4a]"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="px-6 py-7 sm:px-8">
            <h2 id={titleId} className="pr-8 text-2xl font-black tracking-tight text-slate-900">
              Start your journey with Zenith
            </h2>
            <p className="mt-1 text-sm text-slate-500">Share your details and we&apos;ll help you pick the right program.</p>

            {error && (
              <div role="alert" className="mt-4 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="lead-name" className="mb-1 block text-sm font-semibold text-slate-700">
                  Full name
                </label>
                <input
                  id="lead-name"
                  ref={nameRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  autoComplete="name"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="lead-email" className="mb-1 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  id="lead-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="lead-phone" className="mb-1 block text-sm font-semibold text-slate-700">
                  Phone
                </label>
                <input
                  id="lead-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  className={fieldClass}
                />
              </div>

              <div ref={courseBoxRef} className="relative sm:col-span-2">
                <label htmlFor="lead-course" className="mb-1 block text-sm font-semibold text-slate-700">
                  Course you&apos;re interested in
                </label>
                <div className="relative">
                  <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="lead-course"
                    role="combobox"
                    aria-expanded={courseOpen}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    autoComplete="off"
                    value={courseQuery}
                    placeholder={coursesLoading ? 'Loading courses…' : 'Search and select a course'}
                    onFocus={() => setCourseOpen(true)}
                    onChange={(e) => {
                      setCourseQuery(e.target.value);
                      setCourse('');
                      setCourseOpen(true);
                    }}
                    className={`${fieldClass} pl-9 pr-9`}
                  />
                  <ChevronDown
                    aria-hidden
                    className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform ${courseOpen ? 'rotate-180' : ''}`}
                  />
                </div>
                {courseOpen && (
                  <ul
                    id={listId}
                    role="listbox"
                    className="absolute left-0 right-0 z-10 mt-1 max-h-52 overflow-y-auto border border-slate-200 bg-white py-1 shadow-xl"
                  >
                    {filteredCourses.length === 0 ? (
                      <li className="px-3 py-2.5 text-sm text-slate-500">
                        {coursesLoading ? 'Loading courses…' : 'No course matches your search.'}
                      </li>
                    ) : (
                      filteredCourses.map((title) => (
                        <li key={title} role="option" aria-selected={title === course}>
                          <button
                            type="button"
                            onClick={() => pickCourse(title)}
                            className={`block w-full px-3 py-2.5 text-left text-sm transition hover:bg-blue-50 ${
                              title === course ? 'bg-blue-50 font-bold text-[#1b3b8c]' : 'text-slate-700'
                            }`}
                          >
                            {title}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="lead-message" className="mb-1 block text-sm font-semibold text-slate-700">
                  Description <span className="font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="lead-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Tell us about your exam, attempt or any questions"
                  className={`${fieldClass} resize-y`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 bg-[#1b3b8c] text-sm font-bold text-white transition hover:bg-[#0c1d4a] disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
