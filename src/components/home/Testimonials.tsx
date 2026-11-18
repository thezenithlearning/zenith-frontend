"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Pause, Play, Quote } from "lucide-react";
import { Reveal, SectionHeading } from "./ui";

const QUOTES = [
  { title: "Confidence with every concept.", imageAlt: "Illustration of a student studying physics", quote: "The biggest difference was the way difficult Physics concepts were broken down. I became much more confident solving unfamiliar questions.", who: "Student, IB DP", meta: "Physics HL", image: 0 },
  { title: "A clearer plan. A calmer parent.", imageAlt: "Illustration of a parent and student reviewing a learning plan", quote: "The personalised plan helped us focus on weak areas instead of simply doing more classes. The feedback was very clear.", who: "Parent", meta: "Academic Mentoring", image: 1 },
  { title: "Practice with a sense of purpose.", imageAlt: "Illustration of a student preparing for an exam", quote: "The sessions were structured, application-based and closely aligned with the exam. Practice finally felt purposeful.", who: "Student", meta: "SAT / AP Preparation", image: 2 },
  // Illustrative sample copy; replace with approved feedback before presenting it as a real testimonial.
  { title: "Room to ask every question.", imageAlt: "Illustration of a student working at her desk", quote: "Having time to ask questions made a difference. I could revisit the basics, understand my mistakes and work through the next problem more independently.", who: "Sample student story", meta: "Mathematics", image: 0, sample: true },
  { title: "Progress we can talk about.", imageAlt: "Illustration of a family reviewing a learning plan", quote: "Clear feedback gave us a better idea of what to practise between lessons. We could talk about the next step instead of only focusing on marks.", who: "Sample parent story", meta: "Learning & Feedback", image: 1, sample: true },
  { title: "A routine that feels achievable.", imageAlt: "Illustration of a student revising for an exam", quote: "Breaking revision into smaller goals helped me stay consistent. Each practice session had a focus, and I knew what to work on next.", who: "Sample student story", meta: "Exam Preparation", image: 2, sample: true },
];

