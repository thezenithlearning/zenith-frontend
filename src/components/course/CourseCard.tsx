"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Clock, ShoppingBag, Video } from "lucide-react";

import CourseThumbnail from "./CourseThumbnail";

export interface CourseCardData {
  _id: string;
  title: string;
  slug: string;
  category?: string | null;
  subCategory?: string | null;
  shortDescription?: string | null;
  heroHeadline?: string | null;
  price?: number | null;
  discountedPrice?: number | null;
  currency?: string | null;
  purchaseUrl?: string | null;
  bannerImage?: {
    url?: string | null;
    altText?: string | null;
    title?: string | null;
  } | null;
  level?: string | null;
  durationWeeks?: number | null;
  format?: string | null;
  status?: string | null;
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  "all-levels": "All levels",
};

const formatPrice = (amount: unknown, currency = "INR"): string => {
  const value = Number(amount ?? 0);

  if (!Number.isFinite(value) || value <= 0) return "Free";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${value}`;
  }
};

export default function CourseCard({
  course,
  priority = false,
}: {
  course: CourseCardData;
  priority?: boolean;
}) {
  const detailHref = `/course/${course.slug}`;

  const originalPrice = Number(course.price ?? 0);
  const discountedPrice = Number(course.discountedPrice ?? 0);

  const hasDiscount =
    originalPrice > 0 &&
    discountedPrice > 0 &&
    discountedPrice < originalPrice;

  const finalPrice = hasDiscount ? discountedPrice : originalPrice;

  const discountPct = hasDiscount
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  const level = course.level
    ? LEVEL_LABEL[String(course.level).toLowerCase().replace(/\s+/g, "-")] ??
      course.level
    : null;

  const status = course.status ?? "active";
  const purchaseUrl = course.purchaseUrl?.trim();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface p-2 shadow-sm shadow-brand-start/5 transition-all duration-300 hover:border-brand-mid/25 hover:shadow-xl hover:shadow-brand-start/10 motion-safe:hover:-translate-y-1">
      <Link href={detailHref} className="relative block overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-mid">
        <CourseThumbnail
          src={course.bannerImage?.url}
          alt={
            course.bannerImage?.altText ||
            course.bannerImage?.title ||
            course.title
          }
          title={course.bannerImage?.title || course.title}
          priority={priority}
          aspectRatio="16 / 9"
          className="[&_img]:p-0"
        />

        {status !== "active" && (
          <span className="absolute right-3 top-3 rounded-full bg-slate-900/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            {status === "upcoming" ? "Upcoming" : "Ended"}
          </span>
        )}

        {hasDiscount && (
          <span className="absolute bottom-3 right-3 rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold text-brand-start shadow-sm">
            {discountPct}% off
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-4 pt-5 pb-4 sm:px-5 sm:pb-5">
        {course.category && (
          <p className="w-fit rounded-md bg-brand-start-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-mid">
            {course.category}
          </p>
        )}

        <Link href={detailHref}>
          <h3 className="mt-3 min-h-14 text-xl font-bold leading-7 tracking-tight text-brand-start transition-colors group-hover:text-brand-mid">
            {course.title}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-ink-muted">
          {course.shortDescription ||
            course.heroHeadline ||
            `Learn practical skills with ${course.title}.`}
        </p>

        {(course.durationWeeks || course.format || level) && (
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-surface-muted px-3 py-3 text-xs font-medium text-ink-muted">
            {Boolean(course.durationWeeks) && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-brand-mid" />
                {course.durationWeeks}{" "}
                {course.durationWeeks === 1 ? "week" : "weeks"}
              </span>
            )}
            {course.format && (
              <span className="flex items-center gap-1">
                <Video className="h-3.5 w-3.5 text-brand-mid" />
                {course.format}
              </span>
            )}
            {level && (
              <span className="flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5 text-brand-mid" />
                {level}
              </span>
            )}
          </div>
        )}

        <div className="mt-5 border-t border-line-soft pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-brand-start">
              {formatPrice(finalPrice, course.currency ?? "INR")}
            </span>
            {hasDiscount && (
              <span className="text-sm text-ink-muted line-through">
                {formatPrice(originalPrice, course.currency ?? "INR")}
              </span>
            )}
          </div>

          {purchaseUrl ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href={detailHref}
                className="flex min-h-11 items-center justify-center rounded-full border border-line px-3 py-2 text-sm font-semibold text-brand-start transition-colors hover:border-brand-mid/40 hover:text-brand-mid"
              >
                Details
              </Link>
              <a
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-accent px-3 py-2 text-sm font-bold text-brand-start transition hover:brightness-110"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Buy now
              </a>
            </div>
          ) : (
            <Link
              href={detailHref}
              className="mt-4 flex min-h-12 items-center justify-between gap-2 rounded-full bg-brand-start px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-mid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-mid"
            >
              View course
              <ArrowRight aria-hidden="true" className="h-4 w-4 text-accent transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
