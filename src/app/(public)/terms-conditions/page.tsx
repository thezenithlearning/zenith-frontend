import TermsConditionsContent from "@/components/company/TermsConditionsContent";

export const metadata = {
  title: "Terms & Conditions | Zenith Learning",
  description: "Read Zenith Learning's Terms & Conditions to understand the rules and guidelines for using our platform and services.",
};

export default function TermsConditionsPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-brand-start py-14 px-4 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/50 mb-2">
          Legal
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-white/65 max-w-xl mx-auto">
          Last updated: October 2026 &nbsp;·&nbsp; Effective immediately
        </p>
      </section>

      {/* Content */}
      <TermsConditionsContent />

    </main>
  );
}
