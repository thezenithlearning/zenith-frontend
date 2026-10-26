'use client';

import { useMemo, useRef, useState } from 'react';
import { useCourse } from '@/features/course/hooks/useCourse';
import type { ICourse } from '@/features/course/api/courseApi';
import CourseCard from './CourseCard';
import {
  Search,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  X,
} from 'lucide-react';

const EMPTY_COURSES: ICourse[] = [];

export default function CourseDiscoveryPage() {
  const { useGetCourses } = useCourse();
  const { data, isLoading, error } = useGetCourses({
    status: 'active',
    limit: 100,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const courses = data?.data ?? EMPTY_COURSES;

  const groupedCourses = useMemo(() => {
    const groups: { [key: string]: ICourse[] } = {};
    courses.forEach((course) => {
      const category = course.category || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(course);
    });
    return groups;
  }, [courses]);

  const categories = useMemo(() => {
    return Object.keys(groupedCourses).sort();
  }, [groupedCourses]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        (course.subCategory?.toLowerCase() || '').includes(query) ||
        course.keywords.some((k) => k.toLowerCase().includes(query)),
    );
  }, [courses, searchQuery]);

  const recommendedCourses = useMemo(() => {
    return [...courses]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 3);
  }, [courses]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(!!query);
  };

  const jumpToCategory = (category: string) => {
    setIsSearching(false);
    setSearchQuery('');
    window.setTimeout(() => {
      document
        .getElementById(`category-${category}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const scrollCategory = (category: string, direction: 'left' | 'right') => {
    const container = categoryRefs.current[category];
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  if (isLoading && !courses.length) {
    return (
      <div className="min-h-[60vh] bg-white py-10">
        <div className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="h-14 animate-pulse border border-gray-200 bg-gray-50" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border border-gray-200">
                <div className="aspect-16/10 bg-gray-100" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/4 rounded bg-gray-200" />
                  <div className="h-5 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-100" />
                  <div className="flex justify-between pt-3">
                    <div className="h-6 w-1/3 rounded bg-gray-200" />
                    <div className="h-8 w-1/4 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !courses.length) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-white p-4">
        <div className="max-w-md text-center">
          <p className="text-5xl">😕</p>
          <h2 className="uppercase mt-4 text-xl font-bold text-gray-900">
            Something went wrong
          </h2>
          <p className="mt-2 text-gray-500">
            Failed to load courses. Please try again later.
          </p>
          <button
            id="course-course-list-retry-button"
            onClick={() => window.location.reload()}
            className="mt-6 bg-brand-mid px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-start"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-mid">
            Course catalogue
          </p>
          <h1 className="uppercase mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
            Find your next course
          </h1>
        </div>

        <div className="relative mx-auto mt-8 max-w-2xl">
          <div className="relative flex items-center border border-gray-200 bg-white transition-colors focus-within:border-brand-mid">
            <Search className="absolute left-4 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses, categories, or skills..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-transparent py-3.5 pl-11 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                id="course-list-clear-search-input-button"
                onClick={clearSearch}
                className="absolute right-3.5 text-gray-400 transition-colors hover:text-gray-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {!isSearching && categories.length > 1 && (
          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                id={`course-list-jump-to-category-${encodeURIComponent(category)}-button`}
                key={category}
                type="button"
                onClick={() => jumpToCategory(category)}
                className="border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-brand-mid/40 hover:text-brand-mid"
              >
                <span className="uppercase">{category}</span>
              </button>
            ))}
          </div>
        )}

        {isSearching && searchResults.length > 0 && (
          <div className="mt-10">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="uppercase text-xl font-bold text-gray-900">
                  Search results for &ldquo;{searchQuery}&rdquo;
                </h2>
                <p className="text-sm text-gray-500">
                  {searchResults.length} course
                  {searchResults.length === 1 ? '' : 's'} found
                </p>
              </div>
              <button
                id="course-list-clear-search-results-button"
                onClick={clearSearch}
                className="w-fit text-sm font-semibold text-brand-mid hover:underline"
              >
                Clear search
              </button>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.slice(0, 9).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          </div>
        )}

        {isSearching && searchResults.length === 0 && (
          <div className="mt-10 border border-gray-200 p-10 text-center sm:p-14">
            <p className="text-5xl">🔍</p>
            <h3 className="uppercase mt-4 text-xl font-bold text-gray-900">
              No courses found
            </h3>
            <p className="mt-1 text-gray-500">
              Try adjusting your search terms.
            </p>
            <button
              id="course-list-clear-empty-search-button"
              onClick={clearSearch}
              className="mt-5 bg-brand-mid px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-start"
            >
              Clear search
            </button>
          </div>
        )}

        {!isSearching && recommendedCourses.length > 0 && (
          <section className="mt-14">
            <div className="mb-5 flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-brand-mid" />
              <div>
                <h2 className="uppercase text-xl font-bold text-gray-900 sm:text-2xl">
                  Recommended for you
                </h2>
                <p className="text-sm text-gray-500">
                  Our newest and most popular courses
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedCourses.map((course, index) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  priority={index === 0}
                />
              ))}
            </div>
          </section>
        )}

        {!isSearching &&
          categories.map((category) => {
            const categoryCourses = groupedCourses[category] || [];
            if (categoryCourses.length === 0) return null;

            return (
              <section
                key={category}
                id={`category-${category}`}
                className="mt-14 scroll-mt-24"
              >
                <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="uppercase text-xl font-bold text-gray-900 sm:text-2xl">
                      {category}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {categoryCourses.length} course
                      {categoryCourses.length === 1 ? '' : 's'} available
                    </p>
                  </div>
                </div>

                <div className="group/rail relative">
                  <button
                    id={`course-list-scroll-category-left-${encodeURIComponent(category)}-button`}
                    onClick={() => scrollCategory(category, 'left')}
                    aria-label={`Scroll ${category} left`}
                    className="absolute -left-4 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-gray-200 bg-white text-gray-600 opacity-0 shadow-lg transition-all hover:bg-brand-mid hover:text-white focus:opacity-100 group-hover/rail:opacity-100 sm:flex"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div
                    ref={(el) => {
                      categoryRefs.current[category] = el;
                    }}
                    className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
                  >
                    {categoryCourses.map((course) => (
                      <div
                        key={course._id}
                        className="w-70 shrink-0 snap-start sm:w-75 lg:w-[320px]"
                      >
                        <CourseCard course={course} />
                      </div>
                    ))}
                  </div>

                  <button
                    id={`course-list-scroll-category-right-${encodeURIComponent(category)}-button`}
                    onClick={() => scrollCategory(category, 'right')}
                    aria-label={`Scroll ${category} right`}
                    className="absolute -right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center border border-gray-200 bg-white text-gray-600 opacity-0 shadow-lg transition-all hover:bg-brand-mid hover:text-white focus:opacity-100 group-hover/rail:opacity-100 sm:flex"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </section>
            );
          })}

        {!isLoading && courses.length === 0 && (
          <div className="mt-10 border border-gray-200 p-10 text-center sm:p-16">
            <BookOpen className="mx-auto h-12 w-12 text-brand-mid/30" />
            <h3 className="uppercase mt-5 text-2xl font-bold text-gray-900">
              No courses available
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 sm:text-base">
              We&apos;re currently preparing new courses for you. Please
              check back later.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
