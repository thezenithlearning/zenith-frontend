import type { ReactNode } from "react";

/** Compact dark banner used at the top of inner public pages. */
export default function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-start text-white">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_85%_-20%,#2147a8_0%,transparent_65%)]" />
        <div className="absolute -bottom-16 left-1/2 h-48 w-[130%] -translate-x-1/2 bg-[#07153a] opacity-70 [clip-path:polygon(0_100%,16%_40%,32%_70%,50%_20%,68%_62%,84%_34%,100%_100%)]" />
        <div className="absolute right-[10%] top-10 h-40 w-40 rounded-full bg-accent/20 blur-[80px]" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl">
          {title}
        </h1>
        {description && <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-100/75">{description}</p>}
        {children}
      </div>
    </section>
  );
}
