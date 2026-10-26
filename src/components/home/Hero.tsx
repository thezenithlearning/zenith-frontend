"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { useLeadModal } from "@/components/lead/LeadModal";

const STATS = [
  { value: "1:1", label: "Personalised guidance" },
  { value: "7+", label: "Years teaching expertise" },
  { value: "6+", label: "Curriculum pathways" },
];

const MASTERY = [
  { label: "Concept Clarity", state: "Excellent", pct: 92 },
  { label: "Problem Solving", state: "Advanced", pct: 78 },
  { label: "Exam Strategy", state: "In Progress", pct: 56 },
];

export default function Hero() {
  const { open } = useLeadModal();

  return (
    <section className="relative isolate overflow-hidden bg-brand-start text-white">
      {/* Backdrop: layered peaks, grid and a gold glow */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_-10%,#2147a8_0%,transparent_60%)]" />
        <div className="absolute -bottom-24 left-1/2 h-72 w-[140%] -translate-x-1/2 bg-[#07153a] opacity-70 [clip-path:polygon(0_100%,18%_35%,30%_62%,46%_18%,62%_58%,78%_30%,100%_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute right-[12%] top-24 h-64 w-64 rounded-full bg-accent/20 blur-[100px]" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-8 lg:pb-32 lg:pt-24">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-accent backdrop-blur"
          >
            <Sparkles size={13} /> Premium academic mentoring
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.6 }}
            className="font-display mt-6 text-[2.75rem] font-medium leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Reach your <span className="italic text-accent">Zenith.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.6 }}
            className="mt-6 max-w-xl text-lg leading-8 text-blue-100/80"
          >
            Personalised academic mentoring that turns complex concepts into
            confident problem-solving — across international curricula, school
            academics and competitive exams.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.6 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <button
              type="button"
              onClick={() => open("hero-start-journey")}
              className="group inline-flex h-12 cursor-pointer items-center gap-2 rounded-full bg-accent px-7 text-sm font-bold text-brand-start transition hover:brightness-110"
            >
              Start Your Journey
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <Link
              href="/course"
              className="inline-flex h-12 items-center rounded-full border border-white/25 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore Programs
            </Link>
          </motion.div>

          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="font-display text-4xl font-medium text-white">{stat.value}</dt>
                <dd className="mt-1 text-xs leading-5 text-blue-100/65">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Student Growth Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 26, rotate: 1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="relative mx-auto w-full max-w-md"
        >
          <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-end/40 to-accent/20 blur-2xl" />
          <div className="relative rounded-3xl border border-white/15 bg-white/[0.08] p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Student Growth Dashboard</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Active
              </span>
            </div>

            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100/55">
              Concept Mastery
            </p>
            <ul className="mt-4 space-y-5">
              {MASTERY.map((row, i) => (
                <li key={row.label}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-white/90">{row.label}</span>
                    <span className="text-xs font-semibold text-accent">{row.state}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.pct}%` }}
                      transition={{ delay: 0.5 + i * 0.15, duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-brand-end to-accent"
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span className="text-xs text-blue-100/65">Next Focus</span>
              <span className="text-sm font-semibold text-white">Weak Areas</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
