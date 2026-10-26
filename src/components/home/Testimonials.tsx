import { Star } from "lucide-react";

import { Reveal, SectionHeading } from "./ui";

const QUOTES = [
  {
    quote:
      "The biggest difference was the way difficult Physics concepts were broken down. I became much more confident solving unfamiliar questions.",
    who: "Student, IB DP",
    meta: "Physics HL",
  },
  {
    quote:
      "The personalised plan helped us focus on weak areas instead of simply doing more classes. The feedback was very clear.",
    who: "Parent",
    meta: "Academic Mentoring",
  },
  {
    quote:
      "The sessions were structured, application-based and closely aligned with the exam. Practice finally felt purposeful.",
    who: "Student",
    meta: "SAT / AP Preparation",
  },
];

export default function Testimonials() {
  return (
    <section id="student-experience" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Student Experience"
            title="Progress you can see."
            description="Regular assessments and feedback keep students, parents and mentors aligned."
            align="center"
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {QUOTES.map((item, i) => (
            <Reveal key={item.who + item.meta} delay={0.08 * i}>
              <figure className="relative flex h-full flex-col rounded-3xl border border-slate-200 bg-surface-muted p-8">
                <span
                  aria-hidden
                  className="font-display absolute right-7 top-3 text-8xl leading-none text-accent/40"
                >
                  &ldquo;
                </span>
                <div className="flex gap-0.5 text-accent" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={17} fill="currentColor" />
                  ))}
                </div>
                <blockquote className="mt-5 flex-1 text-[17px] leading-8 text-slate-700">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-slate-200 pt-5">
                  <span className="font-display flex h-11 w-11 items-center justify-center rounded-full bg-brand-start text-lg text-accent">
                    {item.who.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-brand-start">{item.who}</span>
                    <span className="block text-xs text-slate-500">{item.meta}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
