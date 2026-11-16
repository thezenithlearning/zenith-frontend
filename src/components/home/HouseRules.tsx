"use client";

import Link from "next/link";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Clock, Folder, Hand, HeartHandshake, Medal, Plus, Users } from "lucide-react";

import { Reveal } from "./ui";

type Rule = { idiom: string; meaning: string };
type Category = { name: string; icon: LucideIcon; rules: Rule[] };

const CATEGORIES: Category[] = [
  {
    name: "Folder and materials",
    icon: Folder,
    rules: [
      {
        idiom: "Get your ducks in a row—because 'the dog ate my digital homework' won't fly here!",
        meaning:
          "We set up a dedicated, neat-as-a-pin Zenith Digital Folder for every student from day one. Keeping all notes, worksheets, and recordings in one spot means zero frantic searching and more time for actual learning.",
      },
      {
        idiom: "Don't let your desktop become a wild goose chase; a place for every file, and every file in its place.",
        meaning:
          "Organization is half the battle! By filing assignments properly, your child builds lifelong study habits—and you never have to play detective looking for lost study guides.",
      },
    ],
  },
  {
    name: "Attendance",
    icon: Clock,
    rules: [
      {
        idiom: "Time and tide wait for no student—and neither does our class clock!",
        meaning:
          "Our sessions start right on the dot to make sure your child gets every single minute of learning they deserve. If a student arrives a little late, we dive right in, though the session will still wrap up at its scheduled time.",
      },
      {
        idiom: "Don't pull a vanishing act; give us a heads-up before you ghost the schedule.",
        meaning:
          "Life happens, and we completely understand! Just let us know in advance if you need to reschedule so we can keep your child's learning momentum rolling smoothly.",
      },
      {
        idiom: "No crystal balls or time machines here; missed classes don't roll over to tomorrow.",
        meaning:
          "To keep our tutors' schedules running like clockwork, unexcused absences or last-minute no-shows are forfeited and cannot be rolled over into future weeks.",
      },
    ],
  },
  {
    name: "Student effort",
    icon: HeartHandshake,
    rules: [
      {
        idiom: "Rome wasn't built in a day, so messy mistakes are fine—just don't leave us high and dry with blank pages!",
        meaning:
          "We love wrong answers because they show us exactly how your child thinks. All we ask is that students give every problem an honest try rather than leaving their homework blank.",
      },
      {
        idiom: "It takes two to tango: we bring the brainpower, you bring the elbow grease.",
        meaning:
          "True academic growth is a two-way street. We provide custom-tailored lessons and enthusiastic coaching, while your child brings curiosity, focus, and consistent effort to the table.",
      },
      {
        idiom: "No beating around the bush—if effort goes out the window, we'll have a friendly heart-to-heart.",
        meaning:
          "We respect your hard-earned money too much to let your child coast. If we ever notice a dip in effort or participation, we will reach out honestly so we can get them back on track together.",
      },
    ],
  },
  {
    name: "Zenith Medals",
    icon: Medal,
    rules: [
      {
        idiom: "Put your nose to the grindstone and watch your hard work turn into golden tickets!",
        meaning:
          "Consistency deserves a celebration! Students earn Zenith Medals for showing up on time, completing homework, and asking great questions—which can be redeemed for free extra classes and bonus perks.",
      },
      {
        idiom: "Good things come to those who hustle—cash in your Zenith Medals when you're in a pickle with homework.",
        meaning:
          "Stuck on a tricky concept right before a big test? Students can trade in their hard-earned medals for priority doubt-clearing support whenever they need an extra boost.",
      },
    ],
  },
  {
    name: "Parents",
    icon: Users,
    rules: [
      {
        idiom: "We're all in the same boat—hop in the co-pilot seat and keep an eye on the weekly progress map!",
        meaning:
          "You never have to wonder how your child is doing. Every week, we send a quick, easy-to-read snapshot of their wins, milestones, and focus areas straight to you.",
      },
      {
        idiom: "Keep your ear to the ground with our cheat-sheet for getting more than a 'fine' out of your teenager.",
        meaning:
          "Asking \"How was class?\" usually leads to one-word answers. We give you specific, fun conversation starters based on that week's lesson so you can actually hear all about what they learned.",
      },
    ],
  },
];

