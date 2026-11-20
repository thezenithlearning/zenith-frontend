type Partner = { name: string; logo?: string; wide?: boolean };

/** Logos live in /public/partners; entries without one render as a text badge. */
const PARTNERS: Partner[] = [
  { name: "MSME", logo: "/partners/msme.svg" },
  { name: "Startup India", logo: "/partners/startup-india.png" },
  { name: "Digital India", logo: "/partners/digital-india.svg" },
  { name: "Skill India", logo: "/partners/skill-india.jpg" },
  { name: "Make in India" },
  { name: "AICTE" },
  { name: "UGC", logo: "/partners/ugc.png" },
  { name: "NCERT" },
  { name: "CBSE", logo: "/partners/cbse.png" },
  { name: "Dubai Economic Agenda D33", logo: "/partners/dubai-economic-agenda-d33.png", wide: true },
  { name: "Dubai Future Foundation", logo: "/partners/dubai-future-foundation.png", wide: true },
];

export default function Credibility() {
  const items = [...PARTNERS, ...PARTNERS];

  return (
    <section aria-label="Government bodies and initiatives sharing our vision" className="border-b border-line bg-white pb-10 pt-6 sm:pb-12 sm:pt-8">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-display text-3xl font-medium tracking-tight text-brand-start sm:text-4xl">
          Sharing a vision with
        </h2>
      </div>
      <div className="marquee relative mt-9 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="marquee-track flex w-max items-center gap-14 pr-14">
          {items.map(({ name, logo, wide }, i) => (
            <li
              key={`${name}-${i}`}
              aria-hidden={i >= PARTNERS.length}
              className="flex h-14 shrink-0 items-center justify-center font-display text-lg font-semibold text-brand-start"
            >
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={name} draggable={false} className={wide ? "h-12 w-64 object-contain" : "h-12 w-auto max-w-36 object-contain"} />
              ) : (
                name
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
