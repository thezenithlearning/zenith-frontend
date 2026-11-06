import type { Metadata } from "next";
import AboutExperience from "@/components/about/AboutExperience";
import CompanyStory from "@/components/home/CompanyStory";
import Team from "@/components/home/Team";
import CompanyMetrics from "@/components/home/CompanyMetrics";
import Methodology from "@/components/home/Methodology";
import AILearning from "@/components/home/AILearning";
import ImageMarquee from "@/components/home/ImageMarquee";
import ConnectStrip from "@/components/contact/ConnectStrip";
import CTASection from "@/components/shared/CTASection";

export const metadata: Metadata = { title: "About Us", description: "Discover the people and personalised mentoring approach behind Zenith Learning." };

export default function AboutPage() {
  return <main className="overflow-x-hidden bg-white">
    <AboutExperience />
    <CompanyMetrics />
    <CompanyStory />
    <Methodology />
    <AILearning />
    <ImageMarquee />
    <Team />
    <ConnectStrip />
    <CTASection heading="Your next chapter starts with a conversation." description="Tell us where you are and where you want to go. Let's find a learning pathway that fits." buttonText="Let's talk" buttonHref="/contact-us" />
  </main>;
}
