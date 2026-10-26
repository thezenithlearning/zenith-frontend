import { Clock, Mail, MessageCircle } from "lucide-react";

import Enquiry from "@/components/home/Enquiry";
import PageHero from "@/components/home/PageHero";
import { BRAND } from "@/content/brand";

const CHANNELS = [
  {
    icon: Mail,
    title: "Admissions",
    text: "Questions about programs, fees and getting started.",
    value: BRAND.admissionsEmail,
    href: `mailto:${BRAND.admissionsEmail}`,
  },
  {
    icon: MessageCircle,
    title: "General support",
    text: "Existing students and parents.",
    value: BRAND.supportEmail,
    href: `mailto:${BRAND.supportEmail}`,
  },
  {
    icon: Clock,
    title: "Response time",
    text: "We reply personally, usually within one working day.",
    value: "Online · worldwide",
  },
];

export default function ContactPage() {
  return (
    <main className="overflow-x-hidden bg-white">
      <PageHero
        eyebrow="Admissions & Enquiries"
        title="Let's find the right pathway."
        description="Tell us the student's curriculum, grade, target exam and goals."
      />

      <section className="bg-surface-muted py-14">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          {CHANNELS.map((channel) => {
            const body = (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-start-soft text-brand-mid">
                  <channel.icon size={22} />
                </span>
                <h2 className="mt-5 text-lg font-semibold text-brand-start">{channel.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">{channel.text}</p>
                <p className="mt-4 break-all text-sm font-semibold text-brand-mid">{channel.value}</p>
              </>
            );
            const card = "block rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg";
            return channel.href ? (
              <a key={channel.title} href={channel.href} className={card}>
                {body}
              </a>
            ) : (
              <div key={channel.title} className={card}>
                {body}
              </div>
            );
          })}
        </div>
      </section>

      <Enquiry />
    </main>
  );
}
