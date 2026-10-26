"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { useGetCoursesQuery } from "@/features/course/api/courseApi";
import CourseCard, { type CourseCardData } from "@/components/course/CourseCard";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Tag,
  X,
} from "lucide-react";

type CourseListItem = CourseCardData & {
  language?: string | null;
  heroHeadline?: string | null;
};

const ITEMS_PER_PAGE = 9;

const getRouteParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};

const toSlug = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toTitle = (slug: string): string =>
  slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function CategoryCoursesPage() {
  const params = useParams<{ category: string | string[] }>();

  /*
   * Route:
   * src/app/(public)/course/category/[category]/page.tsx
   *
   * The dynamic parameter must be read from `params.category`.
   */
  const rawCategory = getRouteParam(params?.category);

  let decodedCategory = rawCategory;
  try {
    decodedCategory = decodeURIComponent(rawCategory);
  } catch {
    // Keep the original value when the route segment is malformed.
  }

  const categoryQuery = decodedCategory.trim();
  const categorySlug = toSlug(categoryQuery);
  const categoryName = toTitle(categorySlug);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, isFetching, error, refetch } = useGetCoursesQuery(
    {
      page: 1,
      limit: 100,
      category: categoryQuery,
      status: "active",
    },
    { skip: !categoryQuery },
  );

  const returnedCourses = useMemo<CourseListItem[]>(() => {
    const rawCourses = data?.data;
    return Array.isArray(rawCourses) ? (rawCourses as CourseListItem[]) : [];
  }, [data]);

  /*
   * The API is already queried with the category route value.
   * This second check prevents unrelated records from appearing if a backend
   * query implementation ever returns a broader result set.
   */
  const categoryCourses = useMemo(
    () =>
      returnedCourses.filter(
        (course) => toSlug(course.category) === categorySlug,
      ),
    [returnedCourses, categorySlug],
  );

  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return categoryCourses;

    return categoryCourses.filter((course) => {
      const searchableValues = [
        course.title,
        course.shortDescription,
        course.heroHeadline,
        course.category,
        course.subCategory,
        course.level,
        course.language,
        course.format,
      ];

      return searchableValues.some((value) =>
        String(value ?? "").toLowerCase().includes(query),
      );
    });
  }, [categoryCourses, searchTerm]);

  const totalCourses = filteredCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalCourses / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCourses = filteredCourses.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    // Resets pagination whenever the search term or the route's category
    // changes — an external-input reaction, not a same-render derivation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, categorySlug]);

  useEffect(() => {
    if (currentPage > totalPages) {
      // Clamps the page after the result set shrinks (e.g. search narrows
      // it) and the current page would otherwise be out of range.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };

  const loading = isLoading || isFetching;

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-brand-gradient">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)",
            opacity: 0.15,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)",
            opacity: 0.1,
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pb-24 lg:px-8">
          <nav className="mb-10 flex flex-wrap items-center gap-2 text-sm text-white/60">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/course" className="transition hover:text-white">
              Courses
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/course/category"
              className="transition hover:text-white"
            >
              Categories
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white/85">{categoryName}</span>
          </nav>

          <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
                <Tag className="h-3.5 w-3.5" />
                {categoryName}
              </span>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Master {categoryName}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                Explore focused {categoryName} courses with practical
                lessons, real projects, and career-ready learning outcomes.
              </p>
            </div>

            {!loading && !error && (
              <div className="flex items-center gap-4 border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                <span className="flex h-11 w-11 items-center justify-center bg-white/10">
                  <BookOpen className="h-5 w-5 text-white" />
                </span>
                <div>
                  <p className="text-2xl font-black text-white">
                    {categoryCourses.length}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/55">
                    Active courses
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-10 max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="border border-gray-200 bg-white p-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.4)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xl">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={`Search ${categoryName} courses...`}
                className="w-full border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-mid focus:bg-white focus:ring-4 focus:ring-brand-mid/10"
              />
              {searchTerm && (
                <button
                  id="course-category-category-detail-clear-search-button"
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/course/category"
                className="inline-flex items-center justify-center gap-2 border border-gray-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-mid/40 hover:text-brand-mid"
              >
                <ArrowLeft className="h-4 w-4" />
                All categories
              </Link>

              <Link
                href="/course"
                className="inline-flex items-center justify-center gap-2 bg-brand-mid px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-start"
              >
                Browse all courses
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 border border-red-200 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto flex h-14 w-14 items-center justify-center bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Unable to load courses
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {error instanceof Error
                ? error.message
                : `Failed to load ${categoryName} courses.`}
            </p>
            <button
              id="course-category-category-detail-try-again-button"
              type="button"
              onClick={() => refetch()}
              className="mt-5 inline-flex items-center gap-2 bg-brand-mid px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-start"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="overflow-hidden border border-gray-200">
                <div className="aspect-16/10 animate-pulse bg-gray-100" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-gray-100" />
                  <div className="h-9 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 mt-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-mid">
                  Category courses
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  {categoryName} courses
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {searchTerm.trim()
                    ? `${totalCourses} matching course${totalCourses === 1 ? "" : "s"}`
                    : `${categoryCourses.length} active course${categoryCourses.length === 1 ? "" : "s"} available`}
                </p>
              </div>

              {searchTerm && (
                <span className="inline-flex w-fit items-center gap-2 bg-brand-start-soft px-3 py-1.5 text-xs font-semibold text-brand-mid">
                  Search: &ldquo;{searchTerm}&rdquo;
                  <button
                    id="course-category-remove-search-filter-button"
                    type="button"
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>

            {paginatedCourses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paginatedCourses.map((course, index) => (
                  <CourseCard key={course._id} course={course} priority={index < 3} />
                ))}
              </div>
            ) : (
              <div className="border border-gray-200 px-6 py-16 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center bg-brand-start-soft">
                  {searchTerm ? (
                    <Search className="h-8 w-8 text-brand-mid" />
                  ) : (
                    <BookOpen className="h-8 w-8 text-brand-mid" />
                  )}
                </span>
                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  {searchTerm ? "No matching courses" : `No ${categoryName} courses yet`}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {searchTerm
                    ? "Try a different search term to find a course in this category."
                    : "There are currently no active courses available in this category."}
                </p>
                {searchTerm ? (
                  <button
                    id="course-category-clear-empty-search-button"
                    type="button"
                    onClick={clearSearch}
                    className="mt-5 bg-brand-mid px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-start"
                  >
                    Clear search
                  </button>
                ) : (
                  <Link
                    href="/course/category"
                    className="mt-5 inline-flex items-center gap-2 bg-brand-mid px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-start"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Browse categories
                  </Link>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{" "}
                  <span className="font-semibold text-slate-700">
                    {Math.min(startIndex + ITEMS_PER_PAGE, totalCourses)}
                  </span>{" "}
                  of <span className="font-semibold text-slate-700">{totalCourses}</span>{" "}
                  courses
                </p>

                <div className="flex items-center gap-2">
                  <button
                    id="course-category-category-detail-previous-page-button"
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="flex h-10 w-10 items-center justify-center border border-gray-200 text-slate-600 transition hover:border-brand-mid/40 hover:text-brand-mid disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="min-w-29.5 text-center text-sm font-semibold text-slate-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    id="course-category-category-detail-next-page-button"
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-10 w-10 items-center justify-center border border-gray-200 text-slate-600 transition hover:border-brand-mid/40 hover:text-brand-mid disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
