'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useBlog } from '@/features/blog/hooks/useBlog';
import { useCourse } from '@/features/course/hooks/useCourse';
import {
  CalendarIcon,
  UserIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  BookOpenIcon,
  TagIcon,
  ClockIcon,
  AcademicCapIcon,
  PlusIcon,
  MinusIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';


// ============================================
// FAQ COMPONENT - Direct Q&A Display
// ============================================

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mt-8 sm:mt-10 md:mt-12 border-t border-gray-200 pt-6 sm:pt-8 md:pt-10">
      <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border-b border-gray-200 pb-3 sm:pb-4"
          >
            <button
              id={`blog-detail-toggle-faq-${index}-button`}
              onClick={() => toggleFAQ(index)}
              className="w-full text-left flex items-center justify-between gap-4 py-2 hover:text-[#2147a8] transition-colors duration-200"
            >
              <h3 className="text-sm sm:text-base font-medium text-gray-900 flex-1">
                {faq.question}
              </h3>
              <span className="flex-shrink-0 ml-4">
                {openIndex === index ? (
                  <MinusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2147a8]" />
                ) : (
                  <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2147a8]" />
                )}
              </span>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-[1000px]' : 'max-h-0'
              }`}
            >
              <div className="pt-2 pb-1">
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// BLOG DETAIL PAGE
// ============================================

const BlogDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string || '';

  const { useGetBlogBySlug, useGetBlogs } = useBlog();
  const { useGetCourses } = useCourse();
  const { data, isLoading, error } = useGetBlogBySlug(slug);
  const blog = data?.data;

  // Fetch related blogs - ONLY from the same category
  const { data: relatedBlogsData } = useGetBlogs({
    category: blog?.category,
    status: 'published',
    limit: 10,
  });

  // Fetch courses - filter by blog category and get only 3 latest
  const { data: coursesData } = useGetCourses({
    category: blog?.category,
    status: 'active',
    limit: 3,
  });

  // Filter out the current blog and limit to 3 latest - with proper null checks
  const relatedBlogs = useMemo(() => {
    const currentBlogId = blog?._id;
    if (!relatedBlogsData?.data || !currentBlogId) return [];

    return relatedBlogsData.data
      .filter((b) => b._id !== currentBlogId)
      .slice(0, 3);
  }, [relatedBlogsData, blog?._id]);

  // Strictly keep courses whose category matches the blog category.
  // This protects the recommendations even if the API returns mixed-category results.
  const suggestedCourses = useMemo(() => {
    if (!coursesData?.data || !blog?.category) return [];

    const normalizeCategory = (value?: string) =>
      (value || '').trim().toLowerCase().replace(/\s+/g, ' ');

    const blogCategory = normalizeCategory(blog.category);

    return coursesData.data
      .filter((course) => normalizeCategory(course.category) === blogCategory)
      .slice(0, 3);
  }, [coursesData, blog?.category]);

  // Use the first two strictly category-matched courses inside the article.
  const inlineRecommendedCourses = useMemo(() => suggestedCourses.slice(0, 2), [suggestedCourses]);

  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [processedContent, setProcessedContent] = useState<string>('');
  const [processedContentParts, setProcessedContentParts] = useState<{ first: string; second: string; third: string }>({
    first: '',
    second: '',
    third: '',
  });
  const [readingTime, setReadingTime] = useState(1);
  const [readingProgress, setReadingProgress] = useState(0);
  const articleRef = useRef<HTMLElement>(null);

  // Refs for sticky behavior
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const rightContainerRef = useRef<HTMLDivElement>(null);
  const [isLeftSticky, setIsLeftSticky] = useState(false);
  const [isRightSticky, setIsRightSticky] = useState(false);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(0);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Memoized values for performance
  const h2Headings = useMemo(() => {
    return headings.filter(h => h.level === 2);
  }, [headings]);

  // Process content to add IDs to headings for TOC
  useEffect(() => {
    const content = blog?.content;
    if (content) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      const headingElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const extractedHeadings: { id: string; text: string; level: number }[] = [];
      
      headingElements.forEach((el) => {
        const text = el.textContent?.trim() || '';
        if (text) {
          const id = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
          
          el.id = id;
          
          extractedHeadings.push({
            id,
            text,
            level: parseInt(el.tagName.charAt(1)),
          });
        }
      });
      
      setProcessedContent(tempDiv.innerHTML);

      // Split the article into three safe top-level sections so two course
      // recommendations can appear naturally around 1/3 and 2/3 of the read.
      const contentBlocks = Array.from(tempDiv.children);
      if (contentBlocks.length >= 3) {
        const firstSplitIndex = Math.max(1, Math.ceil(contentBlocks.length / 3));
        const secondSplitIndex = Math.max(firstSplitIndex + 1, Math.ceil((contentBlocks.length * 2) / 3));
        const firstContainer = document.createElement('div');
        const secondContainer = document.createElement('div');
        const thirdContainer = document.createElement('div');

        contentBlocks.forEach((block, index) => {
          const target =
            index < firstSplitIndex
              ? firstContainer
              : index < secondSplitIndex
                ? secondContainer
                : thirdContainer;
          target.appendChild(block.cloneNode(true));
        });

        setProcessedContentParts({
          first: firstContainer.innerHTML,
          second: secondContainer.innerHTML,
          third: thirdContainer.innerHTML,
        });
      } else {
        setProcessedContentParts({ first: tempDiv.innerHTML, second: '', third: '' });
      }

      // Calculate reading time from the actual article text (225 words per minute)
      const articleText = tempDiv.textContent?.trim() || '';
      const wordCount = articleText ? articleText.split(/\s+/).filter(Boolean).length : 0;
      setReadingTime(Math.max(1, Math.ceil(wordCount / 225)));
      
      // Only keep H2 headings for Table of Contents
      const h2Headings = extractedHeadings.filter(h => h.level === 2);
      setHeadings(h2Headings);
    }
  }, [blog?.content]);

  // Track reading progress within the article content only
  useEffect(() => {
    const updateReadingProgress = () => {
      const article = articleRef.current;
      if (!article) return;

      const navbarOffset = 85;
      const articleTop = article.getBoundingClientRect().top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const progressStart = articleTop - navbarOffset;
      const progressEnd = articleTop + articleHeight - window.innerHeight;
      const scrollableDistance = Math.max(progressEnd - progressStart, 1);
      const progress = ((window.scrollY - progressStart) / scrollableDistance) * 100;

      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    updateReadingProgress();
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('resize', updateReadingProgress);

    return () => {
      window.removeEventListener('scroll', updateReadingProgress);
      window.removeEventListener('resize', updateReadingProgress);
    };
  }, [processedContent, blog?.faq?.length]);

  // Track active heading on scroll - Optimized with Intersection Observer
  useEffect(() => {
    const headingElements = document.querySelectorAll('.blog-content h2[id]');
    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80px 0px',
        threshold: 0.1,
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => {
      headingElements.forEach((el) => observer.unobserve(el));
    };
  }, [processedContent]);

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate sidebar dimensions - Throttled
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const updateDimensions = () => {
      if (leftSidebarRef.current) {
        setLeftSidebarWidth(leftSidebarRef.current.offsetWidth);
      }
      if (rightSidebarRef.current) {
        setRightSidebarWidth(rightSidebarRef.current.offsetWidth);
      }
    };

    // Initial update
    updateDimensions();

    // Throttled resize handler
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [h2Headings, relatedBlogs, suggestedCourses]);

  // Handle sticky behavior for sidebars - Optimized with requestAnimationFrame
  const handleSticky = useCallback(() => {
    const navbarHeight = 85;
    const scrollY = window.scrollY;

    // Only apply sticky on desktop
    if (isMobile) {
      setIsLeftSticky(false);
      setIsRightSticky(false);
      return;
    }

    // Left sidebar sticky
    if (leftContainerRef.current && leftSidebarRef.current) {
      const containerRect = leftContainerRef.current.getBoundingClientRect();
      const containerTop = containerRect.top + scrollY;
      const sidebarHeight = leftSidebarRef.current.offsetHeight;
      const containerHeight = containerRect.height;

      const scrollPosition = scrollY + navbarHeight;
      const shouldStick = 
        scrollPosition > containerTop && 
        scrollPosition < containerTop + containerHeight - sidebarHeight &&
        containerHeight > sidebarHeight + 100;

      setIsLeftSticky(shouldStick);
    }

    // Right sidebar sticky
    if (rightContainerRef.current && rightSidebarRef.current) {
      const containerRect = rightContainerRef.current.getBoundingClientRect();
      const containerTop = containerRect.top + scrollY;
      const sidebarHeight = rightSidebarRef.current.offsetHeight;
      const containerHeight = containerRect.height;

      const scrollPosition = scrollY + navbarHeight;
      const shouldStick = 
        scrollPosition > containerTop && 
        scrollPosition < containerTop + containerHeight - sidebarHeight &&
        containerHeight > sidebarHeight + 100;

      setIsRightSticky(shouldStick);
    }
  }, [isMobile]);

  // Add scroll listener with cleanup - Optimized with requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number | null = null;
    let lastScrollY = 0;

    const scrollHandler = () => {
      const currentScrollY = window.scrollY;
      
      // Only update if scroll position changed significantly
      if (Math.abs(currentScrollY - lastScrollY) < 2) return;
      
      lastScrollY = currentScrollY;
      
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(() => {
        handleSticky();
        animationFrameId = null;
      });
    };

    // Initial call
    handleSticky();

    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', scrollHandler, { passive: true });

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', scrollHandler);
    };
  }, [handleSticky]);

  // Scroll to heading with smooth behavior
  const scrollToHeading = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveHeading(id);
      setIsTocOpen(false);
    }
  }, []);

  // Close the mobile table of contents with Escape and lock background scroll
  useEffect(() => {
    if (!isTocOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsTocOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTocOpen]);

  // ============================================
  // DYNAMIC FAQ HANDLING - FROM BACKEND
  // ============================================
  
  const getFAQs = useCallback((): FAQItem[] => {
    const blogFaqs = blog?.faq;

    if (Array.isArray(blogFaqs) && blogFaqs.length > 0) {
      return blogFaqs as FAQItem[];
    }

    return [];
  }, [blog?.faq]);

  const faqs = getFAQs();

  // Memoize sanitized content parts used around the two in-article recommendations.
  const sanitizedContentParts = useMemo(() => {
    const sanitize = (rawContent: string) => {
      if (!rawContent) return '';

      return DOMPurify.sanitize(rawContent, {
        ADD_TAGS: ['style', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
        ADD_ATTR: ['id', 'style', 'class', 'target', 'rel', 'colspan', 'rowspan'],
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onchange'],
      });
    };

    const fallbackContent = processedContent || blog?.content || '';
    const hasSplitContent =
      processedContentParts.first || processedContentParts.second || processedContentParts.third;

    if (!hasSplitContent) {
      return { first: sanitize(fallbackContent), second: '', third: '' };
    }

    return {
      first: sanitize(processedContentParts.first),
      second: sanitize(processedContentParts.second),
      third: sanitize(processedContentParts.third),
    };
  }, [processedContent, processedContentParts, blog?.content]);

  // Helper function for category URL
  const getCategoryUrl = useCallback((category: string): string => {
    if (!category) return '/blog';
   return `/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`;
  }, []);

  // Check if there are more related blogs
  const hasMoreRelatedBlogs = useMemo(() => {
    return (relatedBlogsData?.data?.length || 0) > 3;
  }, [relatedBlogsData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-6">
              <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Article not found</h2>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-[#2147a8] text-white rounded-lg hover:bg-[#0c1d4a] hover:shadow-lg hover:shadow-[#2147a8]/25 transition-all"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white w-full">
      <div
        className="fixed left-0 top-0 z-[9999] h-[4px] w-full origin-left bg-[#2147a8] pointer-events-none"
        style={{ transform: `scaleX(${readingProgress / 100})` }}
        role="progressbar"
        aria-label="Article reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(readingProgress)}
      />
      {/* Content Section - Responsive */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 md:py-8">
        <div className="w-full max-w-[1600px] mx-auto">
          {/* Breadcrumb - Responsive - Updated: Removed "Home" */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 overflow-x-auto pb-2">
            <Link href="/blog" className="hover:text-[#2147a8] transition-colors whitespace-nowrap">
              Blog
            </Link>
            {blog.category && (
              <>
                <ChevronRightIcon className="h-3 w-3 flex-shrink-0" />
                <Link 
                  href={getCategoryUrl(blog.category)}
                  className="hover:text-[#2147a8] transition-colors whitespace-nowrap"
                >
                  {blog.category}
                </Link>
              </>
            )}
            <ChevronRightIcon className="h-3 w-3 flex-shrink-0" />
            <span className="text-gray-700 truncate max-w-[100px] sm:max-w-[200px] md:max-w-[300px]">{blog.title}</span>
          </div>

          {/* Mobile Table of Contents toggle */}
          {h2Headings.length > 0 && (
            <div className="lg:hidden mb-4 sticky top-[72px] z-30">
              <button
                id="blog-detail-table-of-contents-sections-button"
                type="button"
                onClick={() => setIsTocOpen(true)}
                className="w-full inline-flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white/95 px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur hover:border-[#2147a8]/40 hover:text-[#2147a8] transition-colors"
                aria-haspopup="dialog"
                aria-expanded={isTocOpen}
                aria-controls="mobile-table-of-contents"
              >
                <span className="inline-flex items-center gap-2">
                  <Bars3BottomLeftIcon className="h-5 w-5 text-[#2147a8]" />
                  Table of Contents
                </span>
                <span className="text-xs font-medium text-gray-500">{h2Headings.length} sections</span>
              </button>
            </div>
          )}

          {/* Main Grid Layout - Responsive with stable sidebars */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 xl:gap-8 relative">
            {/* Left Sidebar - Table of Contents - In a Box */}
            <div className="hidden lg:block lg:col-span-3 xl:col-span-2 order-2 lg:order-1" ref={leftContainerRef}>
              {h2Headings.length > 0 && (
                <div 
                  ref={leftSidebarRef}
                  className={`${isLeftSticky ? 'lg:fixed lg:top-[85px]' : ''}`}
                  style={{
                    width: isLeftSticky ? `${leftSidebarWidth}px` : 'auto',
                    maxWidth: isLeftSticky ? '280px' : '100%',
                    transition: 'none',
                  }}
                >
                  {/* Table of Contents Box */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-5 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4 sticky top-0 bg-white z-10 py-1">
                      <Bars3BottomLeftIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2147a8]" />
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                        Table of Contents
                      </h3>
                    </div>
                    <nav className="space-y-0.5">
                      {h2Headings.map((heading, index) => {
                        const isActive = activeHeading === heading.id;
                        
                        return (
                          <button
                            id={`blog-detail-scroll-to-heading-${index}-button`}
                            key={index}
                            onClick={() => scrollToHeading(heading.id)}
                            className={`block w-full text-left px-2 py-1.5 rounded transition-all text-xs sm:text-sm font-medium ${
                              isActive
                                ? 'text-[#2147a8] bg-[#2147a8]/10 border-l-2 border-[#2147a8]'
                                : 'text-gray-600 hover:text-[#2147a8] hover:bg-gray-50'
                            }`}
                          >
                            <span className="line-clamp-2">{heading.text}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content - No Card, Direct Display */}
            <div className="min-w-0 lg:col-span-6 xl:col-span-7 order-1 lg:order-2">
              <article ref={articleRef}>
                <div className="p-0">
                  {/* Header - Responsive */}
                  <header className="mb-6 sm:mb-8 xl:mb-10">
                    <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                      {blog.category && (
                        <Link
                          href={getCategoryUrl(blog.category)}
                          className="inline-block bg-[#2147a8]/10 text-[#2147a8] text-xs sm:text-sm font-medium px-2.5 sm:px-3 py-1 rounded-full hover:bg-[#2147a8]/20 transition-colors"
                        >
                          {blog.category}
                        </Link>
                      )}
                    </div>

                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                      {blog.title}
                    </h1>

                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-5 leading-relaxed">
                      {blog.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center">
                        <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        {blog.postingDate
                          ? format(new Date(blog.postingDate), 'MMMM d, yyyy')
                          : format(new Date(blog.createdAt), 'MMMM d, yyyy')}
                      </span>
                      <span className="flex items-center">
                        <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        {blog.postedBy || 'Admin'}
                      </span>
                      <span className="flex items-center">
                        <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        {readingTime} min read
                      </span>
                      {blog.keyword && blog.keyword.length > 0 && (
                        <span className="flex items-center gap-1.5">
                          <TagIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {blog.keyword.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-600 text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </header>

                  {/* Dynamic HTML Content - First third */}
                  <div
                    className="blog-content-container min-w-0 overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: sanitizedContentParts.first }}
                  />

                  {/* First in-article course recommendation (~1/3 through the article) */}
                  {inlineRecommendedCourses[0] && sanitizedContentParts.second && (() => {
                    const course = inlineRecommendedCourses[0];

                    return (
                      <aside
                        className="my-8 sm:my-10 rounded-2xl border border-[#2147a8]/15 bg-gradient-to-r from-[#2147a8]/5 via-white to-[#e8b53a]/5 p-3 sm:p-4 shadow-sm"
                        aria-label="Recommended course"
                      >
                        <div className="mb-2 flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-[#2147a8]">
                          <AcademicCapIcon className="h-4 w-4" />
                          Recommended {blog.category} Course
                        </div>

                        <Link
                          href={`/course/${course.slug}`}
                          className="group flex flex-col gap-4 sm:flex-row sm:items-center"
                        >
                          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl bg-gray-100 sm:w-44 sm:flex-none">
                            {course.bannerImage?.url ? (
                              <img
                                src={course.bannerImage.url}
                                alt={course.bannerImage.altText || course.bannerImage.title || course.title}
                                title={course.bannerImage.title || course.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2147a8]/10 to-[#e8b53a]/10">
                                <AcademicCapIcon className="h-12 w-12 text-[#2147a8]/40" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#2147a8] sm:text-lg">
                              {course.title}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {course.category && (
                                <span className="rounded-full bg-[#2147a8]/10 px-2.5 py-1 text-[10px] font-medium text-[#2147a8]">
                                  {course.category}
                                </span>
                              )}
                              {course.discountedPrice && (
                                <span className="text-sm font-bold text-green-600">
                                  ₹{course.discountedPrice.toLocaleString()}
                                </span>
                              )}
                              {course.price && course.discountedPrice && course.price > course.discountedPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{course.price.toLocaleString()}
                                </span>
                              )}
                            </div>

                            <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2147a8]">
                              Explore course
                              <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </Link>
                      </aside>
                    );
                  })()}

                  {/* Dynamic HTML Content - Middle third */}
                  {sanitizedContentParts.second && (
                    <div
                      className="blog-content-container min-w-0 overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: sanitizedContentParts.second }}
                    />
                  )}

                  {/* Second in-article course recommendation (~2/3 through the article) */}
                  {inlineRecommendedCourses[1] && sanitizedContentParts.third && (() => {
                    const course = inlineRecommendedCourses[1];

                    return (
                      <aside
                        className="my-8 sm:my-10 rounded-2xl border border-[#2147a8]/15 bg-gradient-to-r from-[#2147a8]/5 via-white to-[#e8b53a]/5 p-3 sm:p-4 shadow-sm"
                        aria-label="Recommended course"
                      >
                        <div className="mb-2 flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-[#2147a8]">
                          <AcademicCapIcon className="h-4 w-4" />
                          Recommended {blog.category} Course
                        </div>

                        <Link
                          href={`/course/${course.slug}`}
                          className="group flex flex-col gap-4 sm:flex-row sm:items-center"
                        >
                          <div className="relative aspect-[2/1] w-full overflow-hidden rounded-xl bg-gray-100 sm:w-44 sm:flex-none">
                            {course.bannerImage?.url ? (
                              <img
                                src={course.bannerImage.url}
                                alt={course.bannerImage.altText || course.bannerImage.title || course.title}
                                title={course.bannerImage.title || course.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2147a8]/10 to-[#e8b53a]/10">
                                <AcademicCapIcon className="h-12 w-12 text-[#2147a8]/40" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#2147a8] sm:text-lg">
                              {course.title}
                            </h3>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              {course.category && (
                                <span className="rounded-full bg-[#2147a8]/10 px-2.5 py-1 text-[10px] font-medium text-[#2147a8]">
                                  {course.category}
                                </span>
                              )}
                              {course.discountedPrice && (
                                <span className="text-sm font-bold text-green-600">
                                  ₹{course.discountedPrice.toLocaleString()}
                                </span>
                              )}
                              {course.price && course.discountedPrice && course.price > course.discountedPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  ₹{course.price.toLocaleString()}
                                </span>
                              )}
                            </div>

                            <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2147a8]">
                              Explore course
                              <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </Link>
                      </aside>
                    );
                  })()}

                  {/* Dynamic HTML Content - Final third */}
                  {sanitizedContentParts.third && (
                    <div
                      className="blog-content-container min-w-0 overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: sanitizedContentParts.third }}
                    />
                  )}

                  {/* DYNAMIC FAQ SECTION - Direct Q&A Display */}
                  {faqs.length > 0 && (
                    <FAQSection faqs={faqs} />
                  )}
                </div>
              </article>

              {/* Back to Blog - Responsive */}
              <div className="mt-4 sm:mt-6 text-center">
                <Link
                  href="/blog"
                  className="inline-flex items-center text-[#2147a8] hover:text-[#e8b53a] font-medium transition-colors text-sm sm:text-base"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-1.5 sm:mr-2" />
                  Back to All Articles
                </Link>
              </div>
            </div>

            {/* Right Sidebar - Sticky Related Content */}
            <div className="lg:col-span-3 xl:col-span-3 order-3" ref={rightContainerRef}>
              <div 
                ref={rightSidebarRef}
                className={`${isRightSticky ? 'lg:fixed lg:top-[85px]' : ''}`}
                style={{
                  width: isRightSticky ? `${rightSidebarWidth}px` : 'auto',
                  maxWidth: isRightSticky ? '380px' : '100%',
                  transition: 'none',
                }}
              >
                <div className="space-y-4 sm:space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto pr-1 will-change-scroll">
                  {/* Suggested Blogs - Only same category - Latest 3 */}
                  {relatedBlogs.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3 sticky top-0 bg-white z-10 py-1">
                        <BookOpenIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2147a8]" />
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Related Articles
                        </h3>
                        <span className="ml-auto text-[10px] text-gray-400">{relatedBlogs.length} articles</span>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        {relatedBlogs.map((relatedBlog) => (
                          <Link
                            key={relatedBlog._id}
                            href={`/blog/${relatedBlog.slug}`}
                            className="block group"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors -mx-1.5 sm:-mx-2">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                {relatedBlog.banner?.url ? (
                                  <img
                                    src={relatedBlog.banner.url}
                                    alt={relatedBlog.banner.altText || relatedBlog.banner.title || relatedBlog.title}
                                    title={relatedBlog.banner.title || relatedBlog.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-[#2147a8]/10">
                                    <BookOpenIcon className="h-6 w-6 sm:h-7 sm:w-7 text-[#2147a8]" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs sm:text-sm text-gray-700 group-hover:text-[#2147a8] transition-colors line-clamp-2 font-medium">
                                  {relatedBlog.title}
                                </h4>
                                <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                                  <span className="text-[10px] sm:text-xs text-gray-400 flex items-center">
                                    <CalendarIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5" />
                                    {relatedBlog.postingDate
                                      ? format(new Date(relatedBlog.postingDate), 'MMM d, yyyy')
                                      : format(new Date(relatedBlog.createdAt), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                      {hasMoreRelatedBlogs && (
                        <Link
                          href={getCategoryUrl(blog.category)}
                          className="block text-center text-xs sm:text-sm text-[#2147a8] hover:text-[#e8b53a] font-medium mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100"
                        >
                          View all related articles →
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Suggested Courses - Banner Images Only - With Proper 2:1 Aspect Ratio */}
                  {suggestedCourses.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3 sticky top-0 bg-white z-10 py-1">
                        <AcademicCapIcon className="h-4 w-4 sm:h-5 sm:w-5 text-[#2147a8]" />
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Related Courses
                        </h3>
                        <span className="ml-auto text-[10px] text-gray-400">{suggestedCourses.length} courses</span>
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        {suggestedCourses.map((course) => (
                          <Link
                            key={course._id}
                            href={`/course/${course.slug}`}
                            className="block group"
                          >
                            <div className="relative rounded-lg overflow-hidden bg-gray-100 w-full">
                              {/* Course Banner Image - 2:1 Aspect Ratio (414×207px) */}
                              <div className="relative w-full pt-[50%]">
                                {course.bannerImage?.url ? (
                                  <img
                                    src={course.bannerImage.url}
                                    alt={course.bannerImage.altText || course.bannerImage.title || course.title}
                                    title={course.bannerImage.title || course.title}
                                    className="absolute inset-0 w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                    style={{
                                      objectPosition: 'center',
                                    }}
                                  />
                                ) : (
                                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2147a8]/10 to-[#e8b53a]/10">
                                    <AcademicCapIcon className="h-12 w-12 sm:h-16 sm:w-16 text-[#2147a8]/40" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Clean Gradient Overlay - No Play Button */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none">
                                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                                  <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-2 drop-shadow-lg">
                                    {course.title}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    {course.category && (
                                      <span className="text-[10px] text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                        {course.category}
                                      </span>
                                    )}
                                    {course.discountedPrice && (
                                      <span className="text-[10px] text-green-400 font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                        ₹{course.discountedPrice.toLocaleString()}
                                      </span>
                                    )}
                                    {course.price && course.discountedPrice && course.price > course.discountedPrice && (
                                      <span className="text-[9px] text-white/60 line-through bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                        ₹{course.price.toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Hover Effect - Scale Only, No Play Button */}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                            </div>
                          </Link>
                        ))}
                      </div>
                      
                      {/* View All Courses Button */}
                      <Link
                        href={`/course?category=${encodeURIComponent(blog.category || '')}`}
                        className="mt-3 sm:mt-4 w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-[#2147a8]/10 hover:bg-[#2147a8]/20 text-[#2147a8] rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
                      >
                        View All {blog.category || ''} Courses
                        <ChevronRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Table of Contents popup */}
      {isTocOpen && h2Headings.length > 0 && (
        <div
          className="fixed inset-0 z-[10000] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-toc-title"
          id="mobile-table-of-contents"
        >
          <button
            id="blog-detail-close-toc-backdrop-button"
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
            onClick={() => setIsTocOpen(false)}
            aria-label="Close table of contents"
          />

          <div className="absolute inset-x-3 top-1/2 max-h-[78vh] -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl sm:inset-x-6">
            <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-4 py-4">
              <div>
                <h2 id="mobile-toc-title" className="text-base font-bold text-gray-900">
                  Table of Contents
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">Jump to a section in this article</p>
              </div>
              <button
                id="blog-detail-close-toc-dialog-button"
                type="button"
                onClick={() => setIsTocOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close table of contents"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <nav className="max-h-[calc(78vh-78px)] overflow-y-auto p-3" aria-label="Article sections">
              {h2Headings.map((heading, index) => {
                const isActive = activeHeading === heading.id;
                return (
                  <button
                    id={`blog-detail-mobile-toc-heading-${index}-button`}
                    key={`${heading.id}-${index}`}
                    type="button"
                    onClick={() => scrollToHeading(heading.id)}
                    className={`mb-1 flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                      isActive
                        ? 'bg-[#2147a8]/10 text-[#2147a8]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#2147a8]'
                    }`}
                  >
                    <span className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-bold ${
                      isActive ? 'bg-[#2147a8] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium leading-6">{heading.text}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Global styles - Isolated to blog content only */}
      <style jsx global>{`
        /* Target only the blog content container */
        .blog-content-container {
          all: initial;
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #1a202c;
          line-height: 1.8;
          font-size: 16px;
        }

        .blog-content-container * {
          all: revert;
          font-family: inherit;
        }

        /* Heading styles */
        .blog-content-container h1 {
          font-size: 2em !important;
          font-weight: 700 !important;
          margin-top: 1.5em !important;
          margin-bottom: 0.75em !important;
          line-height: 1.3 !important;
          color: #1a202c !important;
        }

        .blog-content-container h2 {
          font-size: 1.5em !important;
          font-weight: 700 !important;
          margin-top: 1.5em !important;
          margin-bottom: 0.75em !important;
          color: #2147a8 !important;
          line-height: 1.3 !important;
          scroll-margin-top: 80px !important;
        }

        .blog-content-container h3 {
          font-size: 1.25em !important;
          font-weight: 600 !important;
          margin-top: 1.2em !important;
          margin-bottom: 0.5em !important;
          line-height: 1.4 !important;
          color: #2d3748 !important;
        }

        .blog-content-container h4 {
          font-size: 1.1em !important;
          font-weight: 600 !important;
          margin-top: 1em !important;
          margin-bottom: 0.5em !important;
          line-height: 1.4 !important;
          color: #2d3748 !important;
        }

        .blog-content-container h5,
        .blog-content-container h6 {
          font-size: 1em !important;
          font-weight: 600 !important;
          margin-top: 0.8em !important;
          margin-bottom: 0.5em !important;
          line-height: 1.4 !important;
          color: #4a5568 !important;
        }

        /* Paragraph styles */
        .blog-content-container p {
          margin-bottom: 1.2em !important;
          line-height: 1.8 !important;
          color: #374151 !important;
          font-size: 1em !important;
        }

        /* List styles */
        .blog-content-container ul,
        .blog-content-container ol {
          margin: 0.75em 0 1.2em 0 !important;
          padding-left: 1.5em !important;
        }

        .blog-content-container li {
          margin-bottom: 0.35em !important;
          line-height: 1.7 !important;
          color: #374151 !important;
        }

        .blog-content-container ul li {
          list-style-type: disc !important;
        }

        .blog-content-container ol li {
          list-style-type: decimal !important;
        }

        /* Link styles */
        .blog-content-container a {
          color: #2147a8 !important;
          text-decoration: underline !important;
          transition: color 0.2s ease !important;
        }

        .blog-content-container a:hover {
          color: #e8b53a !important;
        }

        /* Blockquote styles */
        .blog-content-container blockquote {
          border-left: 4px solid #2147a8 !important;
          padding-left: 1.2em !important;
          margin: 1.2em 0 !important;
          font-style: italic !important;
          color: #4b5563 !important;
          background: #f8fafc !important;
          padding: 1em 1.2em !important;
          border-radius: 0.5rem !important;
        }

        /* Table styles */
        .blog-content-container table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 1.5em 0 !important;
          font-size: 0.95em !important;
          overflow-x: auto !important;
          display: block !important;
        }

        .blog-content-container table thead {
          background: #f7fafc !important;
        }

        .blog-content-container table th {
          padding: 12px 16px !important;
          text-align: left !important;
          font-weight: 600 !important;
          color: #1a202c !important;
          border-bottom: 2px solid #e2e8f0 !important;
          background: #f7fafc !important;
        }

        .blog-content-container table td {
          padding: 12px 16px !important;
          border-bottom: 1px solid #e2e8f0 !important;
          color: #374151 !important;
        }

        .blog-content-container table tr:hover {
          background: #f8fafc !important;
        }

        .blog-content-container table tr:nth-child(even) {
          background: #fafafa !important;
        }

        /* Image styles */
        .blog-content-container img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 0.5rem !important;
          margin: 1.5em 0 !important;
        }

        /* Horizontal rule */
        .blog-content-container hr {
          margin: 2em 0 !important;
          border: 0 !important;
          border-top: 1px solid #e5e7eb !important;
        }

        /* Strong/Emphasis */
        .blog-content-container strong {
          font-weight: 700 !important;
          color: #1a202c !important;
        }

        .blog-content-container em {
          font-style: italic !important;
        }

        /* Code blocks */
        .blog-content-container code {
          background: #f7fafc !important;
          padding: 0.2em 0.4em !important;
          border-radius: 4px !important;
          font-family: 'Courier New', monospace !important;
          font-size: 0.9em !important;
          color: #2147a8 !important;
        }

        .blog-content-container pre {
          background: #2d3748 !important;
          color: #e2e8f0 !important;
          padding: 1em !important;
          border-radius: 0.5rem !important;
          overflow-x: auto !important;
          margin: 1.2em 0 !important;
        }

        .blog-content-container pre code {
          background: transparent !important;
          color: inherit !important;
          padding: 0 !important;
        }

        /* Scrollable sidebars - Prevent overflow */
        .max-h-\\[70vh\\] {
          max-height: 70vh;
        }
        
        .max-h-\\[calc\\(100vh-120px\\)\\] {
          max-height: calc(100vh - 120px);
        }
        
        .max-h-\\[70vh\\]::-webkit-scrollbar,
        .max-h-\\[calc\\(100vh-120px\\)\\]::-webkit-scrollbar {
          width: 4px;
        }
        
        .max-h-\\[70vh\\]::-webkit-scrollbar-track,
        .max-h-\\[calc\\(100vh-120px\\)\\]::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .max-h-\\[70vh\\]::-webkit-scrollbar-thumb,
        .max-h-\\[calc\\(100vh-120px\\)\\]::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .max-h-\\[70vh\\]::-webkit-scrollbar-thumb:hover,
        .max-h-\\[calc\\(100vh-120px\\)\\]::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        /* Course card image optimizations - 2:1 Aspect Ratio */
        .pt-\\[50\\%\\] {
          padding-top: 50%;
        }

        /* Optimize scrolling performance */
        .will-change-scroll {
          will-change: scroll-position;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .blog-content-container h1 {
            font-size: 1.5em !important;
          }
          .blog-content-container h2 {
            font-size: 1.3em !important;
          }
          .blog-content-container h3 {
            font-size: 1.1em !important;
          }
          .blog-content-container p {
            font-size: 0.95em !important;
          }
          .blog-content-container table {
            font-size: 0.8em !important;
            min-width: 640px !important;
          }
          .blog-content-container table th,
          .blog-content-container table td {
            padding: 8px 10px !important;
          }
        }

        /* Fix for sticky sidebars on mobile */
        @media (max-width: 1023px) {
          .lg\\:fixed {
            position: relative !important;
            top: 0 !important;
          }
        }

        /* Ensure all headings have scroll margin */
        .blog-content-container h1,
        .blog-content-container h2,
        .blog-content-container h3,
        .blog-content-container h4,
        .blog-content-container h5,
        .blog-content-container h6 {
          scroll-margin-top: 80px !important;
        }
      `}</style>
    </div>
  );
};

export default BlogDetailPage;