"use client";

import { cdn } from "@/lib/cdn";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { useCourse } from "@/features/course/hooks/useCourse";
import ContentPreview from "@/components/editor/ContentPreview";
import TestimonialCarousel from "@/components/shared/TestimonialCarousel";

import type {
  ICurriculumSection,
  ITool,
  IProject,
} from "@/features/course/api/courseApi";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  CheckCircle,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Award,
  AlertCircle,
  ShoppingCart,
  Video,
  Target,
  Users,
  Briefcase,
  Globe,
  BarChart3,
  Sparkles,
  Hammer,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  XCircle,
  X,
  CalendarClock,
} from "lucide-react";

type AssetReference = {
  url?: string | null;
  storageKey?: string | null;
  title?: string | null;
  description?: string | null;
  altText?: string | null;
  caption?: string | null;
  originalName?: string | null;
  mimeType?: string | null;
};

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200";

const getRouteParam = (
  value: string | string[] | undefined,
): string => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};

/**
 * Prefer storageKey because it is the canonical field returned by the upload
 * module; `url` remains supported for existing records. Both resolve against
 * the media CDN (NEXT_PUBLIC_CDN_BASE_URL).
 */
const resolveAssetUrl = (
  asset?: AssetReference | null,
): string => {
  if (!asset) return "";

  const storageKey = asset.storageKey?.trim();
  if (storageKey) return cdn(storageKey);

  return cdn(asset.url?.trim() ?? "");
};

const formatPrice = (
  amount: unknown,
  currency = "INR",
): string => {
  const numericAmount = Number(amount ?? 0);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return "Free";
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericAmount);
  } catch {
    return `₹${numericAmount}`;
  }
};

