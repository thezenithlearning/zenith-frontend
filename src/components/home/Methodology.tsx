import { Check } from "lucide-react";

import { Reveal, SectionHeading } from "./ui";

const PRINCIPLES = ["Inquiry Based", "Conceptually Focused", "Contextualised", "Differentiated", "Informed"];

const JOURNEY = [
  { title: "Diagnostic Assessment", text: "Identify gaps" },
  { title: "Personalised Learning Plan", text: "Set the roadmap" },
  { title: "Live Classes", text: "Build understanding" },
  { title: "Practice Worksheets", text: "Apply concepts" },
  { title: "Weekly Tests", text: "Measure learning" },
  { title: "Progress Reports", text: "Track improvement" },
  { title: "Exam Success", text: "Perform with confidence" },
];

export default function Methodology() {
  return (
    <section id="methodology" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <Reveal>
              <SectionHeading
                eyebrow="Our Teaching Methodology"
                title="Concepts. Clarity. Confidence."
                description="A structured, student-centred approach that connects strong conceptual understanding with purposeful practice and measurable progress."
              />
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-10 rounded-3xl bg-brand-start p-8 text-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">How we teach</p>
                <h3 className="font-display mt-2 text-2xl font-medium">
                  Five principles behind every learning experience
                </h3>
                <ul className="mt-6 space-y-3">
                  {PRINCIPLES.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[15px] text-blue-50">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-brand-start">
                        <Check size={14} strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-mid">The Learning Journey</p>
              <h3 className="font-display mt-3 text-3xl font-medium text-brand-start sm:text-4xl">
                From diagnosis to exam success
              </h3>
            </Reveal>
            <ol className="relative mt-10 space-y-1 before:absolute before:bottom-4 before:left-[1.35rem] before:top-4 before:w-px before:bg-gradient-to-b before:from-brand-end before:to-accent">
              {JOURNEY.map((step, i) => (
                <Reveal key={step.title} delay={0.04 * i}>
                  <li className="relative flex items-center gap-5 py-3">
                    <span className="font-display relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-brand-end bg-white text-lg text-brand-mid">
                      {i + 1}
                    </span>
                    <div className="flex flex-1 flex-wrap items-baseline justify-between gap-x-4 border-b border-slate-100 pb-3">
                      <h4 className="text-[17px] font-semibold text-brand-start">{step.title}</h4>
                      <p className="text-sm text-slate-500">{step.text}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
