"use client";

import Link from "next/link";
import { ArrowUpRight, Atom, BookOpenCheck, GraduationCap, Rocket } from "lucide-react";

import { Reveal, SectionHeading } from "./ui";

const PROGRAMS = [
  {
    tag: "International",
    title: "IB DP Physics",
    text: "HL/SL conceptual learning, application, exam practice and IA support.",
    icon: Atom,
    href: "/course/ib-dp-physics",
  },
  {
    tag: "Cambridge",
    title: "IGCSE & A Level",
    text: "Curriculum-focused teaching with structured problem solving.",
    icon: BookOpenCheck,
    href: "/course/igcse-a-level",
  },
  {
    tag: "College Prep",
    title: "SAT & AP",
    text: "Exam strategy, timed practice and targeted performance improvement.",
    icon: GraduationCap,
    href: "/course/sat-ap",
  },
  {
    tag: "Competitive",
    title: "JEE • NEET • CBSE",
    text: "Strong fundamentals followed by systematic exam-level practice.",
    icon: Rocket,
    href: "/course/jee-neet-cbse",
  },
];

export default function Programs() {
  return (
    <section id="programs" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <SectionHeading
              eyebrow="Programs"
              title="One platform. Multiple pathways."
              description="Choose the academic pathway that matches the student's curriculum and long-term goals."
            />
          </Reveal>
          <Link
            href="/course"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-start/20 px-6 py-3 text-sm font-semibold text-brand-start transition hover:bg-brand-start hover:text-white"
          >
            View all programs <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((program, i) => (
            <Reveal key={program.title} delay={0.07 * i}>
              <Link
                href={program.href}
                className="group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1.5 hover:border-transparent hover:bg-brand-start hover:shadow-[0_28px_60px_-24px_rgba(12,29,74,0.6)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-start-soft text-brand-mid transition group-hover:bg-white/10 group-hover:text-accent">
                  <program.icon size={22} />
                </span>
                <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-dark transition group-hover:text-accent">
                  {program.tag}
                </p>
                <h3 className="font-display mt-2 text-2xl font-medium text-brand-start transition group-hover:text-white">
                  {program.title}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-slate-600 transition group-hover:text-blue-100/80">
                  {program.text}
                </p>
                <ArrowUpRight
                  className="mt-auto self-end text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  size={22}
                />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
