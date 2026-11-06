import type { Metadata } from "next";
import { ArrowUpRight, Clock3, Globe2, Mail, MessageCircle } from "lucide-react";
import AdmissionSteps from "@/components/contact/AdmissionSteps";
import OfficeLocation from "@/components/contact/OfficeLocation";
import ConnectStrip from "@/components/contact/ConnectStrip";
import Enquiry from "@/components/home/Enquiry";
import HomeFaq from "@/components/home/HomeFaq";
import { BRAND } from "@/content/brand";
import { CONTACT_FAQS } from "@/content/contact";

export const metadata: Metadata = { title: "Contact Us", description: "Talk to Zenith about your curriculum, learning goals and the right mentoring pathway." };

export default function ContactPage() {
  return <main className="overflow-x-hidden bg-white">
    <section className="relative overflow-hidden bg-surface-muted px-5 pb-14 pt-16 sm:px-8 sm:pt-24">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-40 h-[32rem] w-[32rem] rounded-full border-[60px] border-brand-mid/5" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[.24em] text-brand-mid">A conversation can change everything</p><h1 className="font-display mt-5 text-5xl leading-[1.08] tracking-tight text-brand-start sm:text-6xl lg:text-7xl">Your goals.<br /><span className="italic text-brand-mid">Let&apos;s talk about them.</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Choosing the right support is a big step. Ask a question, explore a course or tell us where you need a little guidance.</p></div>
        <div className="space-y-5 border-l-2 border-accent pl-6 text-sm text-slate-600"><p className="flex items-center gap-3"><Clock3 size={19} className="text-brand-mid" />Usually a reply within one working day</p><p className="flex items-center gap-3"><Globe2 size={19} className="text-brand-mid" />Online mentoring, wherever you learn</p><p className="flex items-center gap-3"><MessageCircle size={19} className="text-brand-mid" />A personal conversation with our team</p></div>
      </div>
    </section>
    <Enquiry variant="contact" />
    <section className="px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[.8fr_1fr_1fr]">
        <div><p className="text-xs font-bold uppercase tracking-widest text-brand-mid">A direct connection</p><h2 className="font-display mt-4 text-3xl text-brand-start">More comfortable<br />with email?</h2></div>
        {[{ title: "New to Zenith?", text: "Courses, learning pathways and getting started.", email: BRAND.admissionsEmail }, { title: "Already learning with us?", text: "Help for existing students and parents.", email: BRAND.supportEmail }].map(item => <a key={item.title} href={`mailto:${item.email}`} className="group min-w-0 rounded-2xl border border-slate-200 p-6 transition hover:border-brand-mid hover:bg-brand-start-soft focus-visible:outline-2 focus-visible:outline-brand-mid"><div className="flex items-center justify-between text-brand-mid"><Mail size={22} /><ArrowUpRight size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div><h3 className="mt-5 font-semibold text-brand-start">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p><p className="mt-4 break-all text-sm font-semibold text-brand-mid">{item.email}</p></a>)}
      </div>
    </section>
    <AdmissionSteps />
    <OfficeLocation />
    <HomeFaq items={CONTACT_FAQS} />
    <ConnectStrip />
  </main>;
}
