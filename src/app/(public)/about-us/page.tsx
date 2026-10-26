import AboutIntro from "@/components/home/AboutIntro";
import Method from "@/components/home/Method";
import Methodology from "@/components/home/Methodology";
import AILearning from "@/components/home/AILearning";
import PageHero from "@/components/home/PageHero";
import CTASection from "@/components/shared/CTASection";

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden bg-white">
      <PageHero
        eyebrow="About Zenith"
        title="Teaching that makes difficult concepts feel simple."
        description="Zenith Learning is built for students who want more than routine tuition — students who want clarity, confidence and a structured path toward their goals."
      />

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-mid">
              What makes Zenith different?
            </p>
            <h2 className="font-display mt-4 text-3xl font-medium leading-tight text-brand-start sm:text-4xl">
              Every learner begins with a clear picture of where they are and where they need to go.
            </h2>
          </div>
          <div className="space-y-5 text-lg leading-8 text-slate-600">
            <p>
              Lessons combine conceptual teaching, guided problem solving, independent practice and
              feedback.
            </p>
            <p className="font-display text-2xl font-medium leading-snug text-brand-start">
              The focus is not simply on completing chapters — it is on building the ability to think.
            </p>
            <dl className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-6">
              {[
                ["1:1", "Personalised guidance"],
                ["7+", "Years teaching expertise"],
                ["6+", "Curriculum pathways"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-4xl font-medium text-brand-mid">{value}</dt>
                  <dd className="mt-1 text-xs leading-5 text-slate-500">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <AboutIntro />
      <Method />
      <Methodology />
      <AILearning />
      <CTASection
        heading="Start with a diagnostic conversation"
        description="Share the student's curriculum, grade and goals, and we'll recommend the right learning pathway."
        buttonText="Explore programs"
        buttonHref="/course"
      />
    </main>
  );
}
