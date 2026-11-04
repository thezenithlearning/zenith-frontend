"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Slide = { src: string; alt: string; href?: string };

/** Replace these files in /public/banners (or edit the list) to change the home slider. */
const SLIDES: Slide[] = [
  { src: "https://media.writed.in/uploads/slide1--5d574f41-7a6f-44a6-91c7-e9715ef1fa98.webp", alt: "Zenith Learning banner 1", href: "/course" },
  { src: "https://media.writed.in/uploads/slide2--510904bc-0d7f-4a91-807d-ff4332bfb646.webp", alt: "Zenith Learning banner 2", href: "/course" },
  { src: "https://media.writed.in/uploads/slide3--c3ffafda-8675-4ed9-8285-909ed05a4ce5.webp", alt: "Zenith Learning banner 3", href: "/course" },
  { src: "https://media.writed.in/uploads/slide6--33e0919b-4c4e-4363-9102-53e38316feaf.webp", alt: "Zenith Learning banner 4", href: "/course" },
  { src: "https://media.writed.in/uploads/slide7--fd24f7be-2e29-4248-ba53-f38297c0a53b.webp", alt: "Zenith Learning banner 5", href: "/course" },
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
  const touchX = useRef<number | null>(null);

  const showPrev = () => setPos((p) => (p > 0 ? p - 1 : p));
  const showNext = () => setPos((p) => (p < count + 1 ? p + 1 : p));

  useEffect(() => {
    if (paused || count < 2) return;
    const id = setInterval(showPrev, INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, count, pos]);

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
      className="relative w-full touch-pan-y select-none overflow-hidden bg-brand-start"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
        className={`flex ${animate ? "transition-transform duration-700 ease-in-out" : ""}`}
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
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            onClick={showNext}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white transition hover:bg-black/60"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Go to banner ${i + 1}`}
                aria-current={i === active}
                onClick={() => setPos(i + 1)}
                className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-accent" : "w-2 bg-white/60"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
