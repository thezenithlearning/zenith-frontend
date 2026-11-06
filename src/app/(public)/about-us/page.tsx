import ImageMarquee from "@/components/home/ImageMarquee";
import CompanyMetrics from "@/components/home/CompanyMetrics";
import CompanyStory from "@/components/home/CompanyStory";
import Methodology from "@/components/home/Methodology";
import AILearning from "@/components/home/AILearning";
import PageHero from "@/components/home/PageHero";
import Team from "@/components/home/Team";
import CTASection from "@/components/shared/CTASection";

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden bg-white">
      <PageHero
        eyebrow="About Zenith"
        title="Teaching that makes difficult concepts feel simple."
        description="Zenith Learning is built for students who want more than routine tuition — students who want clarity, confidence and a structured path toward their goals."
      />

      <CompanyMetrics />
      <CompanyStory />
      <Methodology />
      <AILearning />
      <ImageMarquee />
      <Team />
      <CTASection
        heading="Start with a diagnostic conversation"
        description="Share the student's curriculum, grade and goals, and we'll recommend the right learning pathway."
        buttonText="Explore programs"
        buttonHref="/course"
      />
    </main>
  );
}
