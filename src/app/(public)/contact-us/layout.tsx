import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admissions & Contact | Zenith Learning",
  description:
    "Tell us the student's curriculum, grade, target exam and goals. Zenith Learning will recommend the right learning pathway.",
  alternates: { canonical: "/contact-us" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
