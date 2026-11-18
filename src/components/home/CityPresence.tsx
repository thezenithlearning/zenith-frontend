import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PRESENCE_CITIES, PRESENCE_REGIONS } from "@/content/presence";
import { Reveal } from "./ui";

/* /world-presence-map.svg is an equirectangular dot map (Natural Earth data):
   1000 × 389 viewBox, longitude -180…180, latitude 84…-56. The marker layer
   uses the same viewBox, so `project` places cities exactly on the map. */
const MAP_W = 1000;
const MAP_H = 389;
const LAT_TOP = 84;
const LAT_BOTTOM = -56;

const project = (lat: number, lon: number) => ({
  x: ((lon + 180) / 360) * MAP_W,
  y: ((LAT_TOP - lat) / (LAT_TOP - LAT_BOTTOM)) * MAP_H,
});

/** One pulsing city per continent keeps the map alive without getting busy. */
const PULSE = new Set(["New Delhi", "Dubai", "Singapore", "London", "Nairobi", "New York", "Sydney"]);

const countryCount = new Set(PRESENCE_CITIES.map(city => city.country)).size;

export default function CityPresence() {
  const regions = PRESENCE_REGIONS.map(region => ({
    region,
    cities: PRESENCE_CITIES.filter(city => city.region === region),
  })).filter(group => group.cities.length > 0);

  return (
    <section id="global-presence" aria-labelledby="global-presence-heading" className="bg-surface-muted py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-mid">
              <span aria-hidden="true" className="h-0.5 w-8 bg-accent" /> Our presence worldwide
            </p>
            <h2 id="global-presence-heading" className="mt-5 font-display text-4xl font-medium leading-tight tracking-tight text-brand-start sm:text-5xl lg:text-6xl">
              Across the world.<br /><span className="italic text-brand-mid">Closer to you.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-ink-muted">
              Families from {PRESENCE_CITIES.length}+ cities in {countryCount} countries learn with Zenith through live online classes, wherever their next chapter begins.
            </p>
            <Link href="/contact-us" className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-accent px-6 py-3 text-sm font-bold text-brand-start transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-mid">
              Find your learning pathway <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Reveal>

          {/* ---------- City listing by region ---------- */}
          <Reveal delay={0.1}>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-start">Explore our cities</p>
            <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {regions.map(({ region, cities }) => (
                <div key={region}>
                  <dt className="flex items-center gap-2 text-sm font-semibold text-brand-start">
                    <span aria-hidden="true" className={`h-2 w-2 rounded-full ${region === "India" ? "bg-brand-mid" : "bg-accent"}`} />
                    {region}
                  </dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {cities.map(city => (
                      <span
                        key={city.name}
                        title={city.country}
                        className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs text-ink-muted transition hover:border-brand-mid/40 hover:text-brand-start"
                      >
                        {city.name}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* ---------- World map ---------- */}
        <Reveal delay={0.15}>
          <figure className="mt-12 rounded-3xl border border-line bg-white p-3 shadow-xl shadow-brand-start/5 sm:mt-16 sm:p-6 lg:p-8">
            <div className="relative aspect-[1000/389] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/world-presence-map.svg"
                alt={`Dotted world map with ${PRESENCE_CITIES.length} learner cities marked across ${countryCount} countries`}
                className="absolute inset-0 h-full w-full select-none"
                draggable={false}
              />
              <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
                {PRESENCE_CITIES.map((city, i) => {
                  const { x, y } = project(city.latitude, city.longitude);
                  return (
                    <g key={city.name}>
                      <title>{`${city.name}, ${city.country}`}</title>
                      {PULSE.has(city.name) && (
                        <circle
                          cx={x}
                          cy={y}
                          r="7"
                          className="origin-center animate-ping fill-accent/60 [animation-duration:2.6s] [transform-box:fill-box] motion-reduce:hidden"
                          style={{ animationDelay: `${(i % 7) * 0.35}s` }}
                        />
                      )}
                      <circle cx={x} cy={y} r="3.6" className="fill-accent stroke-white" strokeWidth="1.2" />
                    </g>
                  );
                })}
              </svg>
            </div>
            <figcaption className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-muted sm:mt-6 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-white" /> Zenith learner cities
              </span>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-brand-mid" /> India, our home base
              </span>
              <span className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[#c7d2ec]" /> Live online classes, wherever you are
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
