import { Mail, MapPin, Phone } from "lucide-react";
import { RiInstagramLine, RiLinkedinFill, RiTwitterXFill, RiYoutubeFill } from "react-icons/ri";

import { Reveal } from "@/components/home/ui";
import { BRAND } from "@/content/brand";

const SOCIALS = [
  { href: BRAND.social.linkedin, label: "LinkedIn", icon: RiLinkedinFill },
  { href: BRAND.social.instagram, label: "Instagram", icon: RiInstagramLine },
  { href: BRAND.social.youtube, label: "YouTube", icon: RiYoutubeFill },
  { href: BRAND.social.x, label: "X / Twitter", icon: RiTwitterXFill },
];

export default function ConnectStrip() {
  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-brand-start px-6 py-10 text-white sm:px-12 sm:py-14">
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[radial-gradient(700px_320px_at_90%_-10%,#2147a8_0%,transparent_65%)]"
            />
            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Stay connected</p>
                <h2 className="font-display mt-3 text-3xl font-medium leading-tight sm:text-4xl">
                  Prefer a quick word? Reach us directly.
                </h2>
                <p className="mt-3 max-w-xl text-blue-100/75">
                  Call, WhatsApp or write to us, and follow Zenith for study tips, exam updates and
                  student stories.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-accent">Call or WhatsApp</p>
                <a
                  href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 text-sm font-semibold transition hover:bg-white/20"
                >
                  <Phone size={18} className="shrink-0 text-accent" />
                  {BRAND.phone}
                </a>
                <p className="pt-3 text-xs font-bold uppercase tracking-widest text-accent">Email</p>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="flex items-center gap-3 break-all rounded-2xl bg-white/10 px-5 py-4 text-sm font-semibold transition hover:bg-white/20"
                >
                  <Mail size={18} className="shrink-0 text-accent" />
                  {BRAND.email}
                </a>
                <p className="pt-3 text-xs font-bold uppercase tracking-widest text-accent">Based in</p>
                <p className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-4 text-sm font-semibold">
                  <MapPin size={18} className="shrink-0 text-accent" />
                  {BRAND.address.city}, {BRAND.address.country}
                </p>
                <p className="pt-3 text-xs font-bold uppercase tracking-widest text-accent">Follow Zenith</p>
                <ul className="flex flex-wrap gap-3 pt-1">
                  {SOCIALS.map((social) => (
                    <li key={social.label}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm transition hover:bg-accent hover:text-brand-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                      >
                        <social.icon size={18} />
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
