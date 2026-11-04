import type { Metadata } from "next";

import BannerSlider from "@/components/home/BannerSlider";
import Credibility from "@/components/home/Credibility";
import HomeCourses from "@/components/home/HomeCourses";
import DemoCta from "@/components/home/DemoCta";
import CityPresence from "@/components/home/CityPresence";
import Methodology from "@/components/home/Methodology";
import AILearning from "@/components/home/AILearning";
import LearningComparison from "@/components/home/LearningComparison";
import Testimonials from "@/components/home/Testimonials";
import Enquiry from "@/components/home/Enquiry";
import HomeFaq from "@/components/home/HomeFaq";
import HomePopup from "@/components/ads/HomePopup";
import HomeSchema from "@/components/seo/HomeSchema";
import {
  HOME_DESCRIPTION,
  HOME_FAQS,
  HOME_IMAGE,
  HOME_IMAGE_ALT,
  HOME_TITLE,
  HOME_URL,
} from "@/data/homeSeo";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: HOME_URL },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: HOME_URL,
    siteName: "Zenith Learning",
    type: "website",
    locale: "en_US",
    images: [{ url: HOME_IMAGE, alt: HOME_IMAGE_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [{ url: HOME_IMAGE, alt: HOME_IMAGE_ALT }],
  },
};

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HomeSchema />
      <BannerSlider />
      <Credibility />
      <HomeCourses />
      <DemoCta />
      <CityPresence />
      <Methodology />
      <AILearning />
      <LearningComparison />
      <Testimonials />
      <DemoCta />
      <HomeFaq items={HOME_FAQS} />
      <Enquiry />
      <HomePopup />
    </main>
  );
}
