import React from "react";

import { BRAND } from "@/content/brand";

const H2 = "font-display text-2xl font-medium mb-4 text-brand-start";
const P = "mb-4 leading-7 text-slate-700";

// NOTE: starter text only. Have it reviewed by counsel (fees, refunds and
// governing law in particular) before launch.
const SECTIONS: Array<{ title: string; body: string }> = [
  {
    title: "1. About these terms",
    body: "These terms govern your use of thezenithlearning.com and the mentoring services offered by Zenith Learning. By using the site or enrolling in a program, you agree to them.",
  },
  {
    title: "2. Programs and sessions",
    body: "Programs are delivered online as live sessions with practice, tests and progress reports. The pathway, schedule and fees for each student are confirmed in writing after the diagnostic assessment and before enrolment.",
  },
  {
    title: "3. Fees and payment",
    body: "Fees are agreed at enrolment and are payable as stated in the confirmation. Fees paid under a promotion are final at the amount paid.",
  },
  {
    title: "4. Rescheduling and cancellation",
    body: "Sessions can be rescheduled with reasonable notice. Refund and cancellation terms are shared in the enrolment confirmation for each program.",
  },
  {
    title: "5. Academic honesty and outcomes",
    body: "Our role is to teach, guide and give feedback; students are responsible for their own work, including Internal Assessments and exams. We do not guarantee any particular grade or score.",
  },
  {
    title: "6. Content and intellectual property",
    body: "Worksheets, notes, recordings and other materials are provided for the enrolled student's personal use. They may not be copied, shared or resold without written permission.",
  },
  {
    title: "7. Acceptable use",
    body: "You agree not to misuse the site, attempt to access other users' data, interfere with its security, or use it for any unlawful purpose.",
  },
  {
    title: "8. Limitation of liability",
    body: "The service is provided on an as-available basis. To the extent permitted by law, Zenith Learning is not liable for indirect or consequential loss arising from use of the site or services.",
  },
  {
    title: "9. Governing law",
    body: "These terms are governed by the laws of the jurisdiction in which Zenith Learning is registered, which will be stated in your enrolment confirmation.",
  },
];

const TermsConditionsContent: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      {SECTIONS.map((section) => (
        <section key={section.title} className="mb-9">
          <h2 className={H2}>{section.title}</h2>
          <p className={P}>{section.body}</p>
        </section>
      ))}
      <section>
        <h2 className={H2}>Contact</h2>
        <p className={P}>
          Questions about these terms? Email{" "}
          <a className="font-semibold text-brand-mid underline" href={`mailto:${BRAND.supportEmail}`}>
            {BRAND.supportEmail}
          </a>.
        </p>
      </section>
    </div>
  );
};

export default TermsConditionsContent;
