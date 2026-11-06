export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  /** Optional photo: a CDN URL or a path under /public. Initials are shown when omitted. */
  photo?: string;
}

// Dummy portraits (pravatar.cc) — replace each `photo` with a real team photo (CDN URL or /public path).
const avatar = (id: number | string) => `https://i.pravatar.cc/400?img=${id}`;

// Placeholder people — replace names, roles, bios and photos with the real team.
export const FOUNDERS: TeamMember[] = [
  {
    name: "Founder Name",
    photo: avatar(12),
    role: "Founder & Lead Mentor",
    bio: "Physics educator focused on turning complex concepts into clear, exam-ready thinking.",
  },
  {
    name: "Co-Founder Name",
    photo: avatar(47),
    role: "Co-Founder & Academic Director",
    bio: "Designs the Zenith learning pathways and keeps every programme rigorous and personal.",
  },
];

export const TEAM: TeamMember[] = [
  {
    name: "Team Member One",
    photo: avatar(33),
    role: "Senior Mentor, Sciences",
    bio: "Guides IB and A Level students through problem solving.",
  },
  {
    name: "Team Member Two",
    photo: avatar(5),
    role: "Mentor, Mathematics",
    bio: "Builds confidence for SAT, AP and JEE preparation.",
  },
  {
    name: "Team Member Three",
    photo: avatar(15),
    role: "Learning Analyst",
    bio: "Tracks progress and spots gaps early with data.",
  },
  {
    name: "Team Member Four",
    photo: avatar(25),
    role: "Admissions Lead",
    bio: "Helps families choose the right pathway.",
  },
];
