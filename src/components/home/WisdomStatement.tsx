import { Reveal } from "./ui";

const POWERS = ["Question", "Think", "Lead"];

export default function WisdomStatement() {
  return (
    <section aria-label="The Zenith Philosophy" className="relative isolate overflow-hidden bg-brand-start text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(800px_400px_at_0%_0%,#1a3a8f_0%,transparent_65%)]"
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.35fr_.65fr] lg:gap-20">
        {/* Statement */}
        <Reveal>
          <p className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-accent">
            <span aria-hidden className="h-px w-8 bg-accent/70" />
            The Zenith Philosophy
          </p>
          <h2 className="font-display mt-6 text-6xl font-medium leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
            Wisdom is
            <br />
            <span className="italic text-accent">weaponry.</span>
          </h2>
        </Reveal>

        {/* Supporting line, broken into its three verbs */}
        <Reveal delay={0.15}>
          <div className="border-l border-accent/40 pl-6 sm:pl-8">
            <p className="text-lg leading-8 text-blue-100/80">
              Knowledge gives you the power to
            </p>
            <ol className="mt-4">
              {POWERS.map((word, i) => (
                <li key={word} className="flex items-baseline gap-5 border-b border-white/10 py-4 last:border-0">
                  <span className="text-xs font-bold tracking-widest text-accent">0{i + 1}</span>
                  <span className="font-display text-3xl font-medium sm:text-4xl">
                    {word}
                    {i === POWERS.length - 1 && <span className="text-accent">.</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
