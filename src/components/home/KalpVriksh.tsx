"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import type { CourseCardData } from "@/components/course/CourseCard";
import { useGetCoursesQuery } from "@/features/course/api/courseApi";

import { Reveal } from "./ui";

/* Tree geometry lives in a 420 × 430 viewBox. Fruit spots are filled
   left branch → centre branch → right branch, so courses sorted by
   category cluster on the same side of the tree. */
const SPOTS = [
  { x: 120, y: 80 },
  { x: 60, y: 160 },
  { x: 135, y: 185 },
  { x: 210, y: 45 },
  { x: 215, y: 130 },
  { x: 300, y: 80 },
  { x: 360, y: 160 },
  { x: 290, y: 190 },
];

const LEAVES: [number, number, number][] = [
  [170, 60, -30],
  [258, 48, 25],
  [42, 110, -50],
  [380, 108, 50],
  [80, 222, 20],
  [345, 222, -20],
  [170, 240, -15],
  [255, 238, 15],
];

const TWIGS = [
  "M110 150 L60 160",
  "M110 150 L120 80",
  "M118 158 L135 185",
  "M212 95 L210 45",
  "M310 145 L300 80",
  "M310 145 L360 160",
  "M302 152 L290 190",
];

const OTHER = "More programmes";

/** Short label that fits inside a fruit, e.g. "RBI Grade B 2027" → "RBI". */
const fruitLabel = (title: string) => {
  const first = title.trim().split(/\s+/)[0] ?? title;
  return first.length > 7 ? `${first.slice(0, 6)}…` : first;
};

const priceText = (course: CourseCardData) => {
  const original = Number(course.price ?? 0);
  const discounted = Number(course.discountedPrice ?? 0);
  const value = discounted > 0 && discounted < original ? discounted : original;
  if (!Number.isFinite(value) || value <= 0) return "Free";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: course.currency || "INR", maximumFractionDigits: 0 }).format(value);
  } catch {
    return `₹${value}`;
  }
};

