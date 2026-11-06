import { Reveal, SectionHeading } from "@/components/home/ui";
import { ADMISSION_STEPS } from "@/content/contact";

export default function AdmissionSteps() {
  return (
    <section className="bg-surface-muted py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="How admissions work"
            title={
              <>
                From enquiry to first class in <span className="italic text-brand-mid">four steps.</span>
              </>
            }
          />
        </Reveal>

        <ol className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <span
            aria-hidden
            className="absolute left-[12.5%] right-[12.5%] top-7 hidden border-t-2 border-dashed border-brand-mid/30 lg:block"
          />
          {ADMISSION_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08} className="h-full">
              <li className="relative h-full rounded-3xl border border-slate-200 bg-white p-6 text-center transition hover:-translate-y-1 hover:shadow-lg">
                <span className="font-display relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-start text-xl font-medium text-accent ring-8 ring-surface-muted">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-brand-start">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
