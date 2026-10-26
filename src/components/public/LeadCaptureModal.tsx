'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Lock, X } from 'lucide-react';

export interface LeadValues {
  name: string;
  email: string;
  phone: string;
}

const STORAGE_KEY = 'zenith_lead_prefill';

export const loadSavedLead = (): Partial<LeadValues> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveLead = (v: LeadValues) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* storage unavailable – ignore */
  }
};

export const validateLead = (v: LeadValues): Partial<Record<keyof LeadValues, string>> => {
  const errors: Partial<Record<keyof LeadValues, string>> = {};
  if (v.name.trim().length < 2) errors.name = 'Please enter your name';
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) errors.email = 'Enter a valid email address';
  const digits = v.phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) errors.phone = 'Enter a valid phone number';
  return errors;
};

/** The form itself – used inline (quiz result gate) and inside the modal (PYQ). */
export function LeadForm({
  cta,
  onSubmit,
  note,
}: {
  cta: string;
  onSubmit: (values: LeadValues) => Promise<void>;
  note?: string;
}) {
  const [values, setValues] = useState<LeadValues>({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadValues, string>>>({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = loadSavedLead();
    setValues((v) => ({ name: saved.name ?? v.name, email: saved.email ?? v.email, phone: saved.phone ?? v.phone }));
    firstRef.current?.focus();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateLead(values);
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      const clean = { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim() };
      await onSubmit(clean);
      saveLead(clean);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const field = (
    key: keyof LeadValues,
    label: string,
    type: string,
    placeholder: string,
    autoComplete: string,
  ) => (
    <div>
      <label htmlFor={`lead-${key}`} className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={`lead-${key}`}
        ref={key === 'name' ? firstRef : undefined}
        type={type}
        inputMode={key === 'phone' ? 'tel' : undefined}
        autoComplete={autoComplete}
        value={values[key]}
        placeholder={placeholder}
        aria-invalid={Boolean(errors[key])}
        onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:border-[#2147a8] focus:ring-2 focus:ring-[#2147a8]/20 ${
          errors[key] ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
        }`}
      />
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {field('name', 'Full name', 'text', 'Your full name', 'name')}
      {field('email', 'Email address', 'email', 'you@example.com', 'email')}
      {field('phone', 'Phone number', 'tel', '+91 98XXX XXXXX', 'tel')}

      {serverError && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2147a8] px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1b3b8c] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        {busy ? 'Please wait…' : cta}
      </button>
      <p className="text-center text-xs text-slate-400">
        {note ?? 'Our counsellors may contact you about relevant courses. We never share your details.'}
      </p>
    </form>
  );
}

export default function LeadCaptureModal({
  open,
  onClose,
  title,
  subtitle,
  cta,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  cta: string;
  onSubmit: (values: LeadValues) => Promise<void>;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="lead-modal-title" className="text-xl font-black text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <LeadForm cta={cta} onSubmit={onSubmit} />
      </div>
    </div>
  );
}
