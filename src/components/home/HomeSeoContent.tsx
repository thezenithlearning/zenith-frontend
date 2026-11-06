import Link from "next/link";

import {
  SEO_ARTICLE_INTRO,
  SEO_ARTICLE_TITLE,
  SEO_KEYWORDS,
  SEO_LINKS,
  SEO_SECTIONS,
} from "@/content/seoArticle";

/** Long-form, server-rendered article for search engines and readers. Edit the copy in content/seoArticle.ts. */
export default function HomeSeoContent() {
  return (
    <section aria-labelledby="seo-article-title" className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-mid">The complete guide</p>
          <h2
            id="seo-article-title"
            className="font-display mt-4 text-3xl font-medium leading-tight tracking-tight text-brand-start sm:text-4xl lg:text-[2.6rem]"
          >
            {SEO_ARTICLE_TITLE}
          </h2>
          <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">{SEO_ARTICLE_INTRO}</p>
        </header>

        <div className="mt-14 grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav
              aria-label="Guide contents"
              className="rounded-3xl border border-slate-200 bg-surface-muted p-5"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-mid">In this guide</p>
              <ol className="mt-3 space-y-1.5 text-sm">
                {SEO_SECTIONS.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex gap-2 rounded-lg px-2 py-1 text-slate-600 transition hover:bg-white hover:text-brand-start"
                    >
                      <span className="w-5 shrink-0 font-semibold text-brand-mid">{i + 1}.</span>
                      <span>{section.heading}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0 space-y-12">
            {SEO_SECTIONS.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className="scroll-mt-28">
                <h3
                  id={`${section.id}-heading`}
                  className="font-display text-2xl font-medium leading-snug text-brand-start sm:text-3xl"
                >
                  {section.heading}
                </h3>
                <div className="mt-4 space-y-4 text-[15px] leading-8 text-slate-600 sm:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.bullets && (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-surface-muted p-5 sm:p-6">
                    {section.listTitle && (
                      <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-brand-mid">
                        {section.listTitle}
                      </h4>
                    )}
                    <ul className="mt-3 space-y-2.5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-3 text-[15px] leading-7 text-slate-700">
                          <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}

            <div className="rounded-3xl bg-brand-start p-6 text-white sm:p-8">
              <h3 className="font-display text-2xl font-medium">Keep exploring</h3>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {SEO_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-accent hover:text-brand-start"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-brand-mid">Popular topics</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {SEO_KEYWORDS.map((keyword) => (
                  <li
                    key={keyword}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600"
                  >
                    {keyword}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
