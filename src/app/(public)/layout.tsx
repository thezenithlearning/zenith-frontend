import type { Metadata, Viewport } from "next";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { LeadModalProvider } from "@/components/lead/LeadModal";

const title = "Zenith Learning – Premium Academic Mentoring | IB, IGCSE, SAT, AP, JEE, NEET";
const description =
  "Personalised 1:1 academic mentoring that turns complex concepts into confident problem-solving across international curricula, school academics and competitive exams.";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://thezenithlearning.com",
  ),
  applicationName: "Zenith Learning",
  title: { default: title, template: "%s | Zenith Learning" },
  description,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Zenith Learning",
    title,
    description,
    images: [{ url: "/og-image.svg", alt: "Zenith Learning – Reach your Zenith" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.svg"],
  },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <LeadModalProvider>
      <Navbar />
      <div className="min-h-screen">{children}</div>
      <Footer />
    </LeadModalProvider>
  );
}
