import Image from "next/image";
import { Target, TrendingUp, Trophy } from "lucide-react";

import { Reveal, SectionHeading } from "./ui";

const POINTS = [
  { icon: Target, title: "Compete with yesterday", text: "Every student measures progress against their own last best." },
  { icon: Trophy, title: "Pressure, practised", text: "Weekly tests build calm, exam-ready confidence." },
  { icon: TrendingUp, title: "Feedback into growth", text: "Every result becomes a clear next step." },
];

export default function ZenithMindset() {
  return (
    <section aria-label="The Zenith Mindset" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-start px-6 py-12 text-white sm:px-12 sm:py-16 lg:px-16">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[radial-gradient(700px_360px_at_100%_0%,#2147a8_0%,transparent_65%)]"
            />

            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-16">
              {/* Copy */}
              <div>
                <SectionHeading
                  tone="light"
                  eyebrow="The Zenith Mindset"
                  title={<>We don&apos;t fear competition.<br /><span className="italic text-accent">We prepare for it.</span></>}
                  description="Healthy competition sharpens focus and builds resilience. We help students welcome a challenge rather than avoid it."
                />

                <ul className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {POINTS.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-brand-start">
                        <Icon size={20} />
                      </span>
                      <p className="mt-4 font-semibold">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-blue-100/70">{text}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Poster — shown in full, never cropped */}
              <div className="relative mx-auto w-full max-w-sm">
                <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border border-accent/60" />
                <Image
                  src="/about/competition-quote.jpg"
                  alt="Quote poster: “Competition always makes you stronger and better. Competition is feared only by the weak.” — H.H. Sheikh Mohammed bin Rashid"
                  width={1302}
                  height={1600}
                  sizes="(min-width: 640px) 24rem, 100vw"
                  className="relative h-auto w-full rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
