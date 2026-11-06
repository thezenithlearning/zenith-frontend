import Image from "next/image";

import { GALLERY_ROWS, type GalleryItem } from "@/content/gallery";
import { Reveal, SectionHeading } from "./ui";

const TONES = [
  "from-brand-start to-brand-mid",
  "from-brand-mid to-brand-end",
  "from-[#13307a] to-[#2d58bd]",
  "from-accent-dark to-accent",
];

const ROW_CLASSES = ["marquee-slow", "marquee-track-reverse", "marquee-fast"];

function Tile({ item, tone }: { item: GalleryItem; tone: string }) {
  return (
    <figure className="relative h-36 w-56 shrink-0 overflow-hidden rounded-2xl sm:h-44 sm:w-72">
      {item.src ? (
        <Image src={item.src} alt={item.title} fill sizes="288px" className="object-cover" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${tone}`}>
          <div aria-hidden className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
          <div aria-hidden className="absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-white/10" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
      <figcaption className="absolute inset-x-0 bottom-0 p-4 text-white">
        <span className="font-display block text-lg font-medium leading-tight">{item.title}</span>
        <span className="mt-0.5 block text-xs text-white/75">{item.caption}</span>
      </figcaption>
    </figure>
  );
}

function Row({ items, rowIndex }: { items: GalleryItem[]; rowIndex: number }) {
  // The list is rendered twice so translating by -50% loops with no visible jump.
  const loop = [...items, ...items];
  return (
    <div
      className="marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
      aria-hidden={rowIndex > 0 ? true : undefined}
    >
      <div className={`marquee-track flex w-max gap-4 ${ROW_CLASSES[rowIndex % ROW_CLASSES.length]}`}>
        {loop.map((item, i) => (
          <Tile key={`${item.title}-${i}`} item={item} tone={TONES[(i + rowIndex) % TONES.length]} />
        ))}
      </div>
    </div>
  );
}

export default function ImageMarquee() {
  return (
    <section className="overflow-hidden bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Life at Zenith"
            title={
              <>
                Learning that never <span className="italic text-brand-mid">stands still.</span>
              </>
            }
            description="Classes, programmes and tools that keep every student moving towards their goal."
          />
        </Reveal>
      </div>
      <div className="mt-12 space-y-4">
        {GALLERY_ROWS.map((items, i) => (
          <Row key={i} items={items} rowIndex={i} />
        ))}
      </div>
    </section>
  );
}
