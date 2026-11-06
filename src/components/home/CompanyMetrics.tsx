"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

import { METRICS, type Metric } from "@/content/metrics";

function Counter({ metric }: { metric: Metric }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || metric.value === undefined) return;
    const controls = animate(0, metric.value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setShown(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, metric.value]);

  if (metric.value === undefined) return <span ref={ref}>{metric.text}</span>;
  return (
    <span ref={ref}>
      {metric.prefix}
      {shown}
      {metric.suffix}
    </span>
  );
}

export default function CompanyMetrics() {
  return (
    <section aria-label="Zenith Learning at a glance" className="relative z-10 -mt-10 pb-4 sm:-mt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-brand-start/10 sm:p-4">
          <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-brand-mid sm:px-4">
            Zenith at a glance
          </p>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-slate-200 md:grid-cols-3 lg:grid-cols-6">
            {METRICS.map((metric) => (
              <div key={metric.label} className="bg-white p-4 sm:p-5">
                <dt className="sr-only">{metric.label}</dt>
                <dd>
                  <span className="font-display block text-3xl font-medium text-brand-mid sm:text-4xl">
                    <Counter metric={metric} />
                  </span>
                  <span className="mt-1 block text-xs font-semibold leading-4 text-brand-start sm:text-sm">
                    {metric.label}
                  </span>
                  <span className="mt-1 block text-[11px] leading-4 text-slate-500 sm:text-xs">
                    {metric.note}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
