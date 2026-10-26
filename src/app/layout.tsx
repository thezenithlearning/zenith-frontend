import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { preconnect } from "react-dom";
import "./globals.css";
import { ReduxProvider } from "@/redux/provider";
import { CDN_BASE } from "@/lib/cdn";
import VisitTracker from "@/components/analytics/VisitTracker";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: "Zenith Learning | Premium Academic Mentoring",
  description:
    "Personalised academic mentoring across IB, IGCSE, A Level, SAT, AP, JEE, NEET and CBSE.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Open the media connection early so images start sooner.
  if (CDN_BASE) preconnect(CDN_BASE, { crossOrigin: "anonymous" });
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className={inter.className}>
        <VisitTracker />
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
