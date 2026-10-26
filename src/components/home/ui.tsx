"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/** Fade-up on scroll. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
}) {
  const center = align === "center";
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <p
        className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] ${
          tone === "light" ? "text-accent" : "text-brand-mid"
        }`}
      >
        <span aria-hidden className="h-px w-8 bg-current opacity-60" />
        {eyebrow}
      </p>
      <h2
        className={`font-display mt-4 text-3xl font-medium leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.75rem] ${
          tone === "light" ? "text-white" : "text-brand-start"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 text-base leading-7 sm:text-lg ${
            tone === "light" ? "text-blue-100/75" : "text-slate-600"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
