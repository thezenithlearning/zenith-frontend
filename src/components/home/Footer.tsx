"use client";

import Link from "next/link";
import { ArrowUp, Mail } from "lucide-react";
import { RiInstagramLine, RiLinkedinFill, RiYoutubeFill } from "react-icons/ri";

import { BRAND } from "@/content/brand";
import ZenithLogo from "@/components/brand/ZenithLogo";

const PROGRAM_LINKS = [
  { href: "/course/ib-dp-physics", label: "IB DP Physics" },
  { href: "/course/igcse-a-level", label: "IGCSE & A Level" },
  { href: "/course/sat-ap", label: "SAT & AP" },
  { href: "/course/jee-neet-cbse", label: "JEE • NEET • CBSE" },
];

const EXPLORE_LINKS = [
  { href: "/about-us", label: "About Zenith" },
  { href: "/blog", label: "Insights" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact-us", label: "Admissions & Contact" },
];

const COMPANY_LINKS = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-conditions", label: "Terms & Conditions" },
  { href: "/login", label: "Admin Login" },
];

const SOCIALS = [
  { href: BRAND.social.linkedin, label: "LinkedIn", icon: RiLinkedinFill },
  { href: BRAND.social.instagram, label: "Instagram", icon: RiInstagramLine },
  { href: BRAND.social.youtube, label: "YouTube", icon: RiYoutubeFill },
];

const FooterColumn = ({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) => (
  <div>
    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">{title}</h3>
    <ul className="mt-5 space-y-3 text-sm">
      {links.map((link) => (
        <li key={link.href}>
          <Link href={link.href} className="text-blue-100/70 transition-colors hover:text-white">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#07153a] text-white">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <ZenithLogo tone="light" />
            <p className="font-display mt-6 max-w-sm text-2xl font-medium leading-snug">
              Reach your <span className="italic text-accent">Zenith.</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-blue-100/65">
              Personalised academic mentoring across international curricula, school academics and
              competitive exams.
            </p>
            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-50/85 transition-colors hover:text-white"
            >
              <Mail className="h-4 w-4 text-accent" />
              {BRAND.supportEmail}
            </a>
            <div className="mt-6 flex gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-blue-100/80 transition hover:border-accent hover:text-accent"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Programs" links={PROGRAM_LINKS} />
          <FooterColumn title="Explore" links={EXPLORE_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-blue-100/55 sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
          <button
            id="footer-back-to-top-button"
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex cursor-pointer items-center gap-1.5 text-blue-100/70 transition-colors hover:text-white"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