export default function KalpVriksh() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetCoursesQuery({ status: "active", limit: SPOTS.length, page: 1 });
  const [activeId, setActiveId] = useState<string | null>(null);

  const { courses, branches } = useMemo(() => {
    const list = ((data?.data ?? []) as CourseCardData[]).slice(0, SPOTS.length);
    // Up to three named branches (by category); anything else goes to "More programmes".
    const names: string[] = [];
    for (const c of list) {
      const cat = c.category?.trim() || OTHER;
      if (!names.includes(cat)) names.push(cat);
    }
    const top = names.filter(n => n !== OTHER).slice(0, names.length > 3 ? 2 : 3);
    const branchOf = (c: CourseCardData) => {
      const cat = c.category?.trim() || OTHER;
      return top.includes(cat) ? cat : OTHER;
    };
    const order = [...top, ...(list.some(c => branchOf(c) === OTHER) ? [OTHER] : [])];
    const sorted = [...list].sort((a, b) => order.indexOf(branchOf(a)) - order.indexOf(branchOf(b)));
    return {
      courses: sorted.map(c => ({ course: c, branch: branchOf(c) })),
      branches: order.map(name => ({ name, items: sorted.filter(c => branchOf(c) === name) })),
    };
  }, [data]);

  const active = courses.find(c => c.course._id === activeId) ?? courses[0];
  const open = (course: CourseCardData) => router.push(`/course/${course.slug}`);

  return (
    <section aria-label="Kalpavriksha course tree" className="bg-surface-muted py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-3xl border border-gray-200 bg-white px-5 py-8 text-[#1A1A1A] shadow-sm sm:px-8 sm:py-10 lg:px-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-red-700">The Kalpavriksha of learning</p>
            <h2 className="font-display text-2xl leading-snug sm:text-3xl lg:text-4xl">
              One tree. <em className="text-red-600">Every ambition within reach.</em>
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">
              The Kalpavriksha grants what you wish for. Pick the fruit that matches your goal.
            </p>

            {isLoading && (
              <div className="mt-8 grid gap-6 md:grid-cols-[1.35fr_1fr]" aria-label="Loading courses">
                <div className="aspect-[420/430] animate-pulse rounded-2xl bg-red-50" />
                <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
              </div>
            )}

            {isError && (
              <p role="alert" className="mt-8 text-center text-gray-500">
                We couldn’t load the courses.{" "}
                <button type="button" onClick={() => refetch()} className="font-semibold text-red-700 underline">Try again</button>
              </p>
            )}

            {!isLoading && !isError && courses.length === 0 && (
              <p className="mt-8 text-center text-gray-500">New courses are blossoming soon.</p>
            )}

            {active && (
              <>
                <div className="mt-6 grid items-center gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                  {/* ---------- Tree ---------- */}
                  <svg viewBox="0 0 420 430" role="img" aria-labelledby="kalp-title" className="mx-auto w-full max-w-lg">
                    <title id="kalp-title">Course tree with {courses.length} course fruits</title>
                    <ellipse cx="210" cy="412" rx="150" ry="9" fill="#F3F4F6" />
                    <g fill="#FEF1F1">
                      <circle cx="105" cy="150" r="98" />
                      <circle cx="210" cy="105" r="104" />
                      <circle cx="315" cy="150" r="98" />
                      <circle cx="210" cy="195" r="92" />
                    </g>
                    <g fill="#FBD5D5">
                      {LEAVES.map(([x, y, r]) => (
                        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="7" ry="4" transform={`rotate(${r} ${x} ${y})`} />
                      ))}
                    </g>
                    <path d="M186 412 C196 362,200 322,201 266 L219 266 C220 322,224 362,234 412 Z" fill="#2D2A2A" />
                    <g fill="none" stroke="#2D2A2A" strokeLinecap="round">
                      <path d="M210 272 C200 215,150 190,110 150" strokeWidth="9" />
                      <path d="M210 272 C220 215,270 190,310 145" strokeWidth="9" />
                      <path d="M210 272 L212 95" strokeWidth="8" />
                      <g strokeWidth="4">
                        {TWIGS.map(d => <path key={d} d={d} />)}
                      </g>
                    </g>

                    {courses.map(({ course }, i) => {
                      const { x, y } = SPOTS[i];
                      const on = course._id === active.course._id;
                      const label = fruitLabel(course.title);
                      return (
                        <g
                          key={course._id}
                          role="link"
                          tabIndex={0}
                          aria-label={`${course.title} course`}
                          className="group cursor-pointer outline-none"
                          onMouseEnter={() => setActiveId(course._id)}
                          onFocus={() => setActiveId(course._id)}
                          onClick={() => open(course)}
                          onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              open(course);
                            }
                          }}
                        >
                          <g className={`origin-center transition-transform duration-200 [transform-box:fill-box] ${on ? "scale-[1.14]" : ""}`}>
                            <circle
                              cx={x}
                              cy={y}
                              r="34"
                              fill="none"
                              strokeWidth="3"
                              className={`stroke-red-600 transition-opacity duration-200 ${on ? "opacity-35" : "opacity-0 group-focus-visible:opacity-60"}`}
                            />
                            <path d={`M${x} ${y - 27} q5 -11 13 -8 q-2 9 -13 8`} fill="#2D2A2A" />
                            <circle cx={x} cy={y} r="28" className={`transition-colors duration-200 ${on ? "fill-red-700" : "fill-red-600"}`} />
                            <text
                              x={x}
                              y={y}
                              textAnchor="middle"
                              dominantBaseline="central"
                              className="pointer-events-none fill-white font-medium"
                              style={{ fontSize: label.length > 5 ? 10 : 13 }}
                            >
                              {label}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>

                  {/* ---------- Preview card ---------- */}
                  <div aria-live="polite" className="flex min-h-72 flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                    <div>
                      <span className="inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-700">{active.branch}</span>
                      <p className="mt-2.5 font-display text-2xl leading-snug">{active.course.title}</p>
                      {(active.course.subCategory || active.course.heroHeadline) && (
                        <p className="mt-0.5 text-xs text-gray-500">{active.course.subCategory || active.course.heroHeadline}</p>
                      )}
                      <p className="mt-2.5 line-clamp-4 text-sm leading-relaxed text-gray-700">
                        {active.course.shortDescription || `Structured, mentor-led preparation for ${active.course.title}.`}
                      </p>
                    </div>
                    <div className="mt-5">
                      <Link
                        href={`/course/${active.course.slug}`}
                        className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      >
                        <span className="truncate">Explore {fruitLabel(active.course.title)} course</span>
                        <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                      </Link>
                      <p className="mt-2 text-center text-xs text-gray-500">
                        Starting at <span className="font-semibold text-gray-700">{priceText(active.course)}</span> · Click a fruit or the button
                      </p>
                      <Link href="#admissions" className="mt-2.5 block text-center text-[13px] text-red-700 hover:underline">
                        Not sure which fruit is yours? Help me choose
                      </Link>
                    </div>
                  </div>
                </div>

                {/* ---------- Branch list ---------- */}
                <div className="mt-6 grid gap-4 border-t border-gray-200 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                  {branches.map(branch => (
                    <div key={branch.name}>
                      <p className="mb-1.5 text-xs text-gray-500">{branch.name}</p>
                      {branch.items.map(course => {
                        const on = course._id === active.course._id;
                        return (
                          <Link
                            key={course._id}
                            href={`/course/${course.slug}`}
                            onMouseEnter={() => setActiveId(course._id)}
                            onFocus={() => setActiveId(course._id)}
                            className={`group flex items-center gap-1.5 py-1.5 text-sm outline-none focus-visible:underline ${on ? "font-medium text-red-700" : "text-[#1A1A1A] hover:text-red-700"}`}
                          >
                            <span className="truncate">{course.title}</span>
                            <ArrowRight aria-hidden="true" className={`h-3.5 w-3.5 shrink-0 text-red-600 transition-opacity duration-200 ${on ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
