"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { useLeadModal } from "@/components/lead/LeadModal";

import { Reveal } from "./ui";

/** Help students choose their next course with a free demo. */
export default function DemoCta() {
  const { open } = useLeadModal();

  return (
    <section className="bg-surface-muted pb-16 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative isolate grid overflow-hidden rounded-[2rem] bg-brand-start shadow-xl shadow-brand-start/10 md:grid-cols-[1fr_0.8fr]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-start via-brand-start to-brand-mid" />
            <div className="px-7 pt-9 pb-6 sm:px-12 sm:pt-12 md:py-14 lg:pl-16">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">A little guidance goes a long way</p>
              <h2 className="mt-4 max-w-lg font-display text-3xl font-medium leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                So many courses.<br />
                <span className="text-accent">Which one is you?</span>
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-blue-100/85">
                Not sure where to start? Tell us your goals, try a free demo class, and find your next step with Zenith.
              </p>
              <button
                type="button"
                onClick={() => open("book-demo")}
                className="group mt-7 inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-full bg-accent px-7 py-3 text-sm font-bold text-brand-start transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                Book a free demo
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            <div className="relative mx-auto h-72 w-full max-w-sm self-end sm:h-80 md:h-full md:min-h-96 md:max-w-none">
              <div aria-hidden="true" className="absolute bottom-[-5rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full border border-white/10 bg-white/5 lg:h-96 lg:w-96" />
              <span aria-hidden="true" className="absolute top-8 left-[12%] rotate-[-12deg] font-display text-6xl text-accent md:top-16">?</span>
              <span aria-hidden="true" className="absolute top-16 right-[12%] rotate-12 font-display text-4xl text-blue-200/60 md:top-28">?</span>
              <Image
                src="/confused-anime-girl.png"
                alt="Anime girl with a thoughtful, confused expression"
                fill
                unoptimized
                sizes="(max-width: 767px) 384px, 45vw"
                draggable={false}
                className="object-contain object-bottom px-8 pt-3 md:px-6 md:pt-8"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
