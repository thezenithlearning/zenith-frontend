import Link from "next/link";
import { ArrowUpRight, BookOpen, ClipboardCheck, FileText, PlayCircle } from "lucide-react";
import { Reveal, SectionHeading } from "./ui";

const resources = [
  { title: "Watch a lesson", description: "Get a feel for a topic with a short demo video.", href: "/demo-videos", icon: PlayCircle, tag: "Explore" },
  { title: "Practise at your pace", description: "Build understanding with untimed MCQ practice.", href: "/mcqs", icon: BookOpen, tag: "Learn" },
  { title: "Test your preparation", description: "Try a timed mock test and review your answers.", href: "/classwise-flash-card", icon: ClipboardCheck, tag: "Challenge" },
  { title: "Explore practice papers", description: "Find papers to support your next revision session.", href: "/pyqs", icon: FileText, tag: "Revise" },
];

export default function HomeResources() {
  return <section id="free-resources" className="bg-white py-16 sm:py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <Reveal><SectionHeading eyebrow="Start exploring, for free" title={<>A small step today.<br /><span className="italic text-brand-mid">More confidence tomorrow.</span></>} description="Not ready to choose a course? Explore a lesson, try a few questions or see where your preparation stands." /></Reveal>
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{resources.map((resource, i) => <Reveal key={resource.href} delay={i * .06} className="h-full"><Link href={resource.href} className="group flex h-full flex-col rounded-2xl border border-line bg-surface-muted p-6 transition duration-200 hover:-translate-y-1 hover:border-brand-mid/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-mid motion-reduce:transform-none"><div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-mid"><resource.icon size={23} /></span><span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">{resource.tag}</span></div><h3 className="mt-6 text-lg font-semibold text-brand-start">{resource.title}</h3><p className="mt-3 flex-1 text-sm leading-6 text-ink-muted">{resource.description}</p><span className="mt-6 flex items-center gap-2 text-sm font-bold text-brand-mid">Get started <ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" /></span></Link></Reveal>)}</div>
  </div></section>;
}
