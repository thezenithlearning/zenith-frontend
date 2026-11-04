type Partner = { name: string; logo?: string };

/** Logos live in /public/partners; entries without one render as a text badge. */
const PARTNERS: Partner[] = [
  { name: "MSME", logo: "/partners/msme.svg" },
  { name: "Startup India", logo: "/partners/startup-india.png" },
  { name: "Digital India", logo: "/partners/digital-india.svg" },
  { name: "Skill India", logo: "/partners/skill-india.jpg" },
  { name: "Make in India" },
  { name: "ISO", logo: "/partners/iso.svg" },
  { name: "Google", logo: "/partners/google.svg" },
  { name: "Zoho", logo: "/partners/zoho.svg" },
  { name: "Microsoft", logo: "/partners/microsoft.svg" },
  { name: "NASSCOM", logo: "/partners/nasscom.svg" },
  { name: "NSDC", logo: "/partners/nsdc.svg" },
  { name: "AICTE" },
  { name: "UGC", logo: "/partners/ugc.png" },
  { name: "NCERT" },
  { name: "CBSE", logo: "/partners/cbse.png" },
  { name: "Cambridge" },
  { name: "IB", logo: "/partners/ib.svg" },
  { name: "Pearson Edexcel" },
];

export default function Credibility() {
  const items = [...PARTNERS, ...PARTNERS];

  return (
    <section aria-label="Certifications and partnerships" className="border-b border-line bg-white pb-10 pt-6 sm:pb-12 sm:pt-8">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-display text-3xl font-medium tracking-tight text-brand-start sm:text-4xl">
          Recognised &amp; partnered with
        </h2>
      </div>
      <div className="marquee relative mt-9 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="marquee-track flex w-max items-center gap-14 pr-14">
          {items.map(({ name, logo }, i) => (
            <li
              key={`${name}-${i}`}
              aria-hidden={i >= PARTNERS.length}
              className="flex h-14 shrink-0 items-center justify-center font-display text-lg font-semibold text-brand-start"
            >
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={name} draggable={false} className="h-12 w-auto max-w-36 object-contain" />
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
