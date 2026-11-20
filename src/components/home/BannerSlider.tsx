"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Slide = { src: string; alt: string; href?: string };

/** Replace these files in /public/banners (or edit the list) to change the home slider. */
const SLIDES: Slide[] = [
  { src: "https://media.thezenithlearning.com/uploads/o-as-a-levels-hero-banner-fixed--9b37d950-ff32-4ca8-a36c-5dcd13239161.png", alt: "O Level and AS/A Level tuition", href: "/course" },
  { src: "https://media.thezenithlearning.com/uploads/english-that-builds-insight--51d40800-4bdd-488a-934e-1389defd27d7.png", alt: "English that builds insight", href: "/course" },
  { src: "https://media.thezenithlearning.com/uploads/improve-american-curriculum-hero-banner-proportions-corrected--ce7354a3-6e45-46bc-abcb-941b7db20e78.png", alt: "American curriculum tuition", href: "/course" },
  { src: "https://media.thezenithlearning.com/uploads/igcse-expert-tuition-banner--7501c2a9-7413-42cc-b8f3-7de3df8a8cef.png", alt: "IGCSE expert tuition", href: "/course" },
  { src: "https://media.thezenithlearning.com/uploads/o-as-a-levels-hero-banner-3840x960--66157e0e-a7a6-43c0-9459-4aec45ffd2c7.png", alt: "O Level and AS/A Level tuition", href: "/course" },
  { src: "https://media.thezenithlearning.com/uploads/tailored-learning-brighter-futures--26010f0d-f842-4586-8c7d-2f5db76f5901.png", alt: "Tailored learning, brighter futures", href: "/course" },
];

const INTERVAL_MS = 4000;

/**
 * Endless slider. The track is [clone of last, ...slides, clone of first]; `pos`
 * indexes into it. Autoplay lowers `pos` (the track moves left to right) and the
 * arrows, dots and swipe move either way. Landing on a clone snaps (invisibly)
 * to the matching real slide.
 */
export default function BannerSlider() {
  const count = SLIDES.length;
  const [pos, setPos] = useState(1);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();
  const touchX = useRef<number | null>(null);

  const showPrev = () => setPos((p) => (p > 0 ? p - 1 : p));
  const showNext = () => setPos((p) => (p < count + 1 ? p + 1 : p));

  useEffect(() => {
    if (paused || stopped || focused || reduced || count < 2) return;
    const id = setInterval(showPrev, INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, stopped, focused, reduced, count, pos]);

  // After a snap, re-enable the transition on the next frames.
  useEffect(() => {
    if (animate) return;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  const handleTransitionEnd = () => {
    if (pos === 0 || pos === count + 1) {
      setAnimate(false);
      setPos(pos === 0 ? count : 1);
    }
  };

  const active = pos === 0 ? count - 1 : pos === count + 1 ? 0 : pos - 1;
  const track = [SLIDES[count - 1], ...SLIDES, SLIDES[0]];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured banners"
      className="relative w-full touch-pan-y select-none overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        setPaused(false);
        if (start === null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) < 50) return;
        // Dragging right reveals the previous slide, like the autoplay direction.
        if (dx > 0) showPrev();
        else showNext();
      }}
    >
      <div
        className={`flex ${animate ? "transition-transform duration-700 ease-in-out motion-reduce:duration-1" : ""}`}
        style={{ transform: `translateX(-${pos * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {track.map((slide, i) => {
          const isClone = i === 0 || i === count + 1;
          const visible = i === pos;
          const img = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.src}
              alt={slide.alt}
              draggable={false}
              loading={i <= 1 || isClone ? "eager" : "lazy"}
              className="block h-auto w-full"
            />
          );
          return (
            <div
              key={isClone ? `clone-${i}` : slide.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${(i === 0 ? count : i === count + 1 ? 1 : i)} of ${count}`}
              aria-hidden={!visible}
              className="w-full shrink-0"
            >
              {slide.href ? (
                <Link href={slide.href} tabIndex={visible ? 0 : -1}>
                  {img}
                </Link>
              ) : (
                img
              )}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            onClick={showPrev}
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 sm:left-3"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            onClick={showNext}
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 sm:right-3"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute inset-x-0 bottom-1 mx-auto flex w-fit items-center justify-center gap-0 rounded-full bg-black/35 px-1 sm:bottom-2 sm:bg-brand-start/80 sm:px-2">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Go to banner ${i + 1}`}
                aria-current={i === active}
                onClick={() => setPos(i + 1)}
                className="flex h-6 w-5 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-accent sm:h-11 sm:w-9"
              ><span className={`h-1.5 rounded-full transition-all sm:h-2 ${i === active ? "w-4 bg-accent sm:w-6" : "w-1.5 bg-white/70 sm:w-2"}`} /></button>
            ))}
            {!reduced && <button type="button" aria-label={stopped ? "Play banners" : "Pause banners"} onClick={() => setStopped(value => !value)} className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-white/15 sm:h-11 sm:w-11">{stopped ? <Play className="h-3 w-3 sm:h-4 sm:w-4" /> : <Pause className="h-3 w-3 sm:h-4 sm:w-4" />}</button>}
          </div>
        </>
      )}
    </section>
  );
}
