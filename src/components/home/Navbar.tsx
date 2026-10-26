"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight, Menu, X } from "lucide-react";

import ZenithLogo from "@/components/brand/ZenithLogo";
import { TopBannerView } from "@/components/ads/AdParts";
import { useLeadModal } from "@/components/lead/LeadModal";
import { useGetPublicAdsQuery } from "@/features/advertisement/api/advertisementApi";
import { useGetCoursesQuery, type ICourse } from "@/features/course/api/courseApi";

const EMPTY_COURSES: ICourse[] = [];

const NAV_LINKS = [
  { href: "/about-us", label: "About" },
  { href: "/blog", label: "Insights" },
] as const;

const MORE_LINKS = [
  { href: "/mock-tests", label: "Mock Tests" },
  { href: "/pyqs", label: "Past Papers" },
  { href: "/qna", label: "Q&A" },
  { href: "/faqs", label: "FAQs" },
  { href: "/contact-us", label: "Contact" },
] as const;

const categoryLabel = (category: string) => category.replace(/-/g, " ");

function isActiveLink(pathname: string | null, href: string) {
  return pathname === href || Boolean(pathname?.startsWith(`${href}/`));
}

function MoreMenu({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = mobile ? "mobile-more-links" : "desktop-more-links";
  const active = MORE_LINKS.some((link) => isActiveLink(pathname, link.href));

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={mobile ? "border-b border-slate-100" : "relative flex"}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className={`flex cursor-pointer items-center gap-1 font-semibold transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#1b3b8c] ${mobile ? "w-full justify-between px-3 py-3" : "px-4 text-sm"} ${active || open ? "bg-blue-50 text-[#1b3b8c]" : "text-slate-700 hover:bg-slate-50 hover:text-[#1b3b8c]"}`}
      >
        More
        <ChevronDown aria-hidden size={14} className={`transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={menuId}
        hidden={!open}
        className={mobile ? "mb-3 ml-3 border-l-2 border-blue-100 pl-2" : "absolute right-0 top-full z-10 w-52 rounded-b-xl border border-slate-200 bg-white p-2 shadow-xl"}
      >
        {MORE_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActiveLink(pathname, link.href) ? "page" : undefined}
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className={`block rounded-lg px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#1b3b8c] ${isActiveLink(pathname, link.href) ? "bg-blue-50 text-[#1b3b8c]" : "text-slate-700 hover:bg-blue-50 hover:text-[#1b3b8c]"}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [promoVisible, setPromoVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { open: openLeadForm } = useLeadModal();
  const { data: adsData } = useGetPublicAdsQuery();
  const topbar = adsData?.data.topbar ?? null;
  const { data } = useGetCoursesQuery({ page: 1, limit: 100, status: "active" });
  const courses = data?.data ?? EMPTY_COURSES;

  const groups = useMemo(() => {
    const result = new Map<string, typeof courses>();
    courses.forEach((course) => {
      result.set(course.category, [...(result.get(course.category) ?? []), course]);
    });
    return Array.from(result.entries());
  }, [courses]);

  const selectedGroup = groups.find(([category]) => category === activeCategory) ?? groups[0];

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      {promoVisible && topbar && <TopBannerView ad={topbar} onClose={() => setPromoVisible(false)} />}

      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Zenith Learning home" className="flex shrink-0 items-center">
          <ZenithLogo />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-stretch self-stretch lg:flex">
          <div
            className="relative flex"
            onMouseEnter={() => setCoursesOpen(true)}
            onMouseLeave={() => setCoursesOpen(false)}
          >
            <Link href="/course" className="flex items-center gap-1 px-4 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-[#1b3b8c]">
              Programs <ChevronDown size={14} />
            </Link>
            {coursesOpen && selectedGroup && (
              <div className="absolute left-0 top-full z-10 grid w-[640px] max-w-[calc(100vw-2rem)] grid-cols-[220px_1fr] border border-slate-200 bg-white shadow-2xl">
                {/* Column 1: categories */}
                <div className="border-r border-slate-100 bg-slate-50/60 py-2">
                  {groups.map(([category]) => {
                    const isActive = category === selectedGroup[0];
                    return (
                      <Link
                        key={category}
                        href={`/course/category/${category.toLowerCase()}`}
                        onMouseEnter={() => setActiveCategory(category)}
                        onFocus={() => setActiveCategory(category)}
                        className={`flex items-center justify-between gap-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
                          isActive ? "bg-white text-[#1b3b8c]" : "text-slate-700 hover:bg-white hover:text-[#1b3b8c]"
                        }`}
                      >
                        {categoryLabel(category)}
                        <ChevronRight aria-hidden size={14} />
                      </Link>
                    );
                  })}
                </div>

                {/* Column 2: courses in the active category */}
                <div className="max-h-[360px] overflow-y-auto px-5 py-3">
                  <p className="mb-2 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                    {categoryLabel(selectedGroup[0])} programs
                  </p>
                  {selectedGroup[1].map((course) => (
                    <Link
                      key={course._id}
                      href={`/course/${course.slug}`}
                      className="block py-2 text-sm leading-5 text-slate-700 transition-colors hover:text-[#1b3b8c]"
                    >
                      {course.title}
                    </Link>
                  ))}
                  <Link
                    href={`/course/category/${selectedGroup[0].toLowerCase()}`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#1b3b8c]"
                  >
                    View all {categoryLabel(selectedGroup[0])} programs <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActiveLink(pathname, link.href) ? "page" : undefined}
              className={`flex items-center px-4 text-sm font-semibold transition ${
                isActiveLink(pathname, link.href)
                  ? "bg-blue-50 text-[#1b3b8c]"
                  : "text-slate-700 hover:bg-slate-50 hover:text-[#1b3b8c]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <MoreMenu />
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => openLeadForm("navbar-start-learning")}
            className="hidden h-10 cursor-pointer items-center rounded-full bg-[#07153a] px-6 text-sm font-bold text-white transition hover:bg-[#2147a8] sm:flex"
          >
            Start Your Journey
          </button>
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-800 lg:hidden"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav aria-label="Mobile navigation" className="border-t border-slate-200 bg-white p-4 shadow-xl lg:hidden">
          <Link href="/course" onClick={() => setMobileOpen(false)} className="block border-b border-slate-100 px-3 py-3 font-semibold text-slate-700">
            Programs
          </Link>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActiveLink(pathname, link.href) ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
              className={`block border-b border-slate-100 px-3 py-3 font-semibold ${isActiveLink(pathname, link.href) ? "bg-blue-50 text-[#1b3b8c]" : "text-slate-700 hover:bg-slate-50 hover:text-[#1b3b8c]"}`}
            >
              {link.label}
            </Link>
          ))}
          <MoreMenu mobile onNavigate={() => setMobileOpen(false)} />
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              openLeadForm("navbar-start-learning");
            }}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-[#07153a] text-sm font-bold text-white"
          >
            Start Your Journey
          </button>
        </nav>
      )}
    </header>
  );
}
