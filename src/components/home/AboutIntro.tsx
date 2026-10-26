import { BarChart3, BrainCircuit, Target } from "lucide-react";

import { Reveal, SectionHeading } from "./ui";

const PILLARS = [
  {
    icon: Target,
    title: "Expert teaching",
    text: "Conceptual teaching with curriculum-specific strategy, from first principles to exam-level problems.",
  },
  {
    icon: BrainCircuit,
    title: "Personalised learning",
    text: "Targeted practice that follows the student's current level, weak areas and learning objectives.",
  },
  {
    icon: BarChart3,
    title: "Intelligent analysis",
    text: "AI-supported insights that identify gaps, personalise practice and keep progress measurable.",
  },
];

export default function AboutIntro() {
  return (
    <section id="about" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow="About Zenith Learning"
              title="Personalised academic mentoring with clarity, strategy and confidence."
              description="Zenith Learning helps students turn complex concepts into confident problem-solving through personalised guidance, live classes, structured practice and continuous progress tracking."
            />
          </Reveal>

          <div>
            <Reveal delay={0.05}>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-dark">
                What makes Zenith different
              </p>
              <p className="font-display mt-3 text-2xl font-medium leading-snug text-brand-start sm:text-3xl">
                Expert teaching, personalised learning and intelligent analysis.
              </p>
            </Reveal>
            <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
              {PILLARS.map((pillar, i) => (
                <Reveal key={pillar.title} delay={0.08 * (i + 1)}>
                  <li className="flex gap-5 py-6">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-start-soft text-brand-mid">
                      <pillar.icon size={22} />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-brand-start">{pillar.title}</h3>
                      <p className="mt-1 text-[15px] leading-7 text-slate-600">{pillar.text}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
            <p className="mt-6 text-[15px] leading-7 text-slate-600">
              We combine conceptual teaching, curriculum-specific strategy, targeted practice and
              AI-supported insights to identify gaps, personalise learning and keep students moving
              towards their goals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
