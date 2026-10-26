import { Reveal, SectionHeading } from "./ui";

const STEPS = [
  {
    n: "01",
    title: "Diagnose",
    text: "Find knowledge gaps, misconceptions and exam-specific weaknesses before building the study plan.",
  },
  {
    n: "02",
    title: "Build",
    text: "Strengthen concepts using clear explanations, worked examples and curriculum-aligned learning.",
  },
  {
    n: "03",
    title: "Apply",
    text: "Move from guided practice to challenging application, analysis and real exam-style problems.",
  },
];

export default function Method() {
  return (
    <section className="relative overflow-hidden bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="The Zenith Method"
            title={
              <>
                Understand. Apply. <span className="italic text-brand-mid">Master.</span>
              </>
            }
            description="A structured learning system built around conceptual depth, purposeful practice and continuous feedback."
          />
        </Reveal>

        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          <div
            aria-hidden
            className="absolute left-[16%] right-[16%] top-9 hidden h-px bg-gradient-to-r from-transparent via-brand-end/40 to-transparent md:block"
          />
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={0.1 * i}>
              <article className="group relative h-full rounded-3xl border border-slate-200 bg-white p-8 transition duration-300 hover:-translate-y-1 hover:border-brand-end/40 hover:shadow-[0_24px_50px_-24px_rgba(33,71,168,0.4)]">
                <span className="font-display flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-brand-start text-2xl text-accent ring-8 ring-surface-muted transition group-hover:bg-brand-mid">
                  {step.n}
                </span>
                <h3 className="font-display mt-6 text-2xl font-medium text-brand-start">{step.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-slate-600">{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
