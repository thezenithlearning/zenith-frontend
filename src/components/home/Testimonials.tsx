import Image from "next/image";
import { Quote } from "lucide-react";

import { Reveal, SectionHeading } from "./ui";

const QUOTES = [
  {
    title: "Confidence with every concept.",
    imageAlt: "Illustration of a student working through physics at her desk",
    quote:
      "The biggest difference was the way difficult Physics concepts were broken down. I became much more confident solving unfamiliar questions.",
    who: "Student, IB DP",
    meta: "Physics HL",
  },
  {
    title: "A clearer plan. A calmer parent.",
    imageAlt: "Illustration of a parent and student reviewing a learning plan",
    quote:
      "The personalised plan helped us focus on weak areas instead of simply doing more classes. The feedback was very clear.",
    who: "Parent",
    meta: "Academic Mentoring",
  },
  {
    title: "Practice with a sense of purpose.",
    imageAlt: "Illustration of a student preparing for an exam",
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
            align="left"
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {QUOTES.map((item, i) => (
            <Reveal key={item.who + item.meta} delay={0.08 * i} className="h-full">
              <figure className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white transition-shadow hover:shadow-xl hover:shadow-brand-start/10">
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-start-soft">
                  <div className="absolute top-0 h-full w-[300%]" style={{ left: `-${i * 100}%` }}>
                    <Image
                      src="/testimonials/learning-stories.png"
                      alt={item.imageAlt}
                      fill
                      unoptimized
                      sizes="(max-width: 1023px) 300vw, 1200px"
                      className="object-cover"
                    />
                  </div>
                  <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-start/70 to-transparent" />
                  <span className="absolute bottom-4 left-5 text-xs font-semibold tracking-wide text-white">{item.meta}</span>
                  <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-brand-start">Illustration</span>
                </div>
                <div className="flex flex-1 flex-col px-6 pt-6 pb-7 sm:px-7">
                  <Quote aria-hidden="true" className="h-7 w-7 text-accent" fill="currentColor" strokeWidth={1} />
                  <h3 className="mt-4 font-display text-2xl font-medium leading-snug text-brand-start">{item.title}</h3>
                  <blockquote className="mt-4 flex-1 text-[15px] leading-7 text-ink-muted">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-line-soft pt-5">
                    <span aria-hidden="true" className="h-8 w-0.5 bg-accent" />
                    <span>
                      <span className="block text-sm font-semibold text-brand-start">{item.who}</span>
                      <span className="mt-1 block text-xs text-ink-muted">{item.meta}</span>
                    </span>
                  </figcaption>
                </div>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
