import React from "react";

import { BRAND } from "@/content/brand";

const H2 = "font-display text-2xl font-medium mb-4 text-brand-start";

// NOTE: starter text only. Have it reviewed against the laws that apply to
// your students (for example GDPR / COPPA for minors) before launch.
const SECTIONS: Array<{ title: string; paragraphs?: string[]; bullets?: Array<[string, string]> }> = [
  {
    title: "1. What information we collect",
    paragraphs: [
      "When you send an enquiry, book a session or create an account, we collect the details you give us, such as the student or parent name, email address, phone number, curriculum, grade and learning goals.",
    ],
    bullets: [
      ["Enquiries", "We use your details to respond, recommend a learning pathway and arrange a diagnostic assessment."],
      ["Learning records", "Assessment results, practice activity and progress reports are used to personalise teaching and share progress with students and parents."],
      ["Communication", "With your permission, we may email you about programs, schedules and academic resources. You can opt out at any time."],
    ],
  },
  {
    title: "2. Students under 18",
    paragraphs: [
      "Where a student is a minor, enquiries and account details should be provided by a parent or guardian. Progress information is shared with the parent or guardian on request.",
    ],
  },
  {
    title: "3. How we use AI-supported analysis",
    paragraphs: [
      "Zenith uses AI-supported tools to analyse assessment performance and suggest targeted practice. Every insight is reviewed by a teacher, and learning records are used only to support the student's learning.",
    ],
  },
  {
    title: "4. Sharing and disclosure",
    paragraphs: [
      "We do not sell personal information. We share it only with service providers that help us run the platform (for example hosting and email delivery), or when required by law.",
    ],
  },
  {
    title: "5. Security and retention",
    paragraphs: [
      "We take reasonable technical and organisational precautions to protect personal information, and keep it only as long as needed for the purposes described above.",
    ],
  },
  {
    title: "6. Cookies",
    paragraphs: [
      "We use cookies and similar storage to maintain your session and understand how the site is used. They are not used to identify you on other websites.",
    ],
  },
  {
    title: "7. Changes to this policy",
    paragraphs: [
      "We may update this policy from time to time. Changes take effect when they are posted on this page.",
    ],
  },
];

const PrivacyPolicyContent: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      {SECTIONS.map((section) => (
        <section key={section.title} className="mb-9">
          <h2 className={H2}>{section.title}</h2>
          {section.paragraphs?.map((text) => (
            <p key={text} className="mb-4 leading-7 text-slate-700">{text}</p>
          ))}
          {section.bullets && (
            <ul className="mb-4 list-inside list-disc space-y-1.5 text-slate-700">
              {section.bullets.map(([label, text]) => (
                <li key={label}><strong>{label}:</strong> {text}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section>
        <h2 className={H2}>Contact</h2>
        <p className="leading-7 text-slate-700">
          To access, correct or delete personal information, or to raise a concern, email us at{" "}
          <a className="font-semibold text-brand-mid underline" href={`mailto:${BRAND.supportEmail}`}>
            {BRAND.supportEmail}
          </a>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicyContent;
