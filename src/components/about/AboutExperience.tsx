"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Check, Compass, Lightbulb, TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const steps = [
  { title: "Understand", icon: Compass, subtitle: "Start where you are.", text: "Your goals, your curriculum, your questions. We begin by understanding what feels difficult and what you want to achieve.", notes: ["A conversation about your goals", "Identify gaps in understanding", "Build a focused learning plan"] },
  { title: "Build", icon: Lightbulb, subtitle: "Make it click.", text: "Work through ideas with a mentor, connect concepts to examples and practise until you can explain the reasoning yourself.", notes: ["Concepts explained step by step", "Guided problem solving", "Independent practice with feedback"] },
  { title: "Grow", icon: TrendingUp, subtitle: "See yourself move forward.", text: "Regular checkpoints turn feedback into a next step. Your plan evolves as your understanding and confidence grow.", notes: ["Regular assessments", "Clear feedback for families", "A plan that adapts with you"] },
];

export default function AboutExperience() {
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const step = steps[active];
  return <>
    <section className="relative overflow-hidden bg-brand-start text-white">
      <div aria-hidden className="absolute -right-32 top-0 h-[36rem] w-[36rem] rounded-full bg-brand-mid/40 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.24em] text-accent">The people. The purpose. The progress.</p>
          <h1 className="font-display mt-6 text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">Big ambitions.<br />Personal guidance.<br /><span className="italic text-accent">Your Zenith.</span></h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-blue-100/80">Learning feels different when someone understands how you think. We help students turn difficult concepts into clarity, confidence and a way forward.</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/contact-us" className="btn-brand inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-bold">Meet your next chapter <ArrowUpRight size={18} /></Link>
            <a href="#learning-journey" className="inline-flex items-center gap-3 rounded-full border border-white/25 px-6 py-3.5 text-sm font-semibold transition hover:bg-white/10">How we help <ArrowDown size={16} /></a>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-lg py-6" aria-label="Learning grows from curiosity through clarity to confidence">
          <div aria-hidden className="absolute inset-8 rounded-full border border-white/10" />
          <div className="relative space-y-4">
            {[{ word: "Curiosity", caption: "Every great question is a beginning.", width: "w-[75%]", color: "bg-white/10" }, { word: "Clarity", caption: "A little guidance. A new perspective.", width: "w-[87%]", color: "bg-brand-mid" }, { word: "Confidence", caption: "The moment you know: I can do this.", width: "w-full", color: "bg-accent text-brand-start" }].map((item, i) => <motion.div key={item.word} initial={false} animate={reduced ? {} : { y: [0, -6, 0] }} transition={{ duration: 3, delay: i * .4, ease: "easeInOut" }} className={`relative ml-auto rounded-2xl border border-white/15 p-6 shadow-xl sm:p-8 ${item.width} ${item.color}`}>
              <span className="text-xs font-semibold opacity-70">0{i + 1} / THE LEARNING JOURNEY</span>
              <p className="font-display mt-3 text-3xl sm:text-4xl">{item.word}</p><p className="mt-2 text-sm opacity-80">{item.caption}</p>
            </motion.div>)}
          </div>
          <p className="mt-7 text-center text-xs uppercase tracking-[.2em] text-blue-100/60">Small breakthroughs. Lasting confidence.</p>
        </div>
      </div>
    </section>
    <section id="learning-journey" className="scroll-mt-24 bg-white px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-brand-mid">Built around you</p><h2 className="font-display mt-4 text-4xl leading-tight text-brand-start sm:text-5xl">A clear path.<br /><span className="italic text-brand-mid">At your pace.</span></h2></div><p className="max-w-lg text-lg leading-8 text-slate-600">Good mentoring is a partnership. Explore the three stages that guide our approach, from the first conversation to your next breakthrough.</p></div>
        <div className="mt-12 grid overflow-hidden rounded-[2rem] border border-slate-200 lg:grid-cols-[.8fr_1.2fr]">
          <div className="bg-surface-muted p-5 sm:p-8" role="group" aria-label="Explore our learning stages">
            {steps.map((item, i) => <button key={item.title} type="button" aria-pressed={active === i} aria-controls="journey-detail" onClick={() => setActive(i)} className={`mb-3 flex w-full cursor-pointer items-center gap-5 rounded-2xl p-5 text-left transition last:mb-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-mid ${active === i ? "bg-brand-start text-white shadow-lg" : "text-brand-start hover:bg-white"}`}><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${active === i ? "bg-white/10 text-accent" : "bg-white text-brand-mid"}`}><item.icon size={23} /></span><span><span className="block text-xs opacity-60">0{i + 1}</span><span className="text-xl font-semibold">{item.title}</span></span><ArrowUpRight className="ml-auto" size={20} /></button>)}
          </div>
          <div id="journey-detail" aria-live="polite" className="p-7 sm:p-12">
            <motion.div key={active} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-mid">Step 0{active + 1} / {step.title}</p><h3 className="font-display mt-5 text-3xl text-brand-start sm:text-4xl">{step.subtitle}</h3><p className="mt-5 max-w-xl leading-7 text-slate-600">{step.text}</p><ul className="mt-7 space-y-4">{step.notes.map(note => <li key={note} className="flex items-center gap-3 text-sm font-medium text-brand-start"><Check size={18} className="shrink-0 text-brand-mid" />{note}</li>)}</ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  </>;
}
