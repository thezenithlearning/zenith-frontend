import type { LucideIcon } from "lucide-react";
import { Eye, Globe2, HeartHandshake, Infinity as InfinityIcon, MessageCircle, Quote, Route, Target } from "lucide-react";

import { Reveal } from "@/components/home/ui";

/* ---------------------------------------------------------------- content */

const STATS = [
  { value: "2017", label: "Teaching since" },
  { value: "1:1", label: "Personalised guidance" },
  { value: "6+", label: "Curriculum pathways" },
  { value: "Global", label: "Online and worldwide", icon: Globe2 },
];

const VALUES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: HeartHandshake, title: "Understood first", text: "Every child's learning style is studied" },
  { icon: Route, title: "Custom-made", text: "One path per child, never one for all" },
  { icon: MessageCircle, title: "Patient and clear", text: "Communication that builds confidence" },
  { icon: InfinityIcon, title: "Built to last", text: "Knowledge that stays for life" },
];

type Tag = "yamini" | "rishabh" | "together" | "mission";
const TAG_STYLE: Record<Tag, { label: string; className: string }> = {
  yamini: { label: "Yamini", className: "bg-brand-start-soft text-brand-mid" },
  rishabh: { label: "Rishabh", className: "bg-accent-soft text-accent-dark" },
  together: { label: "Together", className: "border border-line bg-white text-ink-muted" },
  mission: { label: "Mission", className: "bg-accent text-brand-start" },
};

const MILESTONES: { eyebrow: string; title: string; lines: { tag: Tag; text: string }[]; peak?: boolean }[] = [
  {
    eyebrow: "Milestone 1 · Childhood",
    title: "The childhood sparks",
    lines: [
      { tag: "yamini", text: "Grade 4 games of “teacher-teacher”." },
      { tag: "rishabh", text: "Grade 5, helping his mother teach tuitions." },
    ],
  },
  {
    eyebrow: "Milestone 2 · 2017",
    title: "Stepping into the classroom",
    lines: [{ tag: "together", text: "Both became full-time educators and saw rigid methods leave learners behind." }],
  },
  {
    eyebrow: "Milestone 3 · The evolution",
    title: "Conceiving Sustainable Literacy",
    lines: [{ tag: "together", text: "The ladder-by-ladder method: assess, then build a personal path." }],
  },
  {
    eyebrow: "Milestone 4 · Today and beyond",
    title: "Reaching the Zenith",
    lines: [{ tag: "mission", text: "Every student climbs to their personal peak." }],
    peak: true,
  },
];

const FOUNDERS: {
  name: string;
  initial: string;
  role: string;
  headline: string;
  tone: string;
  sections: { title: string; text: string; quote?: boolean }[];
}[] = [
  {
    name: "Yamini",
    initial: "Y",
    role: "Co-founder, educator, and mentor",
    headline: "Helping every child feel understood",
    tone: "bg-brand-start-soft text-brand-mid",
    sections: [
      {
        title: "Where it began",
        text: "As a Grade 4 student, her favourite pastime was playing “teacher-teacher” after school, a game that planted the dream of building her own institute.",
      },
      {
        title: "In the classroom",
        text: "Teaching full-time since 2017, she has dedicated herself to understanding the unique learning style of every student she meets.",
      },
      {
        title: "What she believes",
        text: "“When a child feels truly understood, learning stops being a struggle and becomes a superpower.”",
        quote: true,
      },
    ],
  },
  {
    name: "Rishabh",
    initial: "R",
    role: "Co-founder, educator, and content strategist",
    headline: "A storyteller who builds learning paths",
    tone: "bg-accent-soft text-accent-dark",
    sections: [
      {
        title: "Where it began",
        text: "From Grade 5 he spent afternoons writing and helping his mother teach neighbourhood tuitions, learning how patience and clear communication transform a student's confidence.",
      },
      {
        title: "In the classroom",
        text: "Entering education full-time in 2017, he combined his passion for storytelling with structured mentorship.",
      },
      {
        title: "At Zenith Learning",
        text: "He crafts custom learning paths that meet each child where they are and guide them, ladder by ladder, toward their Zenith.",
      },
    ],
  },
];

