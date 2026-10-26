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
    <article className="group flex h-full flex-col border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-mid/30 hover:shadow-xl hover:shadow-slate-900/5">
      <Link href={detailHref} className="relative block">
        <CourseThumbnail
          src={course.bannerImage?.url}
          alt={
            course.bannerImage?.altText ||
            course.bannerImage?.title ||
            course.title
          }
          title={course.bannerImage?.title || course.title}
          priority={priority}
        />

        {status !== "active" && (
          <span className="absolute right-3 top-3 bg-slate-900/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            {status === "upcoming" ? "Upcoming" : "Ended"}
          </span>
        )}

        {hasDiscount && (
          <span className="absolute bottom-3 right-3 bg-brand-mid px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            {discountPct}% off
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {course.category && (
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {course.category}
          </p>
        )}

        <Link href={detailHref}>
          <h3 className="mt-1.5 line-clamp-2 uppercase text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-brand-mid">
            {course.title}
          </h3>
        </Link>

        <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-gray-500">
          {course.shortDescription ||
            course.heroHeadline ||
            `Learn practical skills with ${course.title}.`}
        </p>

        {(course.durationWeeks || course.format || level) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-500">
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

        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-lg font-bold text-gray-900">
              {formatPrice(finalPrice, course.currency ?? "INR")}
            </span>
            {hasDiscount && (
              <span className="truncate text-xs text-gray-400 line-through">
                {formatPrice(originalPrice, course.currency ?? "INR")}
              </span>
            )}
          </div>

          {purchaseUrl ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href={detailHref}
                className="flex items-center justify-center border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:border-brand-mid/40 hover:text-brand-mid"
              >
                Details
              </Link>
              <a
                href={purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 bg-brand-mid px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-start"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Buy now
              </a>
            </div>
          ) : (
            <Link
              href={detailHref}
              className="mt-3 flex items-center justify-center gap-1.5 bg-brand-mid px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-start"
            >
              View course
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
