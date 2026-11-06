export interface GalleryItem {
  title: string;
  caption: string;
  /** Optional photo: a CDN URL or a path under /public. A designed tile is shown when omitted. */
  src?: string;
}

// Three rows scrolling in alternating directions. Add `src` to any item to show a real photo.
export const GALLERY_ROWS: GalleryItem[][] = [
  [
    { title: "Live classes", caption: "Small groups, real-time doubts" },
    { title: "Physics labs", caption: "Concepts made visible" },
    { title: "Problem solving", caption: "From first principles" },
    { title: "Mock exams", caption: "Exam-style practice" },
    { title: "Mentor sessions", caption: "1:1 guidance" },
    { title: "Study plans", caption: "Built after a diagnostic" },
    { title: "Worked examples", caption: "Step by step clarity" },
    { title: "Feedback", caption: "Specific and actionable" },
  ],
  [
    { title: "IB DP Physics", caption: "SL and HL" },
    { title: "IGCSE", caption: "Cambridge pathway" },
    { title: "A Level", caption: "Advanced depth" },
    { title: "SAT", caption: "College admissions" },
    { title: "AP", caption: "Advanced Placement" },
    { title: "JEE", caption: "Engineering entrance" },
    { title: "NEET", caption: "Medical entrance" },
    { title: "CBSE", caption: "Board excellence" },
  ],
  [
    { title: "Progress tracking", caption: "Visible for parents" },
    { title: "AI analysis", caption: "Gaps found early" },
    { title: "Practice sets", caption: "Targeted to weak areas" },
    { title: "Past papers", caption: "Real exam patterns" },
    { title: "Flash cards", caption: "Class-wise revision" },
    { title: "Doubt clearing", caption: "Fast, clear answers" },
    { title: "Reports", caption: "Clear monthly insight" },
    { title: "Confidence", caption: "Reach your Zenith" },
  ],
];
