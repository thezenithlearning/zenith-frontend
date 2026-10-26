"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function CTASection({
  heading = "Ready to reach your Zenith?",
  description = "Tell us the student's curriculum, grade, target exam and goals. We'll recommend the right learning pathway.",
  buttonText = "Send an enquiry",
  buttonHref = "/contact-us",
}: CTASectionProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-start px-8 py-14 text-white sm:px-14">
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-end/35 blur-[100px]" />
            <div className="absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-accent/20 blur-[100px]" />
          </div>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-medium leading-tight sm:text-4xl">{heading}</h2>
              <p className="mt-3 text-lg leading-8 text-blue-100/75">{description}</p>
            </div>
            <Link
              href={buttonHref}
              className="group inline-flex h-12 w-fit shrink-0 items-center gap-2 rounded-full bg-accent px-8 text-sm font-bold text-brand-start transition hover:brightness-110"
            >
              {buttonText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
