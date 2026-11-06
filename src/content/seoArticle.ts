export interface SeoSection {
  id: string;
  heading: string;
  paragraphs: string[];
  /** Optional sub-heading + bullet list rendered after the paragraphs. */
  listTitle?: string;
  bullets?: string[];
}

export const SEO_ARTICLE_TITLE =
  "Premium online academic mentoring for IB, IGCSE, A Level, SAT, AP, JEE, NEET and CBSE";

export const SEO_ARTICLE_INTRO =
  "Zenith Learning is a premium online academic mentoring company for students who want more than routine tuition. We combine expert teaching, personalised learning and intelligent analysis so that complex concepts become confident problem-solving. This guide explains how our programmes work, who they are for, and how families can choose the right learning pathway.";

export const SEO_KEYWORDS = [
  "IB DP Physics tutor",
  "IB Physics HL and SL",
  "IGCSE online tutor",
  "A Level online tutoring",
  "SAT preparation online",
  "AP exam preparation",
  "JEE preparation online",
  "NEET preparation online",
  "CBSE online coaching",
  "1:1 online mentoring",
  "personalised learning plan",
  "AI-enhanced learning",
  "exam-style practice",
  "online physics tutor",
  "online maths tutor",
  "diagnostic assessment",
];

export const SEO_SECTIONS: SeoSection[] = [
  {
    id: "who-we-are",
    heading: "What is Zenith Learning?",
    paragraphs: [
      "Zenith Learning is an online academic mentoring company built around one idea: every student can reach their highest potential when the teaching is clear, the practice is targeted and the progress is visible. We support students preparing for international and national curricula and entrance examinations, including the IB Diploma Programme, IGCSE, A Level, SAT, AP, JEE, NEET and CBSE.",
      "Unlike a one-size-fits-all classroom, our mentors start with the individual learner. We find out where the student is today, what the syllabus and exam demand, and what stands in between. Lessons then combine conceptual teaching, guided problem solving, independent practice and specific feedback, so students understand why an answer works, not only how to reproduce it.",
      "Because Zenith Learning is fully online, students can learn from anywhere in the world. Parents and students get a structured study plan, regular practice and clear progress tracking without travelling to a centre.",
    ],
  },
  {
    id: "personalised-mentoring",
    heading: "Why personalised 1:1 online mentoring works",
    paragraphs: [
      "Students rarely struggle with a subject for the same reason. One student may have a gap in a prerequisite topic, another may understand the theory but lose marks on exam technique, and a third may simply need more structured practice. Group classes move at a fixed pace, so these differences often go unnoticed until results arrive.",
      "One-to-one mentoring changes that. The pace, examples and practice follow the student rather than a fixed class plan. Misconceptions are corrected the moment they appear, questions can be asked without hesitation, and the mentor can adjust the next session based on what happened in the last one.",
    ],
    listTitle: "What students and parents typically value",
    bullets: [
      "A study plan built around the student's current level, target grade and exam date",
      "Clear explanations that connect new ideas to what the student already knows",
      "Worked examples followed by independent practice at the right difficulty",
      "Specific feedback on method, reasoning and exam technique",
      "Regular tests and progress reports that show what is improving and what is not",
      "Flexible online scheduling across time zones",
    ],
  },
  {
    id: "ib-dp-physics",
    heading: "IB DP Physics tutoring (SL and HL)",
    paragraphs: [
      "IB Diploma Physics asks students to combine conceptual understanding, mathematical fluency and scientific reasoning, and to apply them to unfamiliar situations. Our IB DP Physics mentoring covers both Standard Level and Higher Level and follows the structure of the syllabus, the internal assessment and the written papers.",
      "Mentoring focuses on building a solid foundation in each theme, then moving towards the data-based, multi-step and extended-response questions that separate strong answers from average ones. Students learn how to read a command term, structure an argument, show working clearly and check results for sense.",
    ],
    listTitle: "Typical areas of support",
    bullets: [
      "Mechanics, thermal physics, waves, electricity and magnetism, and modern physics",
      "Higher Level extensions and problem-solving strategy",
      "Internal assessment planning, data analysis and write-up feedback",
      "Paper-style practice with mark-scheme based review",
      "Mathematical skills for physics, including graphs, uncertainties and unit analysis",
    ],
  },
  {
    id: "igcse-a-level",
    heading: "IGCSE and A Level online tutoring",
    paragraphs: [
      "IGCSE builds the habits and knowledge that A Level later depends on, and A Level raises the demand for depth, precision and independence. Our IGCSE and A Level programmes help students move from understanding individual topics to connecting them, and from recalling content to applying it under timed conditions.",
      "Mentors review the specification with the student, identify the topics that need the most attention and plan practice accordingly. Past-paper style questions are used regularly so that students become comfortable with the wording, structure and mark allocation of real exam papers.",
    ],
    listTitle: "What the programme focuses on",
    bullets: [
      "Strengthening foundations in sciences and mathematics before the exam years",
      "Concept clarity for the most commonly misunderstood topics",
      "Exam technique, time management and answer structure",
      "Targeted revision plans before mock and final examinations",
    ],
  },
  {
    id: "sat-ap",
    heading: "SAT and AP preparation online",
    paragraphs: [
      "The SAT rewards accuracy, pacing and familiarity with question patterns, while AP examinations reward depth of understanding and the ability to explain and apply ideas. Our SAT and AP programmes address both, starting with a diagnostic to see where marks are being lost.",
      "For the SAT, practice is organised around the skills tested in reading, writing and mathematics, with timed sections to build stamina and pacing. For AP subjects, mentoring follows the course framework, with problem sets and free-response practice designed to reflect the style of the exam.",
    ],
    listTitle: "How students prepare with us",
    bullets: [
      "A diagnostic to establish the starting point and a realistic target",
      "Skill-by-skill practice with explanations for every error",
      "Timed practice and review to build pacing and confidence",
      "A revision schedule that fits around school commitments",
    ],
  },
  {
    id: "jee-neet-cbse",
    heading: "JEE, NEET and CBSE preparation",
    paragraphs: [
      "Competitive entrance examinations such as JEE and NEET test conceptual depth and problem-solving speed, and CBSE board examinations reward a strong command of the syllabus and clear written answers. Our competitive pathway helps students build the fundamentals first and then apply them to progressively harder questions.",
      "Mentoring combines concept building, structured problem practice and regular testing. Students learn to recognise question types, choose efficient methods and review mistakes so that the same error does not repeat.",
    ],
    listTitle: "Support available",
    bullets: [
      "Concept-first teaching for physics, chemistry, mathematics and biology",
      "Chapter-wise practice and mixed-topic problem sets",
      "Periodic tests with analysis of accuracy and time use",
      "Board-exam answer writing alongside entrance preparation",
    ],
  },
  {
    id: "zenith-method",
    heading: "The Zenith Method: Diagnose, Build, Apply",
    paragraphs: [
      "Every Zenith programme follows the same three-stage method. It keeps learning purposeful and makes progress easy to see.",
      "Diagnose. We begin by finding knowledge gaps, misconceptions and exam-specific weaknesses, so that time is spent on what will change the result.",
      "Build. We strengthen concepts using clear explanations, worked examples and curriculum-aligned learning, so that understanding is secure before the difficulty rises.",
      "Apply. Students move from guided practice to challenging application, analysis and real exam-style problems, with feedback after each attempt.",
    ],
  },
  {
    id: "teaching-methodology",
    heading: "Our teaching methodology",
    paragraphs: [
      "Lessons combine conceptual teaching, guided problem solving, independent practice and feedback. The focus is not simply on completing chapters; it is on building the ability to think. Students are encouraged to explain their reasoning, to estimate before they calculate and to check whether an answer is sensible.",
      "Short, regular practice is preferred to occasional long sessions. Mistakes are treated as information: each error is classified as a concept gap, a method error or a careless slip, and the next session is planned accordingly.",
    ],
  },
  {
    id: "ai-enhanced-learning",
    heading: "AI-enhanced learning, guided by expert teachers",
    paragraphs: [
      "Zenith uses AI-supported analysis to make learning more personal and more measurable. Practice results can be examined to highlight recurring gaps, suggest what to revisit and keep practice at the right level. The technology supports the mentor; it does not replace them.",
      "Teachers remain responsible for explanation, judgement and encouragement, while analysis helps them decide what to teach next and helps families see how the student is progressing over time.",
    ],
  },
  {
    id: "choosing-a-tutor",
    heading: "How to choose the right online tutor or mentor",
    paragraphs: [
      "Choosing a tutor is an important decision. A strong online mentor should be able to explain how they will assess the student, how lessons will be structured and how progress will be reported. The questions below can help any family compare options.",
    ],
    listTitle: "Questions worth asking",
    bullets: [
      "How will you identify the student's gaps before planning lessons?",
      "How is the curriculum or exam specification reflected in the lesson plan?",
      "What practice is set between sessions, and how is it reviewed?",
      "How often will we receive progress updates, and what do they include?",
      "How are sessions scheduled across different time zones?",
      "What happens if the student's target or timeline changes?",
    ],
  },
  {
    id: "study-tips",
    heading: "Practical study tips for exam success",
    paragraphs: [
      "Whatever the curriculum, strong results usually come from a small set of habits practised consistently. These tips apply to IB, IGCSE, A Level, SAT, AP, JEE, NEET and CBSE preparation alike.",
    ],
    listTitle: "Habits that make a difference",
    bullets: [
      "Start with understanding: if a topic cannot be explained simply, revisit the concept before practising questions.",
      "Practise in short, regular sessions rather than rare marathons.",
      "Attempt questions before looking at solutions, then review every mistake and note the reason for it.",
      "Use past-paper style questions under timed conditions as the exam approaches.",
      "Keep an error log and revisit it weekly so that the same mistake is not repeated.",
      "Sleep, breaks and a realistic schedule protect the quality of study time.",
    ],
  },
  {
    id: "getting-started",
    heading: "How to get started with Zenith Learning",
    paragraphs: [
      "Getting started is simple. Share the student's curriculum, grade, target exam and goals using the enquiry form. A mentor will review the details, hold a short diagnostic conversation and recommend a learning pathway, schedule and expectations. Once the plan is agreed, live classes, structured practice and progress tracking begin.",
      "Whether the goal is a top IB Physics grade, strong IGCSE and A Level results, a competitive SAT or AP score, or a successful JEE, NEET or CBSE outcome, the first step is the same: understand where the student is today and build the clearest path to where they want to be.",
    ],
  },
];

export const SEO_LINKS = [
  { href: "/course", label: "Explore programmes" },
  { href: "/about-us", label: "About Zenith Learning" },
  { href: "/classwise-flash-card", label: "Class-wise flash cards" },
  { href: "/pyqs", label: "Past papers" },
  { href: "/blog", label: "Study guides and insights" },
  { href: "/contact-us", label: "Contact admissions" },
];