export default function Testimonials() {
  const viewport = useRef<HTMLDivElement>(null);
  const firstGroup = useRef<HTMLDivElement>(null);
  const holdUntil = useRef(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = viewport.current;
    const group = firstGroup.current;
    if (!element || !group) return;
    const resize = () => {
      const width = element.clientWidth;
      const columns = width >= 1000 ? 3 : width >= 600 ? 2 : 1;
      element.style.setProperty("--story-width", `${(width - 24 * (columns - 1)) / columns}px`);
      element.scrollLeft = group.scrollWidth;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = viewport.current;
    if (!element || paused || hovered || focused || reduced) return;
    let frame = 0;
    let last = 0;
    let fractionalPixels = 0;
    let visible = false;
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .1 });
    observer.observe(element);
    const tick = (time: number) => {
      if (last && visible && !document.hidden && Date.now() > holdUntil.current) {
        fractionalPixels += Math.min(time - last, 50) * .028;
        const pixels = Math.floor(fractionalPixels);
        if (pixels > 0) {
          element.scrollLeft += pixels;
          fractionalPixels -= pixels;
        }
      }
      last = time;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [paused, hovered, focused, reduced]);

  const hold = () => { holdUntil.current = Date.now() + 5000; };
  const move = (direction: number) => {
    const element = viewport.current;
    if (!element) return;
    hold();
    const width = Number.parseFloat(element.style.getPropertyValue("--story-width"));
    element.scrollBy({ left: direction * (width + 24), behavior: reduced ? "instant" : "smooth" });
  };
  const wrap = () => {
    const element = viewport.current;
    const cycle = firstGroup.current?.scrollWidth ?? 0;
    if (!element || !cycle) return;
    // Identical neighbouring copies make either boundary visually seamless.
    if (element.scrollLeft < cycle * .5) element.scrollLeft += cycle;
    else if (element.scrollLeft >= cycle * 2) element.scrollLeft -= cycle;
  };

  return <section id="student-experience" className="bg-white py-16 sm:py-24" aria-label="Student Experience" aria-roledescription="carousel">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal><div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <SectionHeading eyebrow="Student Experience" title="Progress you can see." description="Regular assessments and feedback keep students, parents and mentors aligned." align="left" />
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" aria-label="Previous student experience" aria-controls="student-stories" onClick={() => move(-1)} className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-line text-brand-start transition hover:border-brand-mid hover:bg-brand-start-soft focus-visible:outline-2 focus-visible:outline-brand-mid"><ArrowLeft size={20} /></button>
          <button type="button" aria-label="Next student experience" aria-controls="student-stories" onClick={() => move(1)} className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-brand-start text-white transition hover:bg-brand-mid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-mid"><ArrowRight size={20} /></button>
          {!reduced && <button type="button" aria-label={paused ? "Resume automatic scrolling" : "Pause automatic scrolling"} aria-pressed={paused} onClick={() => setPaused(value => !value)} className="ml-2 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-line text-brand-start transition hover:bg-brand-start-soft focus-visible:outline-2 focus-visible:outline-brand-mid">{paused ? <Play size={18} /> : <Pause size={18} />}</button>}
        </div>
      </div></Reveal>
      <div ref={viewport} id="student-stories" tabIndex={0} aria-label="Student stories. Swipe or use the left and right arrow keys to explore." onScroll={wrap} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onPointerDown={hold} onPointerUp={hold} onWheel={hold} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }} className="mt-10 flex overflow-x-auto overscroll-x-contain pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-mid">
        {[0, 1, 2].map(copy => <div key={copy} ref={copy === 0 ? firstGroup : undefined} aria-hidden={copy !== 1 ? true : undefined} className="flex shrink-0 gap-6 pr-6">
          {QUOTES.map((item, i) => <figure key={`${copy}-${item.title}`} role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${QUOTES.length}`} className="group flex w-[var(--story-width,320px)] shrink-0 flex-col overflow-hidden rounded-3xl border border-line bg-white transition-shadow hover:shadow-lg hover:shadow-brand-start/10">
            <div className="relative aspect-[4/3] overflow-hidden bg-brand-start-soft">
              <div className="absolute top-0 h-full w-[300%]" style={{left: `-${item.image * 100}%`}}><Image src="/testimonials/learning-stories.png" alt={copy === 1 ? item.imageAlt : ""} fill unoptimized sizes="(max-width: 639px) 300vw, (max-width: 1023px) 150vw, 1200px" draggable={false} className="object-cover" /></div>
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brand-start/70 to-transparent" />
              <span className="absolute bottom-4 left-5 text-xs font-semibold tracking-wide text-white">{item.meta}</span>
              <span className="absolute right-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium text-brand-start">{item.sample ? "Illustrative story" : "Illustration"}</span>
            </div>
            <div className="flex flex-1 flex-col px-6 pb-7 pt-6 sm:px-7"><Quote aria-hidden className="h-7 w-7 text-accent" fill="currentColor" strokeWidth={1} /><h3 className="mt-4 font-display text-2xl font-medium leading-snug text-brand-start">{item.title}</h3><blockquote className="mt-4 flex-1 text-[15px] leading-7 text-ink-muted">&ldquo;{item.quote}&rdquo;</blockquote><figcaption className="mt-6 flex items-center gap-3 border-t border-line-soft pt-5"><span aria-hidden className="h-8 w-0.5 bg-accent" /><span><span className="block text-sm font-semibold text-brand-start">{item.who}</span><span className="mt-1 block text-xs text-ink-muted">{item.meta}</span></span></figcaption></div>
          </figure>)}
        </div>)}
      </div>
      <p className="mt-3 text-xs leading-5 text-ink-muted">Swipe to explore · Use the arrows to browse{!reduced && " · Hover to pause"}</p>
    </div>
  </section>;
}
