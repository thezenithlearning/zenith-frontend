"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import CourseCard from "@/components/course/CourseCard";
import { useGetCoursesQuery } from "@/features/course/api/courseApi";

import { Reveal } from "./ui";

export default function HomeCourses() {
  const { data, isLoading, isError, refetch } = useGetCoursesQuery({ status: "active", limit: 6, page: 1 });
  const courses = data?.data ?? [];
  return (
    <section id="courses" className="bg-surface-muted pb-16 pt-8 sm:pb-24 sm:pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-3xl">
            <p className="mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-mid"><span aria-hidden="true" className="h-0.5 w-8 bg-accent" />Find your direction</p>
            <h2 className="font-display text-3xl font-medium leading-[1.15] tracking-tight text-brand-start sm:text-4xl lg:text-[2.75rem]">
              Big ambitions. <span className="text-brand-mid">The right course.</span>
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Live, mentor-led programs across international curricula, school academics and competitive exams.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: 3 }, (_, i) => <div key={i} className="h-96 animate-pulse rounded-3xl bg-brand-start-soft" aria-label="Loading courses" />)}
          {isError && <div role="alert" className="col-span-full py-8 text-center text-ink-muted">We couldn’t load the courses. <button type="button" onClick={() => refetch()} className="font-semibold text-brand-mid underline">Try again</button></div>}
          {!isLoading && !isError && courses.length === 0 && <p className="col-span-full py-8 text-center text-ink-muted">New courses are coming soon.</p>}
          {courses.map((course, i) => (
            <Reveal key={course._id} delay={0.05 * (i % 3)} className="h-full">
              <CourseCard course={course} />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/course"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-start px-7 text-sm font-bold text-white transition hover:bg-brand-mid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-mid"
          >
            View all courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
