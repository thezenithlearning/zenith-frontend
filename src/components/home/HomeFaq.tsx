"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Reveal, SectionHeading } from "./ui";

type Faq = { question: string; answer: string; tag?: string };

export default function HomeFaq({ items }: { items: readonly Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-surface-muted py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="FAQs"
            title="Questions, answered."
            description="Everything families ask before starting with Zenith. Can't find yours? Send us an enquiry."
          />
        </Reveal>

        <ul className="divide-y divide-slate-200 border-y border-slate-200">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.question}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-display text-xl font-medium text-brand-start">{item.question}</span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
                        isOpen ? "rotate-45 border-brand-start bg-brand-start text-white" : "border-slate-300 text-slate-500"
                      }`}
                    >
                      <Plus size={18} />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"}`}
                >
                  <p className="overflow-hidden pr-12 text-[15px] leading-7 text-slate-600">{item.answer}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
