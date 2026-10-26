"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useCourseCategory } from "@/features/courseCategory/hooks/useCourseCategory";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  ChevronRight,
  FolderOpen,
  GraduationCap,
  Layers3,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

type CourseCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  image?: {
    url?: string | null;
    storageKey?: string | null;
  } | null;
  icon?: string | null;
  courseCount?: number | null;
};

const CARD_STYLES = [
  {
    gradient: "from-brand-start to-brand-end",
    glow: "bg-brand-end",
    accent: "text-brand-start-soft",
  },
  {
    gradient: "from-indigo-700 via-blue-700 to-brand-mid",
    glow: "bg-indigo-300",
    accent: "text-indigo-100",
  },
  {
    gradient: "from-amber-700 via-green-700 to-brand-start",
    glow: "bg-amber-300",
    accent: "text-amber-100",
  },
  {
    gradient: "from-amber-600 via-orange-600 to-brand-start",
    glow: "bg-amber-300",
    accent: "text-amber-100",
  },
  {
    gradient: "from-slate-700 via-slate-800 to-slate-950",
    glow: "bg-slate-300",
    accent: "text-slate-200",
  },
  {
    gradient: "from-blue-800 via-indigo-700 to-brand-mid",
    glow: "bg-blue-300",
    accent: "text-blue-100",
  },
];

const getCategoryDescription = (category: CourseCategory): string =>
  category.description?.trim() ||
  category.shortDescription?.trim() ||
  `Explore practical courses and structured learning paths in ${category.name}.`;

const getCategoryInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "C";

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

export default function CourseCategoriesPage() {
  const { useGetCourseCategories } = useCourseCategory();

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetCourseCategories();

  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo<CourseCategory[]>(() => {
    const rawCategories = data?.data;
    return Array.isArray(rawCategories) ? (rawCategories as CourseCategory[]) : [];
  }, [data]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;

    return categories.filter((category) => {
      const name = category.name?.toLowerCase() ?? "";
      const slug = category.slug?.toLowerCase() ?? "";
      const description = getCategoryDescription(category).toLowerCase();

      return name.includes(query) || slug.includes(query) || description.includes(query);
    });
  }, [categories, searchQuery]);

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
          <nav className="mb-10 flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/course" className="transition hover:text-white">
              Courses
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white/85">Categories</span>
          </nav>

          <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Explore learning paths
              </span>

              <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
                Find the right course category
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
                Browse focused learning tracks designed to help you build
                practical skills, complete real projects, and move toward
                your career goals.
              </p>
            </div>

            {!loading && !isError && categories.length > 0 && (
              <div className="flex items-center gap-4 border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                <span className="flex h-11 w-11 items-center justify-center bg-white/10">
                  <Layers3 className="h-5 w-5 text-white" />
                </span>
                <div>
                  <p className="text-2xl font-black text-white">
                    {categories.length}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/55">
                    Learning categories
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
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search course categories..."
                className="w-full border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-mid focus:bg-white focus:ring-4 focus:ring-brand-mid/10"
              />
            </div>

            <Link
              href="/course"
              className="inline-flex shrink-0 items-center justify-center gap-2 border border-gray-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-mid/40 hover:text-brand-mid"
            >
              <BookOpen className="h-4 w-4" />
              View all courses
            </Link>
          </div>
        </div>

        {isError && (
          <div className="mt-8 border border-red-200 bg-white p-8 text-center shadow-sm">
            <span className="mx-auto flex h-14 w-14 items-center justify-center bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Unable to load categories
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {error instanceof Error
                ? error.message
                : "Something went wrong while loading course categories."}
            </p>
            <button
              id="course-category-try-again-button"
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
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-68 animate-pulse bg-gray-200" />
            ))}
          </div>
        )}

        {!loading && !isError && filteredCategories.length > 0 && (
          <>
            <div className="mb-5 mt-10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  Browse categories
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {searchQuery.trim()
                    ? `${filteredCategories.length} result${filteredCategories.length === 1 ? "" : "s"} found`
                    : "Choose a category to explore its courses."}
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCategories.map((category, index) => {
                const style = CARD_STYLES[index % CARD_STYLES.length];

                return (
                  <Link
                    key={category._id || category.slug}
                    href={`/course/category/${encodeURIComponent(category.slug)}`}
                    className="group block"
                  >
                    <article
                      className={`relative flex min-h-68 flex-col overflow-hidden bg-linear-to-br ${style.gradient} p-6 text-white shadow-[0_18px_55px_-28px_rgba(15,23,42,0.75)] transition duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl`}
                    >
                      <div
                        className={`absolute -right-14 -top-14 h-36 w-36 rounded-full ${style.glow} opacity-20 blur-2xl transition duration-500 group-hover:scale-125`}
                      />
                      <div className="absolute -bottom-20 -right-12 h-48 w-48 rounded-full border border-white/10" />
                      <div className="absolute -bottom-12 -right-6 h-32 w-32 rounded-full border border-white/10" />

                      <div className="relative flex items-start justify-between">
                        <span
                          className="flex h-14 w-14 items-center justify-center border border-white/15 bg-white/10 text-lg font-black backdrop-blur"
                          style={{ borderRadius: "1rem" }}
                        >
                          {getCategoryInitials(category.name)}
                        </span>

                        <span
                          className="flex h-10 w-10 items-center justify-center border border-white/15 bg-white/10 transition duration-300 group-hover:translate-x-1 group-hover:bg-white group-hover:text-slate-900"
                          style={{ borderRadius: "9999px" }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>

                      <div className="relative mt-auto pt-10">
                        <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${style.accent}`}>
                          Course category
                        </p>
                        <h3 className="mt-2 text-xl font-black leading-tight tracking-tight">
                          {category.name}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/72">
                          {getCategoryDescription(category)}
                        </p>

                        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                          <span className="text-sm font-semibold text-white/85">
                            Explore courses
                          </span>
                          {typeof category.courseCount === "number" && category.courseCount >= 0 && (
                            <span className="bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/75">
                              {category.courseCount}{" "}
                              {category.courseCount === 1 ? "course" : "courses"}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {!loading && !isError && categories.length > 0 && filteredCategories.length === 0 && (
          <div className="mt-10 border border-gray-200 px-6 py-16 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center bg-brand-start-soft">
              <Search className="h-8 w-8 text-brand-mid" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No matching categories
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Try a different search term or browse all available categories.
            </p>
            <button
              id="course-category-clear-search-button"
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-5 bg-brand-mid px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-start"
            >
              Clear search
            </button>
          </div>
        )}

        {!loading && !isError && categories.length === 0 && (
          <div className="mt-10 border border-gray-200 px-6 py-16 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center bg-gray-100">
              <FolderOpen className="h-8 w-8 text-slate-500" />
            </span>
            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No course categories yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Categories will appear here after they are created and made
              available.
            </p>
            <Link
              href="/course"
              className="mt-5 inline-flex items-center gap-2 bg-brand-mid px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-start"
            >
              <GraduationCap className="h-4 w-4" />
              Browse courses
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