/* --------------------------------------------------------------- pieces */

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-mid ${className}`}>
      <span aria-hidden className="h-px w-8 bg-current opacity-60" />
      {children}
    </p>
  );
}

function LadderArt() {
  return (
    <svg viewBox="0 0 220 170" role="img" aria-labelledby="ladder-title" className="mx-auto w-full max-w-sm">
      <title id="ladder-title">A ladder rising from a stack of books to a star</title>
      <circle cx="110" cy="88" r="78" className="fill-brand-end-soft" />
      <rect x="48" y="138" width="84" height="12" rx="3" className="fill-brand-start-soft stroke-brand-mid" />
      <rect x="56" y="126" width="72" height="12" rx="3" className="fill-white stroke-brand-start" />
      <rect x="52" y="114" width="64" height="12" rx="3" className="fill-accent-soft stroke-accent-dark" />
      <g className="stroke-brand-start" strokeWidth="2.5" strokeLinecap="round" fill="none">
        <line x1="92" y1="114" x2="136" y2="34" />
        <line x1="112" y1="114" x2="156" y2="34" />
        <line x1="100" y1="100" x2="120" y2="100" />
        <line x1="109" y1="84" x2="129" y2="84" />
        <line x1="118" y1="68" x2="138" y2="68" />
        <line x1="127" y1="52" x2="147" y2="52" />
      </g>
      <path
        d="M160 6l4.5 9.5 10.5 1.3-7.7 7.2 2 10.3-9.3-5.1-9.3 5.1 2-10.3-7.7-7.2 10.5-1.3z"
        className="fill-accent stroke-accent-dark"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ROAD = "M0 172 C90 172,110 150,180 146 S290 118,345 110 S450 90,500 78 S550 50,565 34";
const MARKERS = [
  { x: 70, base: 160, label: "Childhood" },
  { x: 208, base: 136, label: "2017" },
  { x: 348, base: 102, label: "The idea" },
  { x: 500, base: 70, label: "Zenith" },
];

function RoadMap() {
  return (
    <svg viewBox="0 0 640 190" role="img" aria-labelledby="road-title road-desc" className="mt-8 w-full">
      <title id="road-title">Road map of four milestones</title>
      <desc id="road-desc">A road climbs from childhood, past 2017 and the idea, to a peak labelled Zenith.</desc>
      <polygon points="440,186 565,30 640,124 640,186" className="fill-brand-start-soft stroke-brand-mid/30" />
      <polygon points="565,30 545,55 558,50 566,60 576,50 585,55" className="fill-white stroke-brand-mid/30" />
      <path d={ROAD} fill="none" className="stroke-brand-start" strokeWidth="14" strokeLinecap="round" />
      <path d={ROAD} fill="none" className="stroke-accent" strokeWidth="1.5" strokeDasharray="7 7" />
      <line x1="565" y1="32" x2="565" y2="8" className="stroke-brand-start" strokeWidth="1.5" />
      <polygon points="565,8 583,14 565,20" className="fill-accent stroke-accent-dark" />
      {MARKERS.map((m, i) => {
        const last = i === MARKERS.length - 1;
        return (
          <g key={m.label}>
            <path
              d={`M${m.x - 13} ${m.base}V${m.base - 22}a13 13 0 0 1 26 0V${m.base}Z`}
              className={last ? "fill-accent stroke-accent-dark" : "fill-white stroke-brand-start"}
            />
            <text x={m.x} y={m.base - 11} textAnchor="middle" fontSize="12" fontWeight="600" className="fill-brand-start">
              {i + 1}
            </text>
            <text x={m.x} y={m.base - 44} textAnchor="middle" fontSize="12" className={last ? "fill-accent-dark font-semibold" : "fill-ink-muted"}>
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ----------------------------------------------------------------- page */

export default function AboutStory() {
  return (
    <>
      {/* ---------- Story intro ---------- */}
      <section className="relative overflow-hidden bg-surface-muted">
        <div aria-hidden className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-brand-start-soft blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-12 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <Eyebrow>About · Our story</Eyebrow>
            <h1 className="font-display mt-5 text-5xl font-medium leading-[1.05] tracking-tight text-brand-start sm:text-6xl">Our story</h1>
            <p className="font-display mt-4 text-2xl italic text-brand-mid sm:text-3xl">Every child&apos;s path. Every child&apos;s pace.</p>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink-muted">
              Zenith Learning is built on Sustainable Literacy, a personalised education model founded by two educators, Yamini and Rishabh. We assess where each child
              stands today and build a custom path forward, so learning lasts beyond the next exam.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <LadderArt />
          </Reveal>
        </div>

        {/* ---------- Proof numbers ---------- */}
        <div className="relative mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20">
          <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05}>
                <div className="h-full rounded-2xl border border-line bg-white p-5 shadow-sm">
                  <dt className="text-xs font-semibold text-ink-muted">{s.label}</dt>
                  <dd className="font-display mt-1 text-3xl font-medium text-brand-start">{s.value}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------- Values ---------- */}
      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <Eyebrow>What we stand for</Eyebrow>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.06}>
                <div className="group h-full rounded-2xl border border-line p-6 transition hover:-translate-y-1 hover:border-brand-mid/30 hover:shadow-lg">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-start-soft text-brand-mid transition group-hover:bg-brand-start group-hover:text-accent">
                    <Icon aria-hidden className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-brand-start">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Vision & mission ---------- */}
      <section className="bg-white px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
          {[
            { icon: Eye, title: "Vision", text: "Every student we mentor reaches their highest potential, their personal Zenith.", dark: true },
            { icon: Target, title: "Mission", text: "Education that builds deep confidence, independent thinking, and sustainable academic growth.", dark: false },
          ].map(({ icon: Icon, title, text, dark }, i) => (
            <Reveal key={title} delay={i * 0.08} className="h-full">
              <article
                className={`relative h-full overflow-hidden rounded-3xl p-8 sm:p-10 ${dark ? "bg-brand-start text-white" : "border border-accent/40 bg-accent-soft text-brand-start"}`}
              >
                <Icon aria-hidden className={`absolute -right-6 -top-6 h-40 w-40 ${dark ? "text-white/5" : "text-accent/15"}`} />
                <span className={`flex h-12 w-12 items-center justify-center rounded-full ${dark ? "bg-white/10 text-accent" : "bg-white text-accent-dark"}`}>
                  <Icon aria-hidden className="h-6 w-6" />
                </span>
                <h3 className="font-display mt-6 text-3xl font-medium">{title}</h3>
                <p className={`mt-3 max-w-md text-lg leading-8 ${dark ? "text-blue-100/80" : "text-ink-muted"}`}>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- Journey ---------- */}
      <section className="bg-surface-muted px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <Eyebrow>Our journey</Eyebrow>
            <h2 className="font-display mt-4 text-3xl font-medium leading-tight text-brand-start sm:text-4xl lg:text-[2.75rem]">
              Four milestones on the road to <span className="italic text-brand-mid">Zenith</span>
            </h2>
            <RoadMap />
          </Reveal>

          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MILESTONES.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.06} className="h-full">
                <li className={`h-full rounded-2xl bg-white p-6 ${m.peak ? "border-2 border-accent shadow-lg shadow-accent/15" : "border border-line"}`}>
                  <p className="text-xs font-semibold text-ink-muted">{m.eyebrow}</p>
                  <h3 className="mt-2 text-lg font-semibold text-brand-start">{m.title}</h3>
                  <div className="mt-3 space-y-2.5">
                    {m.lines.map(line => (
                      <p key={line.text} className="text-sm leading-6 text-ink-muted">
                        <span className={`mr-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${TAG_STYLE[line.tag].className}`}>
                          {TAG_STYLE[line.tag].label}
                        </span>
                        {line.text}
                      </p>
                    ))}
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>

          <Reveal>
            <figure className="mt-8 flex gap-4 rounded-3xl bg-brand-start p-7 text-white sm:p-10">
              <Quote aria-hidden className="h-8 w-8 shrink-0 text-accent" />
              <blockquote className="font-display text-xl leading-relaxed sm:text-2xl">
                We meet each child exactly where they stand and help them climb, ladder by ladder.
              </blockquote>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ---------- Founders ---------- */}
      <section className="bg-white px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <Eyebrow>About · Our founders</Eyebrow>
            <h2 className="font-display mt-4 text-3xl font-medium leading-tight text-brand-start sm:text-4xl lg:text-[2.75rem]">
              Meet our <span className="italic text-brand-mid">founders</span>
            </h2>
          </Reveal>

          <div className="mt-10 space-y-6">
            {FOUNDERS.map((f, i) => (
              <Reveal key={f.name} delay={i * 0.08}>
                <article className="grid gap-8 rounded-3xl border border-line p-6 shadow-sm sm:p-8 md:grid-cols-[13rem_minmax(0,1fr)]">
                  <div>
                    <div className={`flex aspect-[4/5] w-full max-w-52 items-center justify-center rounded-2xl ${f.tone}`}>
                      <span aria-hidden className="font-display text-7xl font-medium">
                        {f.initial}
                      </span>
                    </div>
                    <p className="mt-4 text-lg font-semibold text-brand-start">{f.name}</p>
                    <p className="text-sm text-ink-muted">{f.role}</p>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-medium text-brand-start sm:text-3xl">
                      {f.name}: <span className="italic text-brand-mid">{f.headline.charAt(0).toLowerCase() + f.headline.slice(1)}</span>
                    </h3>
                    <dl className="mt-5 space-y-5">
                      {f.sections.map(s => (
                        <div key={s.title}>
                          <dt className="text-xs font-bold uppercase tracking-[0.16em] text-brand-mid">{s.title}</dt>
                          <dd
                            className={
                              s.quote
                                ? "font-display mt-1.5 border-l-4 border-accent pl-4 text-lg italic leading-relaxed text-brand-start"
                                : "mt-1.5 leading-7 text-ink-muted"
                            }
                          >
                            {s.text}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
