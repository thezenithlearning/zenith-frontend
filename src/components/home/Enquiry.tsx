"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { useCreateLeadMutation } from "@/features/lead/api/leadApi";
import { BRAND } from "@/content/brand";
import { Reveal } from "./ui";

export const PROGRAM_OPTIONS = [
  "IB DP Physics",
  "IGCSE & A Level",
  "SAT & AP",
  "JEE, NEET & CBSE",
  "Not sure yet",
];

const field =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-mid focus:ring-4 focus:ring-brand-mid/15";

export default function Enquiry() {
  const pathname = usePathname();
  const [createLead, { isLoading }] = useCreateLeadMutation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", program: "", message: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const phone = form.phone.replace(/[\s()-]/g, "");
    if (form.name.trim().length < 2) return setError("Please enter the student or parent name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Please enter a valid email address.");
    if (!/^\+?\d{7,14}$/.test(phone)) return setError("Please enter a valid phone number (7–14 digits).");
    if (!form.program) return setError("Please select a program.");

    try {
      await createLead({
        name: form.name.trim(),
        email: form.email.trim(),
        phone,
        course: form.program,
        ...(form.message.trim() ? { message: form.message.trim() } : {}),
        source: "home-enquiry",
        pagePath: pathname || "/",
        pageTitle: typeof document !== "undefined" ? document.title.slice(0, 300) : undefined,
      }).unwrap();
      setDone(true);
    } catch (err) {
      const data = (err as { data?: { message?: string } })?.data;
      setError(data?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <section id="admissions" className="relative isolate overflow-hidden bg-brand-start py-20 sm:py-28">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-32 h-[30rem] w-[30rem] rounded-full bg-brand-end/30 blur-[130px]" />
        <div className="absolute -bottom-40 -left-24 h-[24rem] w-[24rem] rounded-full bg-accent/15 blur-[120px]" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20 lg:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Admissions &amp; Enquiries</p>
          <h2 className="font-display mt-4 text-4xl font-medium leading-[1.1] text-white sm:text-5xl">
            Ready to reach your <span className="italic text-accent">Zenith?</span>
          </h2>
          <p className="mt-5 max-w-md text-lg leading-8 text-blue-100/75">
            Tell us the student&apos;s curriculum, grade, target exam and goals. We&apos;ll recommend the right
            learning pathway.
          </p>
          <p className="mt-8 text-sm text-blue-100/60">
            Prefer email? Write to{" "}
            <a className="font-semibold text-white underline-offset-4 hover:underline" href={`mailto:${BRAND.admissionsEmail}`}>
              {BRAND.admissionsEmail}
            </a>
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-9">
            {done ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-brand-mid" />
                <h3 className="font-display mt-4 text-2xl font-medium text-brand-start">Thank you!</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                  We&apos;ve received your enquiry for <strong>{form.program}</strong>. Our team will get back to you
                  shortly with the recommended pathway.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
                {error && (
                  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 sm:col-span-2">
                    {error}
                  </div>
                )}
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Student / Parent name</span>
                  <input className={field} value={form.name} onChange={set("name")} maxLength={100} autoComplete="name" placeholder="Full name" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</span>
                  <input className={field} type="email" value={form.email} onChange={set("email")} autoComplete="email" placeholder="you@example.com" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Phone / WhatsApp</span>
                  <input className={field} type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" placeholder="+1 555 000 0000" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Select program</span>
                  <select className={field} value={form.program} onChange={set("program")}>
                    <option value="">Choose a program</option>
                    {PROGRAM_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-700">Grade, goals and preferred schedule</span>
                  <textarea className={`${field} min-h-28 resize-y`} value={form.message} onChange={set("message")} maxLength={2000} placeholder="e.g. Grade 11 IB, targeting a 7 in Physics HL, weekday evenings" />
                </label>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-start px-8 text-sm font-bold text-white transition hover:bg-brand-mid disabled:opacity-60 sm:col-span-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send Enquiry
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
