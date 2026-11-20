import Image from "next/image";
import { Quote } from "lucide-react";

export default function AboutQuote() {
  return (
    <section className="relative overflow-hidden bg-brand-start text-white">
      <div aria-hidden className="absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand-mid/40 blur-3xl" />
      <div aria-hidden className="absolute -bottom-48 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        {/* Copy */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[.24em] text-accent">A thought we live by</p>

          <Quote aria-hidden className="mt-8 h-12 w-12 text-accent" strokeWidth={1.5} />

          <blockquote className="mt-4">
            <p className="font-display text-4xl leading-[1.15] tracking-tight sm:text-5xl">
              Competition always makes you <span className="italic text-accent">stronger</span> and{" "}
              <span className="italic text-accent">better</span>.
            </p>
            <p className="font-display mt-4 text-2xl leading-snug text-blue-100/80 sm:text-3xl">
              Competition is feared only by the weak.
            </p>
          </blockquote>

          <div className="mt-8 flex items-center gap-4">
            <span aria-hidden className="h-px w-12 bg-accent" />
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-blue-100/90">
              H.H. Sheikh Mohammed bin Rashid
            </p>
          </div>

          <p className="mt-10 max-w-lg border-l-2 border-white/15 pl-5 leading-7 text-blue-100/75">
            We teach our students to welcome a challenge rather than fear it, and to measure progress against who they were yesterday.
          </p>
        </div>

        {/* Image */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2rem] border-2 border-accent/70 sm:translate-x-6 sm:translate-y-6" />
          <figure className="relative overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-white/10 transition duration-500 hover:-translate-y-1">
            <Image
              src="/about/competition-quote.jpg"
              alt="Quote poster: Competition always makes you stronger and better. Competition is feared only by the weak. — H.H. Sheikh Mohammed bin Rashid"
              width={1302}
              height={1600}
              sizes="(min-width: 1024px) 34rem, (min-width: 640px) 28rem, 100vw"
              className="h-auto w-full"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
