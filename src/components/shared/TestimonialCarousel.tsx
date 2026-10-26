"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

import type { ITestimonial } from "@/features/course/api/courseApi";

const circle = (size: number): React.CSSProperties => ({
  width: size,
  height: size,
  borderRadius: "50%",
});

const AVATAR_TONES = [
  ["var(--color-brand-start)", "var(--color-brand-end)"],
  ["#0f6b52", "#3fae6b"],
  ["#1a7a3c", "#8bc34a"],
];

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export default function TestimonialCarousel({
  testimonials,
  title = "Aspirant success stories",
  subtitle = "Preparation becomes clearer when every week has a purpose.",
}: {
  testimonials: ITestimonial[];
  title?: string;
  subtitle?: string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const items = testimonials;

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;

    track.scrollTo({
      left: card.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });
  };

  const goTo = (index: number) => {
    const next = (index + items.length) % items.length;
    setActiveIndex(next);
    scrollToIndex(next);
  };

  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % items.length;
        scrollToIndex(next);
        return next;
      });
    }, 4500);

    return () => window.clearInterval(interval);
  }, [isPaused, items.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const handleScroll = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const children = Array.from(track.children) as HTMLElement[];
        let closest = 0;
        let smallestDiff = Infinity;

        children.forEach((child, index) => {
          const diff = Math.abs(child.offsetLeft - track.scrollLeft);
          if (diff < smallestDiff) {
            smallestDiff = diff;
            closest = index;
          }
        });

        setActiveIndex(closest);
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", handleScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-white py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 blur-3xl"
        style={{
          ...circle(340),
          background:
            "radial-gradient(circle, var(--color-brand-end) 0%, transparent 70%)",
          opacity: 0.14,
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <span
              className="mb-3 block h-1 w-10"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, var(--color-brand-start), var(--color-brand-end))",
              }}
            />
            <span className="text-xs font-bold uppercase tracking-[.18em] text-brand-mid">
              Testimonials
            </span>
            <h2 className="mt-3 max-w-xl text-3xl font-black text-slate-900 sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 max-w-lg text-slate-500">{subtitle}</p>
          </div>

          {items.length > 1 && (
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <button
                id="testimonial-carousel-previous-button"
                type="button"
                aria-label="Previous testimonial"
                onClick={() => goTo(activeIndex - 1)}
                className="flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-500 transition-colors hover:border-brand-mid hover:text-brand-mid"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                id="testimonial-carousel-next-button"
                type="button"
                aria-label="Next testimonial"
                onClick={() => goTo(activeIndex + 1)}
                className="flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-500 transition-colors hover:border-brand-mid hover:text-brand-mid"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.div>

        <div
          ref={trackRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="hide-scrollbar mt-10 flex gap-5 overflow-x-auto pb-2"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {items.map((story, index) => {
            const [from, to] = AVATAR_TONES[index % AVATAR_TONES.length];

            return (
              <motion.article
                key={`${story.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
                style={{ scrollSnapAlign: "start" }}
                className="relative flex w-[85%] shrink-0 flex-col border border-slate-200 bg-[#fbfdf9] p-7 transition-shadow hover:shadow-lg hover:shadow-slate-900/5 sm:w-[46%] lg:w-[31.5%]"
              >
                <Quote
                  className="absolute right-6 top-6 h-8 w-8 text-brand-mid/10"
                  fill="currentColor"
                />

                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: story.rating ?? 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>

                <p className="relative mt-5 flex-1 leading-7 text-slate-700">
                  &ldquo;{story.content}&rdquo;
                </p>

                <div className="mt-6 flex items-center gap-3 border-t border-slate-200 pt-4">
                  <span
                    className="flex shrink-0 items-center justify-center text-sm font-bold text-white"
                    style={{
                      ...circle(42),
                      backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
                    }}
                  >
                    {initialsOf(story.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-900">
                      {story.name}
                    </p>
                    <p className="truncate text-sm text-brand-mid">
                      {story.role}
                      {story.company ? ` · ${story.company}` : ""}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {items.length > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {items.map((story, index) => (
              <button
                id={`testimonial-carousel-dot-${index}-button`}
                key={`${story.name}-${index}`}
                type="button"
                aria-label={`Go to testimonial ${index + 1}`}
                onClick={() => goTo(index)}
                className="flex h-6 items-center justify-center px-1"
              >
                <span
                  className="h-1.5 transition-all"
                  style={{
                    width: activeIndex === index ? 24 : 8,
                    borderRadius: "9999px",
                    background:
                      activeIndex === index
                        ? "var(--color-brand-mid)"
                        : "var(--color-line)",
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
