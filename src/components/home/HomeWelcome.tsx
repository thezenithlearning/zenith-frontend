"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Compass, PlayCircle, Target } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLeadModal } from "@/components/lead/LeadModal";

const goals = [
  { label: "Understand my subjects", icon: BookOpen, title: "Turn confusion into clarity.", description: "Explore mentor-led courses, build your foundations and work through the concepts that need a little more attention.", href: "#courses", action: "Explore courses", points: ["Clear explanations", "Guided practice", "Feedback that helps"] },
  { label: "Prepare for an exam", icon: Target, title: "Make every practice session count.", description: "Start with a timed mock test to practise working under exam conditions, then use the explanations to guide your revision.", href: "/classwise-flash-card", action: "Try a mock test", points: ["Timed practice", "Subject-focused questions", "Answer explanations"] },
  { label: "Find the right guidance", icon: Compass, title: "You don't need all the answers yet.", description: "Tell us about your curriculum, goals and schedule. Our team will help you explore a learning pathway that fits.", href: "/contact-us", action: "Talk to our team", points: ["A personal conversation", "Your goals come first", "A clear next step"] },
];

export default function HomeWelcome() {
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  const { open } = useLeadModal();
  const goal = goals[selected];
  return <section className="relative overflow-hidden bg-brand-start text-white">
    <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-[40rem] w-[40rem] rounded-full bg-brand-mid/40 blur-3xl" />
    <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-accent">Personalised learning. Meaningful progress.</p>
        <h1 className="font-display mt-5 text-[2.7rem] leading-[1.1] tracking-tight sm:text-6xl lg:text-[4.4rem]">Your ambition.<br />Our guidance.<br /><span className="italic text-accent">A clearer way forward.</span></h1>
        <p className="mt-6 max-w-lg text-base leading-8 text-blue-100/80 sm:text-lg">Live academic mentoring that meets you where you are—and helps you take the next step with confidence.</p>
        <div className="mt-8 flex flex-col gap-3 min-[400px]:flex-row">
          <button type="button" onClick={() => open("book-demo")} className="btn-brand inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-bold">Book a free demo <ArrowRight size={18} /></button>
          <Link href="/demo-videos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"><PlayCircle size={19} />Watch a lesson</Link>
        </div>
        <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs text-blue-100/80">{["Live online classes", "Personalised support", "Regular feedback"].map(text => <li key={text} className="flex items-center gap-2"><Check size={14} className="text-accent" />{text}</li>)}</ul>
      </div>
      <div className="min-w-0 rounded-[1.75rem] border border-white/20 bg-white p-5 text-brand-start shadow-2xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-brand-mid">Find your starting point</p><h2 className="font-display mt-3 text-2xl sm:text-3xl">What brings you here?</h2>
        <div role="group" aria-label="Choose your learning goal" className="mt-6 space-y-2">
          {goals.map((item, i) => <button type="button" key={item.label} aria-pressed={selected === i} aria-controls="home-goal-detail" onClick={() => setSelected(i)} className={`flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-mid ${selected === i ? "border-brand-mid bg-brand-start-soft text-brand-mid" : "border-slate-200 hover:bg-slate-50"}`}><item.icon size={20} className="shrink-0" />{item.label}<ArrowRight size={17} className="ml-auto shrink-0" /></button>)}
        </div>
        <div id="home-goal-detail" aria-live="polite" className="mt-6 border-t border-slate-200 pt-6">
          <motion.div key={selected} initial={reduced ? false : {opacity: 0, y: 8}} animate={{opacity: 1, y: 0}} transition={{duration: .25}}>
            <h3 className="font-display text-xl sm:text-2xl">{goal.title}</h3><p className="mt-3 min-h-20 text-sm leading-6 text-slate-600">{goal.description}</p>
            <ul className="my-4 flex flex-wrap gap-2">{goal.points.map(point => <li key={point} className="rounded-full bg-surface-muted px-3 py-1.5 text-[11px] font-medium text-ink-muted">{point}</li>)}</ul>
            <Link href={goal.href} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-brand-mid underline-offset-4 hover:underline">{goal.action}<ArrowRight size={16} /></Link>
          </motion.div>
        </div>
      </div>
    </div>
  </section>;
}
