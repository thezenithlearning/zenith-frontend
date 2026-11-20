import type { Metadata } from "next";

import BannerSlider from "@/components/home/BannerSlider";
import ZenithMindset from "@/components/home/ZenithMindset";
import WisdomStatement from "@/components/home/WisdomStatement";
import HomeResources from "@/components/home/HomeResources";
import Credibility from "@/components/home/Credibility";
import HomeCourses from "@/components/home/HomeCourses";
import KalpVriksh from "@/components/home/KalpVriksh";
import HouseRules from "@/components/home/HouseRules";
import DemoCta from "@/components/home/DemoCta";
import CityPresence from "@/components/home/CityPresence";
import Methodology from "@/components/home/Methodology";
import AILearning from "@/components/home/AILearning";
import LearningComparison from "@/components/home/LearningComparison";
import Testimonials from "@/components/home/Testimonials";
import Enquiry from "@/components/home/Enquiry";
import HomeSeoContent from "@/components/home/HomeSeoContent";
import HomeFaq from "@/components/home/HomeFaq";
import HomePopup from "@/components/ads/HomePopup";
import HomeSchema from "@/components/seo/HomeSchema";
import { fetchPublic } from "@/lib/serverApi";
import { stripHtml } from "@/features/content/types";
import {
  HOME_DESCRIPTION,
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

export default async function Home() {
  const records = await fetchPublic<{ question: string; answer: string }[]>("/faqs?scope=general&limit=5");
  const faqs = (records ?? []).map(item => ({ question: item.question, answer: stripHtml(item.answer) }));
  return (
    <main className="overflow-x-hidden">
      <HomeSchema faqs={faqs} />
      <BannerSlider />
      <Credibility />
      <KalpVriksh />
      <HomeCourses />
      <DemoCta />
      <WisdomStatement />
      <Methodology />
      <ZenithMindset />
      <AILearning />
      <LearningComparison />
      <Testimonials />
      <HouseRules />
      <DemoCta />
      <HomeResources />
      <CityPresence />
      <HomeFaq items={faqs} />
      <Enquiry />
      <HomeSeoContent />
      <HomePopup />
    </main>
  );
}
