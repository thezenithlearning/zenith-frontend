import { Clock, MapPin, Navigation } from "lucide-react";

import { Reveal, SectionHeading } from "@/components/home/ui";
import { OFFICE } from "@/content/contact";

export default function OfficeLocation() {
  const query = encodeURIComponent(OFFICE.mapQuery);
  const embedSrc = `https://www.google.com/maps?q=${query}&output=embed`;
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto grid max-w-7xl items-stretch gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12 lg:px-8">
        <Reveal className="flex flex-col justify-center">
          <SectionHeading
            eyebrow="Visit us"
            title="Our office, by appointment."
            description="Prefer to talk in person? Book a time and a mentor will meet you."
          />

          <div className="mt-8 space-y-6">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-start-soft text-brand-mid">
                <MapPin size={20} />
              </span>
              <address className="not-italic">
                <p className="font-semibold text-brand-start">{OFFICE.name}</p>
                {OFFICE.lines.map((line) => (
                  <p key={line} className="text-sm leading-6 text-slate-600">
                    {line}
                  </p>
                ))}
              </address>
            </div>

            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-start-soft text-brand-mid">
                <Clock size={20} />
              </span>
              <dl className="min-w-0 flex-1 text-sm">
                {OFFICE.hours.map((slot) => (
                  <div
                    key={slot.days}
                    className="flex flex-wrap justify-between gap-x-4 border-b border-slate-100 py-1.5 last:border-0"
                  >
                    <dt className="font-medium text-brand-start">{slot.days}</dt>
                    <dd className="text-slate-600">{slot.time}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-brand-start px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-mid"
            >
              <Navigation size={16} />
              Get directions
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="min-h-[320px] lg:min-h-[460px]">
          <div className="h-full min-h-[320px] overflow-hidden rounded-3xl border border-slate-200 shadow-lg lg:min-h-[460px]">
            <iframe
              title={`Map showing ${OFFICE.name}`}
              src={embedSrc}
              className="h-full min-h-[320px] w-full border-0 lg:min-h-[460px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
