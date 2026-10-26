import { ArrowRight, LineChart, Route, ScanSearch, Sparkles, Target } from "lucide-react";

import { Reveal, SectionHeading } from "./ui";

const CARDS = [
  {
    icon: ScanSearch,
    tag: "01 — AI Diagnostic Analysis",
    title: "Understand the gaps",
    text: "Analyse assessment performance to identify topic-level strengths, weaknesses and recurring mistakes.",
  },
  {
    icon: Target,
    tag: "02 — AI-Powered Practice",
    title: "Practise with purpose",
    text: "Targeted practice can be aligned to the student's current level, weak areas and learning objectives.",
  },
  {
    icon: LineChart,
    tag: "03 — Smart Progress Tracking",
    title: "See the progress",
    text: "Performance data helps identify trends, highlight improvement and flag areas that need additional support.",
  },
  {
    icon: Route,
    tag: "04 — Personalised Learning Path",
    title: "Adapt the strategy",
    text: "The learning sequence and practice difficulty can be adjusted according to student performance.",
  },
];

const FLOW = [
  "Student Assessment",
  "AI Analysis",
  "Learning Gap Detection",
  "Personalised Practice",
  "Teacher Review",
  "Progress",
];

export default function AILearning() {
  return (
    <section id="ai-learning" className="relative isolate overflow-hidden bg-brand-start py-20 text-white sm:py-28">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-brand-end/25 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-[24rem] w-[24rem] rounded-full bg-accent/15 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
            <Sparkles size={13} /> AI-Enhanced Learning
          </p>
          <h2 className="font-display mt-5 max-w-3xl text-3xl font-medium leading-[1.15] sm:text-4xl lg:text-5xl">
            Human expertise. AI intelligence. <span className="italic text-accent">Better learning.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-100/75">
            Zenith combines expert teaching with AI-supported analysis to identify learning gaps, personalise
            practice and track progress more precisely.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {CARDS.map((card, i) => (
            <Reveal key={card.tag} delay={0.07 * i}>
              <article className="group h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur transition hover:border-accent/50 hover:bg-white/[0.07]">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">{card.tag}</p>
                  <card.icon className="text-blue-200/70 transition group-hover:text-accent" size={22} />
                </div>
                <h3 className="font-display mt-5 text-2xl font-medium">{card.title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-blue-100/70">{card.text}</p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-10">
            <p className="font-display text-2xl font-medium sm:text-3xl">
              AI supports the teacher. The teacher guides the student.
            </p>
            <p className="mt-2 text-blue-100/70">
              Technology identifies the pattern. The teacher understands the student. Zenith combines both.
            </p>
            <ol className="mt-8 flex flex-wrap items-center gap-y-3">
              {FLOW.map((item, i) => (
                <li key={item} className="flex items-center">
                  <span
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                      i === FLOW.length - 1
                        ? "border-accent bg-accent text-brand-start"
                        : "border-white/20 bg-white/5 text-white"
                    }`}
                  >
                    {item}
                  </span>
                  {i < FLOW.length - 1 && <ArrowRight className="mx-2 text-accent/80" size={16} />}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
