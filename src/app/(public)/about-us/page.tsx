import type { Metadata } from "next";
import AboutStory from "@/components/about/AboutStory";
import Testimonials from "@/components/home/Testimonials";
import ConnectStrip from "@/components/contact/ConnectStrip";
import CTASection from "@/components/shared/CTASection";

export const metadata: Metadata = { title: "About Us", description: "Discover the people and personalised mentoring approach behind Zenith Learning." };

export default function AboutPage() {
  return <main className="overflow-x-hidden bg-white">
    <AboutStory />
    <Testimonials />
    <ConnectStrip />
    <CTASection heading="Ready to start your child's journey?" description="A personalised assessment is the first rung of the ladder." buttonText="Book a personalised assessment" buttonHref="/contact-us" />
  </main>;
}
