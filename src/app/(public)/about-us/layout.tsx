import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Zenith Learning | Premium Academic Mentoring",
  description:
    "Zenith Learning combines expert teaching, personalised learning and AI-supported analysis to help students move from complex concepts to confident problem-solving.",
  alternates: { canonical: "/about-us" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
