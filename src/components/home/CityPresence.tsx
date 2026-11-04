import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { INDIA_PRESENCE_CITIES } from "@/content/presence";
import { Reveal } from "./ui";

export default function CityPresence() {
  return (
    <section id="india-presence" aria-labelledby="india-presence-heading" className="bg-surface-muted py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-mid">
              <span aria-hidden="true" className="h-0.5 w-8 bg-accent" /> Our presence in India
            </p>
            <h2 id="india-presence-heading" className="mt-5 font-display text-4xl font-medium leading-tight tracking-tight text-brand-start sm:text-5xl lg:text-6xl">
              Across cities.<br /><span className="italic text-brand-mid">Closer to you.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-ink-muted">
              Your ambitions have a place here. Explore online learning with Zenith, wherever your next chapter begins.
            </p>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-brand-start">Explore our cities</p>
            <ul aria-label="Cities across India" className="mt-4 flex max-w-lg flex-wrap gap-x-3 gap-y-2 text-sm leading-6 text-ink-muted">
              {INDIA_PRESENCE_CITIES.map((city, index) => (
                <li key={city.name} className="inline-flex items-center gap-3">
                  {index > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-accent" />}
                  {city.name}
                </li>
              ))}
            </ul>
            <Link href="/contact-us" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-accent px-6 py-3 text-sm font-bold text-brand-start transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-mid">
              Find your learning pathway <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[540px]">
              <Image
                src="/india-city-presence.png"
                alt="Illustration of India in navy blue with gold city markers"
                fill
                unoptimized
                sizes="(max-width: 1023px) 90vw, 540px"
                className="object-contain"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
