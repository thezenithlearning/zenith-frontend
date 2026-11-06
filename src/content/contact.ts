// Test office details — replace with the real address, hours and map query before launch.
export const OFFICE = {
  name: "Zenith Learning Office",
  lines: ["221 Test Street, Connaught Place", "New Delhi, Delhi 110001", "India"],
  // Used for the embedded Google map and the "Get directions" link.
  mapQuery: "Connaught Place, New Delhi, India",
  hours: [
    { days: "Monday – Friday", time: "9:00 AM – 7:00 PM IST" },
    { days: "Saturday", time: "10:00 AM – 4:00 PM IST" },
    { days: "Sunday", time: "Closed (online classes continue)" },
  ],
} as const;

export const ADMISSION_STEPS = [
  {
    title: "Send an enquiry",
    text: "Share the student's curriculum, grade, target exam and goals using the enquiry form.",
  },
  {
    title: "Diagnostic conversation",
    text: "A mentor reviews current level, gaps and priorities in a short, friendly call.",
  },
  {
    title: "Personalised plan",
    text: "You receive a recommended pathway, schedule and clear expectations.",
  },
  {
    title: "Begin learning",
    text: "Live classes, structured practice and progress tracking start right away.",
  },
] as const;

export const CONTACT_FAQS = [
  {
    question: "How quickly will I hear back?",
    answer: "We reply personally, usually within one working day.",
  },
  {
    question: "Do you teach students outside India?",
    answer:
      "Yes. Zenith Learning is fully online, so students can join live classes from anywhere in the world.",
  },
  {
    question: "Is there a free first conversation?",
    answer:
      "Every enquiry starts with a diagnostic conversation so we can recommend the right pathway before you commit.",
  },
  {
    question: "Can I visit the office?",
    answer:
      "Please book a time first so a mentor is available. Most families prefer an online call, which is available worldwide.",
  },
] as const;