export default function HouseRules() {
  const [catIndex, setCatIndex] = useState(1);
  const [ruleIndex, setRuleIndex] = useState(0);
  const category = CATEGORIES[catIndex];
  const rule = category.rules[Math.min(ruleIndex, category.rules.length - 1)];
  const Icon = category.icon;

  const pickCategory = (i: number) => {
    setCatIndex(i);
    setRuleIndex(0);
  };

  return (
    <section aria-labelledby="house-rules-title" className="bg-surface-muted py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-3xl border border-[#E3E7F2] bg-white px-5 py-8 text-brand-start shadow-sm sm:px-8 sm:py-10 lg:px-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-dark">How we work together</p>
            <h2 id="house-rules-title" className="font-display text-2xl leading-snug sm:text-3xl lg:text-4xl">
              The fine print.{" "}
              <em className="bg-[linear-gradient(transparent_58%,#FCE29A_58%)] px-0.5">Minus the yawns.</em>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5C6788] sm:text-base">
              <span className="hidden md:inline">Hover an idiom on the left; its meaning appears alongside.</span>
              <span className="md:hidden">Tap a line to unfold what it means.</span>
            </p>

            {/* ---------- Category tabs ---------- */}
            <div role="tablist" aria-label="House rule categories" className="-mx-1 my-5 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
              {CATEGORIES.map((c, i) => {
                const TabIcon = c.icon;
                const on = i === catIndex;
                return (
                  <button
                    key={c.name}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls="house-rules-panel"
                    onClick={() => pickCategory(i)}
                    className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                      on
                        ? "border-brand-start bg-brand-start font-medium text-white"
                        : "border-[#CCD3E6] bg-white text-[#5C6788] hover:bg-[#F5F7FC] hover:text-brand-start"
                    }`}
                  >
                    <TabIcon aria-hidden="true" className={`h-4 w-4 ${on ? "text-accent" : ""}`} />
                    {c.name}
                  </button>
                );
              })}
            </div>

            <div id="house-rules-panel" role="tabpanel" aria-label={category.name}>
              {/* ---------- Desktop: split spotlight ---------- */}
              <div className="hidden items-stretch gap-4 md:grid md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  {category.rules.map((r, j) => {
                    const on = r === rule;
                    return (
                      <button
                        key={r.idiom}
                        type="button"
                        onMouseEnter={() => setRuleIndex(j)}
                        onFocus={() => setRuleIndex(j)}
                        onClick={() => setRuleIndex(j)}
                        aria-pressed={on}
                        className={`relative overflow-hidden rounded-lg border py-3 pl-[18px] pr-3.5 text-left font-display text-sm italic leading-normal outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent/60 ${
                          on ? "border-accent bg-accent-soft" : "border-[#D9DEEC] bg-white hover:bg-[#FAFBFE]"
                        }`}
                      >
                        <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 bg-accent transition-opacity duration-200 ${on ? "opacity-100" : "opacity-0"}`} />
                        {r.idiom}
                      </button>
                    );
                  })}
                </div>

                <div aria-live="polite" className="flex min-h-56 flex-col justify-center rounded-xl border border-[#D9DEEC] bg-[#FAFBFE] p-5">
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#FCE29A] text-brand-start">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <p className="mb-1.5 text-xs font-medium text-accent-dark">In plain words</p>
                  <p className="text-sm leading-relaxed text-[#2A3358]">{rule.meaning}</p>
                  <p className="mt-3 text-xs text-[#5C6788]">
                    {category.rules.indexOf(rule) + 1} of {category.rules.length} · {category.name}
                  </p>
                </div>
              </div>

              {/* ---------- Mobile: accordion rows ---------- */}
              <div className="md:hidden">
                {category.rules.map((r, j) => {
                  const on = r === rule;
                  return (
                    <div key={r.idiom} className="border-b border-[#D9DEEC] first:border-t">
                      <button
                        type="button"
                        aria-expanded={on}
                        onClick={() => setRuleIndex(j)}
                        className="flex w-full items-center justify-between gap-3 px-1 py-3.5 text-left font-display text-[15px] italic leading-normal outline-none focus-visible:bg-accent-soft"
                      >
                        <span>{r.idiom}</span>
                        <Plus
                          aria-hidden="true"
                          className={`h-[18px] w-[18px] shrink-0 transition-transform duration-300 ${on ? "rotate-45 text-accent-dark" : "text-[#5C6788]"}`}
                        />
                      </button>
                      <div className={`grid transition-[grid-template-rows] duration-300 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                        <div className="overflow-hidden">
                          <p className="mx-1 mb-4 border-l-4 border-accent bg-accent-soft px-4 py-3 text-[13px] leading-relaxed text-[#2A3358]">
                            {r.meaning}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ---------- Footer ---------- */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5">
              <p className="flex items-center gap-1.5 text-xs text-[#5C6788]">
                <Hand aria-hidden="true" className="h-3.5 w-3.5" /> Hover on desktop, tap on mobile
              </p>
              <Link
                href="/terms-conditions"
                className="inline-flex h-9 items-center rounded-full bg-accent px-[18px] text-[13px] font-medium text-brand-start transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-start"
              >
                Read all policies
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
