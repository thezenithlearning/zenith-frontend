import Image from "next/image";

import { FOUNDERS, TEAM, type TeamMember } from "@/content/team";
import { Reveal, SectionHeading } from "./ui";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Avatar({ member, className }: { member: TeamMember; className: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden bg-brand-start ${className}`}>
      {member.photo ? (
        <Image
          src={member.photo}
          alt={member.name}
          fill
          sizes="(min-width: 1024px) 160px, 96px"
          className="object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="font-display absolute inset-0 flex items-center justify-center text-2xl font-medium text-accent sm:text-3xl"
        >
          {initials(member.name)}
        </span>
      )}
    </div>
  );
}

function FounderCard({ member, delay }: { member: TeamMember; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="flex h-full flex-col items-center gap-5 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:flex-row sm:p-8 sm:text-left">
        <Avatar member={member} className="h-28 w-28 rounded-2xl sm:h-32 sm:w-32 lg:h-40 lg:w-40" />
        <div className="min-w-0">
          <h3 className="font-display text-xl font-medium text-brand-start sm:text-2xl">{member.name}</h3>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-mid">{member.role}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{member.bio}</p>
        </div>
      </article>
    </Reveal>
  );
}

function MemberCard({ member, delay }: { member: TeamMember; delay: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-5 text-center transition hover:-translate-y-1 hover:shadow-md">
        <Avatar member={member} className="h-20 w-20 rounded-full sm:h-24 sm:w-24" />
        <h3 className="mt-4 text-base font-semibold text-brand-start">{member.name}</h3>
        <p className="mt-0.5 text-xs font-semibold text-brand-mid">{member.role}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">{member.bio}</p>
      </article>
    </Reveal>
  );
}

export default function Team() {
  return (
    <section className="bg-surface-muted py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Our Team"
            title={
              <>
                The people behind <span className="italic text-brand-mid">Zenith.</span>
              </>
            }
            description="Educators and mentors committed to clarity, rigour and every student's progress."
          />
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2 lg:gap-6">
          {FOUNDERS.map((member, i) => (
            <FounderCard key={member.name} member={member} delay={i * 0.08} />
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {TEAM.map((member, i) => (
            <MemberCard key={member.name} member={member} delay={i * 0.06} />
          ))}
        </div>
      </div>
    </section>
  );
}
