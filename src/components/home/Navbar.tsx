"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight, Menu, X, CircleHelp, ClipboardCheck, PlayCircle, FileText, Users, MessageCircle, type LucideIcon } from "lucide-react";

import { TopBannerView } from "@/components/ads/AdParts";
import { useLeadModal } from "@/components/lead/LeadModal";
import { useGetPublicAdsQuery } from "@/features/advertisement/api/advertisementApi";
import { useGetCoursesQuery, type ICourse } from "@/features/course/api/courseApi";

const EMPTY_COURSES: ICourse[] = [];

const NAV_LINKS = [
  { href: "/blog", label: "Blog" },
] as const;

type MenuLink = { href: string | null; label: string; description: string; icon: LucideIcon };

const MORE_LINKS: readonly MenuLink[] = [
  { href: "/about-us", label: "About Us", description: "Get to know Zenith Learning", icon: Users },
  { href: "/contact-us", label: "Contact Us", description: "Talk to our learning team", icon: MessageCircle },
];

const RESOURCE_LINKS: readonly MenuLink[] = [
  { href: "/faqs", label: "FAQ", description: "Answers to your questions", icon: CircleHelp },
  { href: "/classwise-flash-card", label: "Mock Tests", description: "Practise with timed tests", icon: ClipboardCheck },
  { href: "/demo-videos", label: "Demo Videos", description: "Watch short learning demos", icon: PlayCircle },
  { href: "/mcqs", label: "MCQ Practice", description: "Build confidence at your own pace", icon: ClipboardCheck },
  { href: "/pyqs", label: "PYQs", description: "Explore previous years’ papers", icon: FileText },
];

const categoryLabel = (category: string) => category.replace(/-/g, " ");

function isActiveLink(pathname: string | null, href: string) {
  return pathname === href || Boolean(pathname?.startsWith(`${href}/`));
}

function NavDropdown({ label, id, links, mobile = false, onNavigate }: {
  label: string;
  id: string;
  links: readonly MenuLink[];
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = (mobile ? "mobile-" : "desktop-") + id;
  const active = links.some((link) => link.href && isActiveLink(pathname, link.href));

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
        className={`flex cursor-pointer items-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-mid ${mobile ? "w-full justify-between px-3 py-3" : "px-4 py-3 text-sm"} ${active || open ? "bg-brand-start-soft text-brand-mid" : "text-brand-start hover:bg-surface-muted hover:text-brand-mid"}`}
      >
        {label}
        <ChevronDown aria-hidden size={14} className={`transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>
      <div
        id={menuId}
        hidden={!open}
        className={mobile ? "mb-3 space-y-1 pl-2" : "absolute right-0 top-full z-10 mt-3 w-80 rounded-2xl border border-line bg-white p-2 shadow-xl shadow-brand-start/10"}
      >
        {links.map((link) => link.href ? (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActiveLink(pathname, link.href) ? "page" : undefined}
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
            className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-brand-mid ${isActiveLink(pathname, link.href) ? "bg-brand-start-soft text-brand-mid" : "text-brand-start hover:bg-surface-muted"}`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-brand-start"><link.icon size={18} aria-hidden="true" /></span>
            <span><span className="block text-sm font-semibold">{link.label}</span><span className="mt-0.5 block text-xs text-ink-muted">{link.description}</span></span>
          </Link>
        ) : (
          <button key={link.label} type="button" disabled className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-left text-ink-muted">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted"><link.icon size={18} aria-hidden="true" /></span>
            <span><span className="block text-sm font-semibold">{link.label}</span><span className="mt-0.5 block text-xs">{link.description}</span></span>
          </button>
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
    <header className="sticky inset-x-0 top-0 z-50 border-b border-brand-start/10 bg-white/95 shadow-sm shadow-brand-start/5 backdrop-blur-xl">
      {promoVisible && topbar && <TopBannerView ad={topbar} onClose={() => setPromoVisible(false)} />}

      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[88px] lg:px-8">
        <Link href="/" aria-label="Zenith Learning home" className="flex shrink-0 items-center">
          <span className="relative block h-16 w-40 overflow-hidden sm:w-48">
            <Image src="/zenith-logo.png" alt="Zenith Learning" fill unoptimized preload sizes="192px" className="scale-[1.35] object-contain" />
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          <div
            className="relative flex"
            onMouseEnter={() => setCoursesOpen(true)}
            onMouseLeave={() => setCoursesOpen(false)}
            onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setCoursesOpen(false); }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setCoursesOpen(false);
                event.currentTarget.querySelector("button")?.focus();
              }
            }}
          >
            <Link href="/course" aria-current={isActiveLink(pathname, "/course") ? "page" : undefined} onClick={() => setCoursesOpen(false)} className="flex items-center rounded-full py-3 pl-4 pr-1 text-sm font-semibold text-brand-start transition hover:text-brand-mid focus-visible:outline-2 focus-visible:outline-brand-mid">
              Courses
            </Link>
            <button type="button" aria-label="Browse course categories" aria-expanded={coursesOpen} aria-controls="desktop-course-links" onClick={() => setCoursesOpen(value => !value)} className="cursor-pointer rounded-full px-2 text-brand-start focus-visible:outline-2 focus-visible:outline-brand-mid"><ChevronDown size={14} aria-hidden="true" className={coursesOpen ? "rotate-180" : ""} /></button>
            {coursesOpen && selectedGroup && (
              <div id="desktop-course-links" className="absolute left-0 top-full z-10 grid w-[600px] max-w-[calc(100vw-2rem)] grid-cols-[200px_1fr] overflow-hidden rounded-2xl border border-line bg-white shadow-xl shadow-brand-start/10">
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
                    {categoryLabel(selectedGroup[0])} courses
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
                    View all {categoryLabel(selectedGroup[0])} courses <ArrowRight size={13} />
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
              className={`flex items-center rounded-full px-4 py-3 text-sm font-semibold transition ${ 
                isActiveLink(pathname, link.href)
                  ? "bg-brand-start-soft text-brand-mid"
                  : "text-brand-start hover:bg-surface-muted hover:text-brand-mid"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <NavDropdown label="Free Resources" id="resource-links" links={RESOURCE_LINKS} />
          <NavDropdown label="More" id="more-links" links={MORE_LINKS} />
        </nav>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => openLeadForm("navbar-start-learning")}
            className="hidden h-11 cursor-pointer items-center gap-2 rounded-full bg-accent px-5 text-sm font-bold text-brand-start transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-mid sm:flex"
          >
            Start Your Journey
            <ArrowRight size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-800 lg:hidden"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-navigation" aria-label="Mobile navigation" className="max-h-[calc(100dvh-88px)] overflow-y-auto border-t border-line bg-white p-4 shadow-xl lg:hidden">
          <Link href="/course" onClick={() => setMobileOpen(false)} className="block border-b border-slate-100 px-3 py-3 font-semibold text-slate-700">
            Courses
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
          <NavDropdown label="Free Resources" id="resource-links" links={RESOURCE_LINKS} mobile onNavigate={() => setMobileOpen(false)} />
          <NavDropdown label="More" id="more-links" links={MORE_LINKS} mobile onNavigate={() => setMobileOpen(false)} />
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              openLeadForm("navbar-start-learning");
            }}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-brand-start"
          >
            Start Your Journey
          </button>
        </nav>
      )}
    </header>
  );
}
