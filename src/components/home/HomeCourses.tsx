import Link from "next/link";
import { ArrowRight } from "lucide-react";

import CourseCard, { type CourseCardData } from "@/components/course/CourseCard";

import { Reveal } from "./ui";

/** Placeholder cards until the home page is wired to the live course list. */
const COURSES: CourseCardData[] = [
  {
    _id: "dummy-1",
    bannerImage: { url: "/courses/mathematics.svg", altText: "Mathematics graph illustration" },
    title: "IB Mathematics AA HL",
    slug: "ib-mathematics-aa-hl",
    category: "IB",
    shortDescription: "Concept-first coaching for IB Analysis & Approaches, with exam-style problem practice.",
    price: 24999,
    discountedPrice: 19999,
    durationWeeks: 24,
    format: "Live online",
    level: "advanced",
    status: "active",
  },
  {
    _id: "dummy-2",
    bannerImage: { url: "/courses/physics.svg", altText: "Physics atom illustration" },
    title: "IGCSE Physics",
    slug: "igcse-physics",
    category: "IGCSE",
    shortDescription: "Build strong fundamentals and exam technique across the full IGCSE Physics syllabus.",
    price: 17999,
    discountedPrice: 14999,
    durationWeeks: 20,
    format: "Live online",
    level: "intermediate",
    status: "active",
  },
  {
    _id: "dummy-3",
    bannerImage: { url: "/courses/science.svg", altText: "Science laboratory flask illustration" },
    title: "CBSE Class 10 Science",
    slug: "cbse-class-10-science",
    category: "CBSE",
    shortDescription: "Chapter-wise teaching, NCERT mastery and board-pattern practice for Class 10.",
    price: 9999,
    durationWeeks: 16,
    format: "Live online",
    level: "intermediate",
    status: "active",
  },
  {
    _id: "dummy-4",
    bannerImage: { url: "/courses/engineering.svg", altText: "Geometric engineering illustration" },
    title: "JEE Main Foundation",
    slug: "jee-main-foundation",
    category: "JEE",
    shortDescription: "Strengthen Physics, Chemistry and Maths concepts with structured weekly tests.",
    price: 34999,
    discountedPrice: 29999,
    durationWeeks: 40,
    format: "Live online",
    level: "advanced",
    status: "active",
  },
  {
    _id: "dummy-5",
    bannerImage: { url: "/courses/biology.svg", altText: "Biology DNA illustration" },
    title: "NEET Biology Crash Course",
    slug: "neet-biology-crash-course",
    category: "NEET",
    shortDescription: "High-yield revision, diagrams and MCQ drills to lock in NEET Biology marks.",
    price: 12999,
    discountedPrice: 9999,
    durationWeeks: 8,
    format: "Live online",
    level: "all-levels",
    status: "active",
  },
  {
    _id: "dummy-6",
    bannerImage: { url: "/courses/sat.svg", altText: "SAT study book illustration" },
    title: "SAT Maths & English",
    slug: "sat-maths-english",
    category: "SAT",
    shortDescription: "Targeted SAT preparation with adaptive practice and full-length mock tests.",
    price: 19999,
    durationWeeks: 12,
    format: "Live online",
    level: "intermediate",
    status: "active",
  },
];

export default function HomeCourses() {
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
          {COURSES.map((course, i) => (
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
