import Image from "next/image";
import { Compass, Eye, Heart } from "lucide-react";

import { Reveal, SectionHeading } from "./ui";

const PILLARS = [
  {
    icon: Compass,
    title: "Our mission",
    text: "To help every student turn complex concepts into confident problem-solving through personalised, expert mentoring.",
  },
  {
    icon: Eye,
    title: "Our vision",
    text: "A world where any motivated learner, anywhere, can reach their academic summit with the right guidance.",
  },
  {
    icon: Heart,
    title: "Our values",
    text: "Clarity over complexity, rigour with care, and honest progress that students and parents can actually see.",
  },
];

const STATS = [
  ["1:1", "Personalised guidance"],
  ["7+", "Years teaching expertise"],
  ["6+", "Curriculum pathways"],
];

const PATHWAYS = ["IB DP Physics", "IGCSE & A Level", "SAT & AP", "JEE · NEET · CBSE"];

export default function CompanyStory() {
  return (
    <section className="relative overflow-hidden bg-surface-muted py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative aspect-[8/9] overflow-hidden rounded-[2rem] shadow-2xl shadow-brand-start/20 ring-1 ring-brand-start/10">
              <Image
                src="/about-company.svg"
                alt="A learning path climbing to a summit"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
                priority={false}
              />
            </div>
            <div className="absolute -bottom-5 left-4 right-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:left-auto sm:right-[-1rem] sm:max-w-[16rem]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft font-display text-lg font-medium text-accent-dark">
                Z
              </span>
              <p className="text-xs leading-5 text-slate-600">
                <span className="block text-sm font-semibold text-brand-start">Reach your Zenith.</span>
                Online mentoring for students worldwide.
              </p>
            </div>
          </Reveal>

          <div className="mt-6 lg:mt-0">
            <Reveal>
              <SectionHeading
                eyebrow="Who we are"
                title={
                  <>
                    A premium academic mentoring company built around{" "}
                    <span className="italic text-brand-mid">the student.</span>
                  </>
                }
              />
              <div className="mt-6 space-y-4 text-[15px] leading-7 text-slate-600 sm:text-base">
                <p>
                  Zenith Learning is an online academic mentoring company for students who want more
                  than routine tuition. We start by diagnosing where a learner is, then build a
                  structured path to where they want to be.
                </p>
                <p>
                  Our mentors combine conceptual teaching, guided problem solving and independent
                  practice, supported by AI-assisted analysis that keeps progress measurable for
                  students and parents.
                </p>
              </div>
              <ul className="mt-6 flex flex-wrap gap-2">
                {PATHWAYS.map((pathway) => (
                  <li
                    key={pathway}
                    className="rounded-full border border-brand-mid/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-brand-start"
                  >
                    {pathway}
                  </li>
                ))}
              </ul>
            </Reveal>

            <dl className="mt-8 grid grid-cols-3 gap-3 border-y border-slate-200 py-6 sm:gap-6">
              {STATS.map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-3xl font-medium text-brand-mid sm:text-4xl">{value}</dt>
                  <dd className="mt-1 text-[11px] leading-4 text-slate-500 sm:text-xs sm:leading-5">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:mt-20 md:grid-cols-3 lg:gap-6">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.title} delay={i * 0.08} className="h-full">
              <div className="h-full rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg sm:p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-start text-accent">
                  <pillar.icon size={22} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-brand-start">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
