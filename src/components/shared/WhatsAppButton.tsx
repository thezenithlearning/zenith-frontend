"use client";

import { usePathname } from "next/navigation";
import { RiWhatsappFill } from "react-icons/ri";

import { BRAND } from "@/content/brand";

const MESSAGE = "Hi Zenith Learning, I'd like to know more about your courses.";

/** Course detail pages have a fixed purchase bar on mobile; sit above it there. */
const hasMobileBar = (path: string) => /^\/course\/(?!category(\/|$))[^/]+\/?$/.test(path);

export default function WhatsAppButton() {
  const pathname = usePathname() ?? "";
  const href = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with us on WhatsApp (${BRAND.phone})`}
      title="Chat with us on WhatsApp"
      className={`group fixed right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/25 transition hover:scale-105 hover:bg-[#1ebe5b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] sm:right-6 sm:bottom-6 ${
        hasMobileBar(pathname) ? "bottom-24 md:bottom-6" : "bottom-4"
      }`}
    >
      <span aria-hidden className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 motion-safe:animate-ping [animation-duration:2.5s]" />
      <RiWhatsappFill aria-hidden className="relative h-8 w-8" />
    </a>
  );
}
