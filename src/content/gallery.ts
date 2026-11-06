export interface GalleryItem {
  title: string;
  caption: string;
  /** Photo: a CDN URL or a path under /public. A designed tile is shown when omitted. */
  src?: string;
}

// Dummy placeholder photos (picsum.photos, stable per seed) — replace each `src` with a real
// Zenith photo (CDN URL or /public path) when available.
const dummy = (seed: string) => `https://picsum.photos/seed/zenith-${seed}/640/480`;

// Three rows scrolling in alternating directions.
export const GALLERY_ROWS: GalleryItem[][] = [
  [
    { title: "Live classes", caption: "Small groups, real-time doubts", src: dummy("live-classes") },
    { title: "Physics labs", caption: "Concepts made visible", src: dummy("physics-labs") },
    { title: "Problem solving", caption: "From first principles", src: dummy("problem-solving") },
    { title: "Mock exams", caption: "Exam-style practice", src: dummy("mock-exams") },
    { title: "Mentor sessions", caption: "1:1 guidance", src: dummy("mentor-sessions") },
    { title: "Study plans", caption: "Built after a diagnostic", src: dummy("study-plans") },
    { title: "Worked examples", caption: "Step by step clarity", src: dummy("worked-examples") },
    { title: "Feedback", caption: "Specific and actionable", src: dummy("feedback") },
  ],
  [
    { title: "IB DP Physics", caption: "SL and HL", src: dummy("ib-physics") },
    { title: "IGCSE", caption: "Cambridge pathway", src: dummy("igcse") },
    { title: "A Level", caption: "Advanced depth", src: dummy("a-level") },
    { title: "SAT", caption: "College admissions", src: dummy("sat") },
    { title: "AP", caption: "Advanced Placement", src: dummy("ap") },
    { title: "JEE", caption: "Engineering entrance", src: dummy("jee") },
    { title: "NEET", caption: "Medical entrance", src: dummy("neet") },
    { title: "CBSE", caption: "Board excellence", src: dummy("cbse") },
  ],
  [
    { title: "Progress tracking", caption: "Visible for parents", src: dummy("progress-tracking") },
    { title: "AI analysis", caption: "Gaps found early", src: dummy("ai-analysis") },
    { title: "Practice sets", caption: "Targeted to weak areas", src: dummy("practice-sets") },
    { title: "Past papers", caption: "Real exam patterns", src: dummy("past-papers") },
    { title: "Flash cards", caption: "Class-wise revision", src: dummy("flash-cards") },
    { title: "Doubt clearing", caption: "Fast, clear answers", src: dummy("doubt-clearing") },
    { title: "Reports", caption: "Clear monthly insight", src: dummy("reports") },
    { title: "Confidence", caption: "Reach your Zenith", src: dummy("confidence") },
  ],
];