const formatMinutes = (minutes: number): string => {
  if (!minutes) return "";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours <= 0) return `${remainingMinutes}m`;
  if (remainingMinutes <= 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}m`;
};

const normalizeCourseLevel = (value: unknown): string =>
  String(value ?? "all-levels")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  "all-levels": "All Levels",
};

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Upcoming batch",
  active: "Enrolling now",
  ended: "Batch ended",
};

const STATUS_DOT_CLASS: Record<string, string> = {
  upcoming: "text-amber-500",
  active: "text-brand-mid",
  ended: "text-gray-400",
};

const getExternalUrlLabel = (value: string): string => {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
};

/** True circle/blob helper — Tailwind's `rounded-*` classes are globally
 * flattened to a 2px radius, so organic shapes are set via inline style
 * instead of a class name containing "rounded". */
const circle = (size: number): React.CSSProperties => ({
  width: size,
  height: size,
  borderRadius: "50%",
});

const primaryButtonClass =
  "bg-brand-mid text-white transition-all hover:bg-brand-start hover:shadow-lg hover:shadow-brand-mid/30 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none";

const Eyebrow = ({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) => (
  <div>
    <span
      className="mb-3 block h-1 w-9"
      style={{
        backgroundImage:
          "linear-gradient(120deg, var(--color-brand-start), var(--color-brand-end))",
      }}
    />
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-brand-mid" />
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-mid">
        {children}
      </span>
    </div>
  </div>
);

const ToolTag = ({ tool }: { tool: ITool }) => (
  <span className="inline-flex items-center gap-2 text-[15px] font-medium text-gray-700">
    <span
      style={{ ...circle(6), background: "var(--color-brand-end)" }}
    />
    {tool.name}
  </span>
);

const Dot = ({
  tone = "brand",
}: {
  tone?: "brand" | "danger";
}) => (
  <span
    className="mt-0.5 flex shrink-0 items-center justify-center"
    style={{
      ...circle(20),
      background:
        tone === "danger" ? "#fee2e2" : "var(--color-brand-end-soft)",
    }}
  >
    {tone === "danger" ? (
      <X className="h-3 w-3 text-red-500" strokeWidth={3} />
    ) : (
      <Check className="h-3 w-3 text-brand-mid" strokeWidth={3} />
    )}
  </span>
);

export default function CourseDetailPage() {
  const params = useParams();
  const { useGetCourseBySlug } = useCourse();

  /*
   * This file lives at:
   *   src/app/(public)/course/[slug]/page.tsx
   *
   * Therefore Next.js exposes the dynamic segment as `params.slug`.
   */
  const slug = getRouteParam(
    params?.slug as string | string[] | undefined,
  );

  const [expandedCurriculum, setExpandedCurriculum] =
    useState<number | null>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  const heroSentinelRef = useRef<HTMLDivElement | null>(null);

  const {
    data: courseData,
    isLoading,
    error,
  } = useGetCourseBySlug(slug);

  const course = courseData?.data;

  const totalFacts = useMemo(() => {
    const curriculum: ICurriculumSection[] =
      course?.curriculum ?? [];

    const totalLessons = curriculum.reduce(
      (total, section) =>
        total + (section.lessons?.length ?? 0),
      0,
    );

    const totalMinutes = curriculum.reduce(
      (total, section) =>
        total +
        (section.lessons ?? []).reduce(
          (lessonTotal, lesson) =>
            lessonTotal +
            Number(lesson.durationMinutes ?? 0),
          0,
        ),
      0,
    );

    return {
      totalLessons,
      totalMinutes,
    };
  }, [course?.curriculum]);

  useEffect(() => {
    const node = heroSentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { rootMargin: "-1px 0px 0px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [course?._id]);

  if (isLoading && !course) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-mid" />
            <p className="mt-4 text-gray-500">
              Loading course details...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="max-w-md px-4 text-center">
          <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-400" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            Course Not Found
          </h3>
          <p className="mb-6 text-gray-500">
            The course you&apos;re looking for doesn&apos;t
            exist or has been removed.
          </p>
          <Link
            href="/course"
            className={`inline-flex items-center gap-2 px-6 py-2.5 font-semibold ${primaryButtonClass}`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const whatYouWillLearn = course.whatYouWillLearn ?? [];
  const curriculum: ICurriculumSection[] =
    course.curriculum ?? [];
  const tools: ITool[] = course.tools ?? [];
  const whoIsThisFor = course.whoIsThisFor ?? [];
  const notFor = course.notFor ?? [];
  const requirements = course.requirements ?? [];
  const projects: IProject[] = course.projects ?? [];
  const careerRoles = course.careerRoles ?? [];
  const certificate = course.certificate;
  const highlights = course.highlights ?? [];
  const testimonials = course.testimonials ?? [];
  const faqs = course.faqs ?? [];
  const resources = course.resources ?? [];
  const externalUrls = (course.urls ?? []).filter(Boolean);

  const originalPrice = Number(course.price ?? 0);
  const discountedPrice = Number(course.discountedPrice ?? 0);

  const hasDiscount =
    originalPrice > 0 &&
    discountedPrice > 0 &&
    discountedPrice < originalPrice;

  const finalPrice = hasDiscount
    ? discountedPrice
    : originalPrice;

  const discountPercentage = hasDiscount
    ? Math.round(
        ((originalPrice - discountedPrice) / originalPrice) *
          100,
      )
    : 0;

  const durationWeeks = Number(course.durationWeeks ?? 0);

  const duration =
    durationWeeks > 0
      ? `${durationWeeks} ${
          durationWeeks === 1 ? "week" : "weeks"
        }`
      : "Self-paced";

  const courseStatus = course.status ?? "upcoming";
  const canEnroll = courseStatus === "active";

  const heroHeadline =
    course.heroHeadline?.trim() ||
    course.shortDescription?.trim() ||
    course.title;

  const purchaseUrl = course.purchaseUrl?.trim() || "";

  const bannerUrl =
    resolveAssetUrl(course.bannerImage) || FALLBACK_BANNER;

  const level = normalizeCourseLevel(course.level);
  const levelLabel = LEVEL_LABEL[level] ?? "All Levels";

  const hasCertificate =
    Boolean(certificate) &&
    Boolean(
      certificate?.description?.trim() ||
        certificate?.requirements?.length,
    );

  const handleEnrollNow = () => {
    if (!canEnroll) return;

    if (purchaseUrl) {
      window.location.assign(purchaseUrl);
      return;
    }

    setIsEnrolling(true);

    window.setTimeout(() => {
      setIsEnrolling(false);
      setEnrollSuccess(true);

      window.setTimeout(() => {
        setEnrollSuccess(false);
      }, 3000);
    }, 1200);
  };

  const getActionLabel = (): string => {
    if (courseStatus === "upcoming") return "Coming Soon";
    if (courseStatus === "ended") return "Course Ended";
    if (isEnrolling) return "Enrolling...";
    if (enrollSuccess) return "Enrolled!";
    return purchaseUrl ? "Buy Now" : "Enroll Now";
  };

  const actionLabel = getActionLabel();

  const actionContent = (
    <>
      {isEnrolling ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : enrollSuccess ? (
        <CheckCircle className="h-4 w-4" />
      ) : courseStatus === "upcoming" ? (
        <CalendarClock className="h-4 w-4" />
      ) : courseStatus === "ended" ? (
        <XCircle className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {actionLabel}
    </>
  );

  const ctaButton = purchaseUrl && canEnroll ? (
    <a
      href={purchaseUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] font-semibold ${primaryButtonClass}`}
    >
      {actionContent}
    </a>
  ) : (
    <button
      id="course-slug-detail-enroll-now-button"
      type="button"
      onClick={handleEnrollNow}
      disabled={!canEnroll || isEnrolling}
      className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] font-semibold ${primaryButtonClass}`}
    >
      {actionContent}
    </button>
  );

  const metaRow = (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
      <span className="flex items-center gap-1.5">
        <Clock className="h-4 w-4 text-brand-mid" />
        {duration}
      </span>
      <span className="flex items-center gap-1.5">
        <BarChart3 className="h-4 w-4 text-brand-mid" />
        {levelLabel}
      </span>
      {course.language && (
        <span className="flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-brand-mid" />
          {course.language}
        </span>
      )}
      {course.format && (
        <span className="flex items-center gap-1.5">
          <Video className="h-4 w-4 text-brand-mid" />
          {course.format}
        </span>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-white">

      {/* Sticky purchase bar — replaces a floating sidebar card */}
      <div
        className={`fixed inset-x-0 top-0 z-50 hidden border-b border-gray-100 bg-white/95 backdrop-blur transition-transform duration-300 lg:flex ${
          pastHero ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-3">
          <p className="min-w-0 truncate text-sm font-semibold uppercase text-gray-800">
            {course.title}
          </p>
          <div className="flex shrink-0 items-center gap-5">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(finalPrice, course.currency)}
              {hasDiscount && (
                <span className="ml-2 text-xs font-medium text-gray-400 line-through">
                  {formatPrice(originalPrice, course.currency)}
                </span>
              )}
            </span>
            {purchaseUrl && canEnroll ? (
              <a
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold ${primaryButtonClass}`}
              >
                {actionLabel}
              </a>
            ) : (
              <button
                id="course-detail-sticky-top-enroll-now-button"
                type="button"
                onClick={handleEnrollNow}
                disabled={!canEnroll || isEnrolling}
                className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold ${primaryButtonClass}`}
              >
                {actionLabel}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-40 hidden blur-3xl md:block"
          style={{
            ...circle(460),
            background:
              "radial-gradient(circle, var(--color-brand-end) 0%, transparent 70%)",
            opacity: 0.22,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 bottom-0 hidden blur-3xl md:block"
          style={{
            ...circle(320),
            background:
              "radial-gradient(circle, var(--color-brand-mid) 0%, transparent 70%)",
            opacity: 0.14,
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pt-14 lg:px-8">
          <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-400">
            <Link href="/" className="transition-colors hover:text-brand-mid">
              Home
            </Link>
            <span>/</span>
            <Link href="/course" className="transition-colors hover:text-brand-mid">
              Courses
            </Link>
            <span>/</span>
            <span className="truncate uppercase text-gray-500">
              {course.title}
            </span>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {course.category && (
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                    {course.category}
                  </span>
                )}
                {course.subCategory && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-mid">
                      {course.subCategory}
                    </span>
                  </>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <span
                    style={{
                      ...circle(6),
                      backgroundColor: "currentColor",
                    }}
                    className={
                      STATUS_DOT_CLASS[courseStatus] ??
                      STATUS_DOT_CLASS.upcoming
                    }
                  />
                  {STATUS_LABEL[courseStatus] ?? "Upcoming batch"}
                </span>
              </div>

              <h1 className="mt-4 uppercase text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 md:text-5xl">
                {course.title}
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
                {heroHeadline}
              </p>

              {course.shortDescription &&
                course.shortDescription.trim() !==
                  heroHeadline.trim() && (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500">
                    {course.shortDescription}
                  </p>
                )}

              <div className="mt-6">{metaRow}</div>

              <div className="mt-9 flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-3xl font-extrabold text-gray-900">
                    {formatPrice(finalPrice, course.currency)}
                  </span>
                  {hasDiscount && (
                    <span className="ml-3 text-base text-gray-400 line-through">
                      {formatPrice(originalPrice, course.currency)}
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="ml-2 text-sm font-semibold text-brand-mid">
                      Save {discountPercentage}%
                    </span>
                  )}
                </div>
                {ctaButton}
              </div>

              <p className="mt-4 text-xs text-gray-400">
                Secure checkout · Lifetime access on any device
                {hasCertificate && " · Certificate on completion"}
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div
                aria-hidden
                className="absolute -bottom-6 -right-6 h-full w-full"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end))",
                  opacity: 0.9,
                  borderRadius: "3.5rem 1rem 3.5rem 1rem",
                }}
              />

              <div className="relative">
                <div
                  className="relative overflow-hidden bg-gradient-to-br from-brand-start-soft to-brand-end-soft shadow-2xl shadow-brand-mid/20"
                  style={{ borderRadius: "3.5rem 1rem 3.5rem 1rem", aspectRatio: "4 / 3" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={bannerUrl}
                    alt={course.bannerImage?.altText || course.bannerImage?.title || course.title}
                    title={course.bannerImage?.title || course.title}
                    data-description={course.bannerImage?.description || undefined}
                    className="absolute inset-0 h-full w-full object-contain p-4"
                  />
                </div>

                {hasDiscount ? (
                  <div
                    className="absolute -bottom-5 left-5 flex items-center gap-2 bg-white px-4 py-2.5 shadow-xl"
                    style={{ borderRadius: "9999px" }}
                  >
                    <span style={{ ...circle(8), background: "var(--color-brand-mid)" }} />
                    <span className="text-sm font-bold text-gray-900">
                      Save {discountPercentage}% today
                    </span>
                  </div>
                ) : (
                  <div
                    className="absolute -bottom-5 left-5 flex items-center gap-2 bg-white px-4 py-2.5 shadow-xl"
                    style={{ borderRadius: "9999px" }}
                  >
                    <Award className="h-4 w-4 text-brand-mid" />
                    <span className="text-sm font-bold text-gray-900">
                      {levelLabel} · {duration}
                    </span>
                  </div>
                )}
              </div>

              {course.bannerImage?.caption && (
                <p className="mt-8 text-center text-xs text-gray-400">
                  {course.bannerImage.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div ref={heroSentinelRef} />

      {/* ---------------------------------------------------------------- */}
      {/* Highlights strip                                                  */}
      {/* ---------------------------------------------------------------- */}
      {highlights.length > 0 && (
        <section className="relative overflow-hidden bg-brand-gradient">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-24 blur-3xl"
            style={{
              ...circle(280),
              background: "#ffffff",
              opacity: 0.08,
            }}
          />
          <div className="relative mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-max divide-x divide-white/15 py-8">
              {highlights.map((highlight, index) => (
                <div
                  key={`${highlight.label}-${index}`}
                  className="min-w-37.5 px-6 first:pl-0 last:pr-0"
                >
                  <p className="text-2xl font-bold text-white">
                    {highlight.value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-white/60">
                    {highlight.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* What you'll learn                                                 */}
      {/* ---------------------------------------------------------------- */}
      {whatYouWillLearn.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <Eyebrow icon={Sparkles}>What you will learn</Eyebrow>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Skills you&apos;ll walk away with
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {whatYouWillLearn.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex items-start gap-3"
              >
                <Dot />
                <p className="text-[15px] leading-relaxed text-gray-600">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Curriculum                                                        */}
      {/* ---------------------------------------------------------------- */}
      {curriculum.length > 0 && (
        <section className="bg-surface-muted py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <Eyebrow icon={CalendarClock}>Program structure</Eyebrow>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                  Course curriculum
                </h2>
              </div>
              <p className="text-sm text-gray-500">
                {curriculum.length} section
                {curriculum.length === 1 ? "" : "s"}
                {totalFacts.totalLessons > 0 &&
                  ` · ${totalFacts.totalLessons} lessons`}
                {totalFacts.totalMinutes > 0 &&
                  ` · ${formatMinutes(totalFacts.totalMinutes)} total`}
              </p>
            </div>

            <div>
              {curriculum.map((section, index) => {
                const isOpen = expandedCurriculum === index;
                const lessons = section.lessons ?? [];
                const sectionTools = section.tools ?? [];

                return (
                  <div
                    key={`${section.title}-${index}`}
                    className="border-b border-gray-200 first:border-t"
                  >
                    <button
                      id={`course-detail-toggle-curriculum-section-${index}-button`}
                      type="button"
                      onClick={() =>
                        setExpandedCurriculum(isOpen ? null : index)
                      }
                      className="group flex w-full items-center gap-5 py-5 text-left"
                    >
                      <span
                        className={`w-11 shrink-0 text-2xl font-bold transition-colors md:text-3xl ${
                          isOpen ? "text-brand-mid" : "text-gray-300 group-hover:text-brand-mid/70"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="min-w-0 flex-1">
                        {section.label && (
                          <span className="mb-0.5 block text-xs font-semibold uppercase tracking-wide text-brand-mid">
                            {section.label}
                          </span>
                        )}
                        <span className="block truncate font-semibold text-gray-900 md:text-lg">
                          {section.title}
                        </span>
                      </div>

                      {lessons.length > 0 && (
                        <span className="hidden shrink-0 text-xs text-gray-400 sm:inline">
                          {lessons.length} lesson
                          {lessons.length === 1 ? "" : "s"}
                        </span>
                      )}

                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="ml-16 space-y-4 border-l-2 border-brand-mid/20 pb-8 pl-6">
                        {section.description && (
                          <p className="text-sm leading-relaxed text-gray-600">
                            {section.description}
                          </p>
                        )}

                        {section.youBuild && (
                          <div className="flex items-start gap-2.5 text-sm text-gray-700">
                            <Hammer className="mt-0.5 h-4 w-4 shrink-0 text-brand-mid" />
                            <p>
                              <span className="font-semibold text-gray-900">
                                You build:{" "}
                              </span>
                              {section.youBuild}
                            </p>
                          </div>
                        )}

                        {sectionTools.length > 0 && (
                          <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {sectionTools.map((tool, toolIndex) => (
                              <span
                                key={`${tool}-${toolIndex}`}
                                className="text-xs font-medium text-gray-500"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}

                        {lessons.length > 0 && (
                          <div className="space-y-2.5">
                            {lessons.map((lesson, lessonIndex) => (
                              <div
                                key={`${lesson.title}-${lessonIndex}`}
                                className="flex items-center justify-between gap-3"
                              >
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <Video className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                                  <span className="truncate text-sm text-gray-600">
                                    {lesson.title}
                                  </span>
                                  {lesson.isPreview && (
                                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-brand-mid">
                                      Preview
                                    </span>
                                  )}
                                </div>
                                {Number(lesson.durationMinutes ?? 0) > 0 && (
                                  <span className="shrink-0 text-xs text-gray-400">
                                    {formatMinutes(Number(lesson.durationMinutes))}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Tools                                                             */}
      {/* ---------------------------------------------------------------- */}
      {tools.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
            Tools you&apos;ll use
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {tools.map((tool, index) => (
              <ToolTag key={`${tool.name}-${index}`} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Who / requirements / not for                                      */}
      {/* ---------------------------------------------------------------- */}
      {(whoIsThisFor.length > 0 ||
        requirements.length > 0 ||
        notFor.length > 0) && (
        <section className="bg-surface-muted py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-3">
              {whoIsThisFor.length > 0 && (
                <div>
                  <Eyebrow icon={Users}>Who this is for</Eyebrow>
                  <ul className="mt-4 space-y-3">
                    {whoIsThisFor.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex items-start gap-2.5"
                      >
                        <Dot />
                        <span className="text-sm leading-relaxed text-gray-600">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {requirements.length > 0 && (
                <div className="md:border-l md:border-gray-200 md:pl-10">
                  <Eyebrow icon={ShieldCheck}>Requirements</Eyebrow>
                  <ul className="mt-4 space-y-3">
                    {requirements.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex items-start gap-2.5"
                      >
                        <span
                          className="mt-2 shrink-0"
                          style={{
                            ...circle(5),
                            background: "var(--color-brand-mid)",
                          }}
                        />
                        <span className="text-sm leading-relaxed text-gray-600">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {notFor.length > 0 && (
                <div className="md:border-l md:border-gray-200 md:pl-10">
                  <Eyebrow icon={XCircle}>Not the right fit if</Eyebrow>
                  <ul className="mt-4 space-y-3">
                    {notFor.map((item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex items-start gap-2.5"
                      >
                        <Dot tone="danger" />
                        <span className="text-sm leading-relaxed text-gray-600">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Projects                                                          */}
      {/* ---------------------------------------------------------------- */}
      {projects.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <Eyebrow icon={Target}>Applied learning</Eyebrow>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              What you&apos;ll build
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
            {projects.map((project, index) => (
              <div key={`${project.title}-${index}`} className="flex gap-4">
                <span className="w-9 shrink-0 text-xl font-bold text-gray-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Certificate + career roles                                       */}
      {/* ---------------------------------------------------------------- */}
      {(hasCertificate || careerRoles.length > 0) && (
        <section className="bg-surface-muted py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2">
              {hasCertificate && (
                <div>
                  <Eyebrow icon={Award}>Certificate</Eyebrow>
                  {certificate?.description && (
                    <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
                      {certificate.description}
                    </p>
                  )}
                  {(certificate?.requirements?.length ?? 0) > 0 && (
                    <ul className="mt-4 space-y-2.5">
                      {certificate?.requirements?.map((requirement, index) => (
                        <li
                          key={`${requirement}-${index}`}
                          className="flex items-start gap-2.5"
                        >
                          <Dot />
                          <span className="text-sm text-gray-600">
                            {requirement}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {careerRoles.length > 0 && (
                <div className="md:border-l md:border-gray-200 md:pl-10">
                  <Eyebrow icon={Briefcase}>Where this leads</Eyebrow>
                  <p className="mt-4 text-[15px] leading-relaxed text-gray-600">
                    {careerRoles.map((role, index) => (
                      <span key={`${role}-${index}`}>
                        {role}
                        {index < careerRoles.length - 1 ? (
                          <span className="text-gray-300"> · </span>
                        ) : null}
                      </span>
                    ))}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Resources + external links                                       */}
      {/* ---------------------------------------------------------------- */}
      {(resources.length > 0 || externalUrls.length > 0) && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            {resources.length > 0 && (
              <div>
                <Eyebrow icon={Download}>Course resources</Eyebrow>
                <div className="mt-5 space-y-4">
                  {resources.map((resource, index) => {
                    const resourceUrl = resolveAssetUrl(resource.file);
                    const isImage =
                      resource.type === "image" ||
                      resource.file?.mimeType?.startsWith("image/");

                    return (
                      <a
                        key={`${resource.name}-${index}`}
                        href={resourceUrl || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={resource.file?.title || resource.name || undefined}
                        className="group flex items-center gap-3.5"
                      >
                        {isImage ? (
                          <ImageIcon className="h-4 w-4 shrink-0 text-gray-400" />
                        ) : (
                          <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                        )}
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700 group-hover:text-brand-mid">
                          {resource.name ||
                            resource.file?.title ||
                            resource.file?.originalName ||
                            `Resource ${index + 1}`}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-mid" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {externalUrls.length > 0 && (
              <div>
                <Eyebrow icon={ExternalLink}>Useful references</Eyebrow>
                <div className="mt-5 space-y-4">
                  {externalUrls.map((url, index) => (
                    <a
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3.5"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700 group-hover:text-brand-mid">
                        {getExternalUrlLabel(url)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Testimonials                                                      */}
      {/* ---------------------------------------------------------------- */}
      {testimonials.length > 0 && (
        <div className="bg-surface-muted">
          <TestimonialCarousel
            testimonials={testimonials}
            title="What Our Learners Say"
            subtitle={`Success stories from the ${course.title} program`}
          />
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* FAQ                                                               */}
      {/* ---------------------------------------------------------------- */}
      {faqs.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <Eyebrow icon={AlertCircle}>Good to know</Eyebrow>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Frequently asked questions
            </h2>
          </div>

          <div>
            {faqs.map((faq, index) => (
              <div
                key={`${faq.question}-${index}`}
                className="border-b border-gray-200 first:border-t"
              >
                <button
                  id={`course-detail-toggle-faq-${index}-button`}
                  type="button"
                  onClick={() =>
                    setOpenFaq(openFaq === index ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <h3 className="font-medium text-gray-900">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFaq === index && (
                  <p className="max-w-3xl pb-5 text-sm leading-relaxed text-gray-600">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* CMS content                                                       */}
      {/* ---------------------------------------------------------------- */}
      {course.cms && (
        <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
          <ContentPreview html={course.cms} />
        </section>
      )}

      {/* Mobile sticky purchase bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 shadow-lg md:hidden">
        <div>
          <p className="text-base font-bold text-gray-900">
            {formatPrice(finalPrice, course.currency)}
          </p>
          {hasDiscount && (
            <p className="text-xs text-gray-500 line-through">
              {formatPrice(originalPrice, course.currency)}
            </p>
          )}
        </div>

        {purchaseUrl && canEnroll ? (
          <a
            href={purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-2.5 font-semibold ${primaryButtonClass}`}
          >
            <ShoppingCart className="h-4 w-4" />
            Buy Now
          </a>
        ) : (
          <button
            id="course-detail-sticky-enroll-now-button"
            type="button"
            onClick={handleEnrollNow}
            disabled={!canEnroll || isEnrolling}
            className={`inline-flex items-center gap-2 px-6 py-2.5 font-semibold ${primaryButtonClass}`}
          >
            {actionContent}
          </button>
        )}
      </div>

      <div className="h-16 md:hidden" />
    </main>
  );
}
