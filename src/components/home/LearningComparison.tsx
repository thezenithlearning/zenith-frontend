import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

import { Reveal } from "./ui";

const COMPARISON = [
  {
    feature: "Personal attention",
    zenith: "Personalised, one-to-one academic mentoring.",
    other: "Are lessons one-to-one or shared with a batch?",
  },
  {
    feature: "Starting point",
    zenith: "A diagnostic assessment to identify learning gaps.",
    other: "Is your starting level assessed before teaching begins?",
  },
  {
    feature: "Learning plan",
    zenith: "A plan shaped around your curriculum, pace and goals.",
    other: "Can the plan adapt to your individual needs?",
  },
  {
    feature: "Practice",
    zenith: "Targeted worksheets and exam-style application.",
    other: "Is practice tailored to the topics you find difficult?",
  },
  {
    feature: "AI & teacher support",
    zenith: "AI-supported analysis with teacher review and guidance.",
    other: "Does a teacher review and act on learning insights?",
  },
  {
    feature: "Progress updates",
    zenith: "Weekly tests, regular feedback and progress reports.",
    other: "How often will students and parents receive updates?",
  },
  {
    feature: "Exam alignment",
    zenith: "Support aligned to your curriculum and target exam.",
    other: "Does the program cover your syllabus and exam format?",
  },
];

export default function LearningComparison() {
  return (
    <section id="learning-comparison" aria-labelledby="comparison-heading" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-mid">The Zenith difference</p>
            <h2 id="comparison-heading" className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-brand-start sm:text-4xl lg:text-5xl">
              Choose the support. <span className="italic text-brand-mid">See the difference.</span>
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink-muted">
              See what Zenith provides and what to look for when comparing your learning options.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <table className="mt-12 w-full table-fixed border-separate border-spacing-0 text-left">
            <caption className="sr-only">Zenith Learning benefits and questions to ask other learning providers</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[25%] border-b border-line px-2 py-6 align-bottom text-xs font-semibold text-ink-muted sm:px-5 sm:text-sm">What matters</th>
                <th scope="col" className="w-[39%] rounded-t-2xl border-t-4 border-accent bg-brand-start px-3 py-6 align-bottom sm:px-6">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-accent sm:text-xs">Our approach</span>
                  <span className="mt-2 block font-display text-lg font-medium text-white sm:text-2xl">Zenith Learning</span>
                </th>
                <th scope="col" className="w-[36%] border-b border-line px-3 py-6 align-bottom sm:px-6">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-ink-muted sm:text-xs">What to check</span>
                  <span className="mt-2 block font-display text-lg font-medium text-brand-start sm:text-2xl">Other options</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, index) => (
                <tr key={row.feature}>
                  <th scope="row" className="border-b border-line px-2 py-5 align-top text-xs font-semibold leading-5 text-brand-start sm:px-5 sm:py-6 sm:text-sm sm:leading-6">{row.feature}</th>
                  <td className={"border-b border-white/10 bg-brand-start px-3 py-5 align-top sm:px-6 sm:py-6 " + (index === COMPARISON.length - 1 ? "rounded-b-2xl" : "")}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                      <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-accent sm:mt-1" strokeWidth={2.5} />
                      <span className="text-xs leading-5 text-blue-50 sm:text-sm sm:leading-6">{row.zenith}</span>
                    </div>
                  </td>
                  <td className="border-b border-line px-3 py-5 align-top text-xs leading-5 text-ink-muted sm:px-6 sm:py-6 sm:text-sm sm:leading-6">{row.other}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-7 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <p className="max-w-lg text-xs leading-5 text-ink-muted">Other providers’ offerings vary. Use these questions to compare the support included in each program.</p>
            <Link href="/contact-us" className="inline-flex min-h-12 shrink-0 items-center gap-3 rounded-full bg-accent px-6 py-3 text-sm font-bold text-brand-start transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-mid">
              Find your learning plan <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
