import { HOME_FAQS, HOME_IMAGE, HOME_TITLE, HOME_URL } from "@/data/homeSeo";
import { BRAND } from "@/content/brand";

const DESCRIPTION =
  "Personalised academic mentoring across international curricula, school academics and competitive exams, with live classes, structured practice and continuous progress tracking.";

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": `${HOME_URL}/#organization`,
    name: "Zenith Learning",
    url: `${HOME_URL}/`,
    description: DESCRIPTION,
    logo: { "@type": "ImageObject", url: `${HOME_URL}/favicon.svg` },
    image: HOME_IMAGE,
    email: BRAND.supportEmail,
    sameAs: Object.values(BRAND.social),
    knowsAbout: [
      "IB DP Physics",
      "IGCSE",
      "A Level",
      "SAT",
      "AP",
      "JEE",
      "NEET",
      "CBSE",
      "Academic mentoring",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${HOME_URL}/#website`,
    url: `${HOME_URL}/`,
    name: "Zenith Learning",
    alternateName: "thezenithlearning.com",
    description: DESCRIPTION,
    publisher: { "@id": `${HOME_URL}/#organization` },
    inLanguage: "en",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${HOME_URL}/#webpage`,
    url: `${HOME_URL}/`,
    name: HOME_TITLE,
    description: DESCRIPTION,
    isPartOf: { "@id": `${HOME_URL}/#website` },
    about: { "@id": `${HOME_URL}/#organization` },
    publisher: { "@id": `${HOME_URL}/#organization` },
    primaryImageOfPage: { "@type": "ImageObject", url: HOME_IMAGE },
    inLanguage: "en",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${HOME_URL}/#faq`,
    url: `${HOME_URL}/#faq`,
    mainEntity: HOME_FAQS.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  },
];

export default function HomeSchema() {
  return schemas.map((schema) => (
    <script
      key={schema["@id"]}
      id={`home-${schema["@type"].toLowerCase()}-schema`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  ));
}
