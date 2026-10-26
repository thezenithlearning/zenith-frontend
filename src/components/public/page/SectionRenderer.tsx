/* eslint-disable @next/next/no-img-element -- media hosts are configurable CDNs */
import type { CSSProperties, ReactNode } from 'react';
import { FileText, Link2, Music } from 'lucide-react';

import {
  toEmbedUrl,
  type AdItem,
  type AdsData,
  type CtaButton,
  type CtaData,
  type FaqData,
  type HeroData,
  type ResourceItem,
  type ResourcesData,
  type SeoContentData,
  type Section,
} from '@/features/page/utils/sections';

import styles from './PageContent.module.css';
import { fragmentHtml } from './rawHtml';

/* -------------------------------------------------------------- helpers */

/** Keeps characters that could break out of url("...") out of inline styles. */
function cssUrl(url: string): string {
  return `url("${url.replace(/["'()\\\s]/g, (char) => encodeURIComponent(char))}")`;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

const ALIGN: Record<string, string> = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
};

function externalProps(openInNewTab: boolean) {
  return openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}

/* ------------------------------------------------------------- wrapper */

function Frame({
  section,
  children,
  bare = false,
}: {
  section: Section;
  children: ReactNode;
  /** Bare sections (hero, CTA banner) draw their own heading inside. */
  bare?: boolean;
}) {
  const heading = section.showTitle && section.title.trim();
  const description = section.description.trim();

  return (
    <section
      id={`section-${section.id}`}
      aria-label={section.title.trim() || undefined}
      className="my-10 first:mt-0"
    >
      {!bare && (heading || description) && (
        <header className="mb-5">
          {heading && <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>}
          {description && <p className="mt-1 text-slate-600 ">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

/* ---------------------------------------------------------------- hero */

const HERO_HEIGHT = { sm: 'min-h-[14rem]', md: 'min-h-[22rem]', lg: 'min-h-[32rem]' } as const;

function Hero({ section, data }: { section: Section; data: HeroData }) {
  const style: CSSProperties = {
    backgroundColor: data.backgroundColor || undefined,
    color: data.textColor || undefined,
    backgroundImage: data.backgroundImageUrl ? cssUrl(data.backgroundImageUrl) : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const heading = section.showTitle && section.title.trim();

  return (
    <section
      id={`section-${section.id}`}
      className={`relative my-10 flex overflow-hidden rounded-xl first:mt-0 ${HERO_HEIGHT[data.height]} ${
        data.backgroundColor || data.backgroundImageUrl ? '' : 'bg-slate-100 '
      }`}
      style={style}
    >
      {data.backgroundImageUrl && data.overlay > 0 && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${data.overlay / 100})` }}
          aria-hidden="true"
        />
      )}

      <div
        className={`relative flex w-full flex-col justify-center gap-3 px-6 py-12 sm:px-12 ${ALIGN[data.align]}`}
      >
        {heading && <h2 className="text-4xl font-bold tracking-tight">{section.title}</h2>}
        {section.description.trim() && (
          <p className="max-w-2xl text-lg opacity-90">{section.description}</p>
        )}
        {data.html && (
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: data.html }} />
        )}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- resources */

function ResourceMedia({ item }: { item: ResourceItem }) {
  if (item.type === 'image' && item.url) {
    return (
      <img
        src={item.url}
        alt={item.title}
        loading="lazy"
        className="aspect-video w-full object-cover"
      />
    );
  }

  if (item.type === 'video' && item.url) {
    const embed = toEmbedUrl(item.url);

    return embed ? (
      <div className="aspect-video w-full">
        <iframe
          src={embed}
          title={item.title || 'Video'}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full border-0"
        />
      </div>
    ) : (
      <video
        src={item.url}
        controls
        preload="metadata"
        poster={item.thumbnailUrl || undefined}
        className="aspect-video w-full bg-black"
      />
    );
  }

  if (item.type === 'audio' && item.url) {
    return (
      <div className="flex aspect-video items-center gap-3 bg-slate-100 p-4 ">
        <Music className="h-6 w-6 shrink-0 text-slate-500" aria-hidden="true" />
        <audio src={item.url} controls className="w-full" />
      </div>
    );
  }

  if (item.thumbnailUrl) {
    return (
      <img
        src={item.thumbnailUrl}
        alt=""
        loading="lazy"
        className="aspect-video w-full object-cover"
      />
    );
  }

  const Icon = item.type === 'link' ? Link2 : FileText;

  return (
    <div className="flex aspect-video items-center justify-center bg-slate-100 text-slate-400 ">
      <Icon className="h-10 w-10" aria-hidden="true" />
    </div>
  );
}

function Resource({ item }: { item: ResourceItem }) {
  const playable = (item.type === 'video' || item.type === 'audio') && item.url;
  const link = item.url ? (
    <a
      href={item.url}
      className="font-medium hover:underline"
      {...externalProps(item.openInNewTab)}
    >
      {item.title || item.url}
    </a>
  ) : (
    <span className="font-medium">{item.title}</span>
  );

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white text-slate-900 shadow-sm">
      {/* Playable media must not sit inside a link; everything else is clickable via the title. */}
      <ResourceMedia item={item} />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-base">{playable || item.title || item.url ? link : null}</h3>
        {item.description && <p className="text-sm text-slate-600 ">{item.description}</p>}
      </div>
    </article>
  );
}

function Resources({ data }: { data: ResourcesData }) {
  if (data.items.length === 0) return null;

  return (
    <ul
      className={
        data.layout === 'grid'
          ? 'grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3'
          : 'mx-auto max-w-3xl space-y-6'
      }
    >
      {data.items.map((item) => (
        <li key={item.id} className="h-full">
          <Resource item={item} />
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ ads */

function Ad({ item, label }: { item: AdItem; label: string }) {
  const body = (
    <>
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.title} loading="lazy" className="w-full object-cover" />
      )}
      <div className="p-4">
        {label && (
          <span className="mb-2 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-slate-500 ">
            {label}
          </span>
        )}
        {item.title && <h3 className="text-lg font-semibold">{item.title}</h3>}
        {item.description && <p className="mt-1 text-sm text-slate-600 ">{item.description}</p>}
      </div>
    </>
  );

  const className = 'block overflow-hidden rounded-lg border border-slate-200 ';

  return item.linkUrl ? (
    <a href={item.linkUrl} className={className} {...externalProps(item.openInNewTab)}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}

function Ads({ data }: { data: AdsData }) {
  if (data.items.length === 0) return null;

  return (
    <ul className={data.layout === 'grid' ? 'grid gap-5 sm:grid-cols-2' : 'space-y-5'}>
      {data.items.map((item) => (
        <li key={item.id}>
          <Ad item={item} label={data.label} />
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ faq */

function Faq({ data }: { data: FaqData }) {
  if (data.items.length === 0) return null;

  return (
    <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 ">
      {data.items.map((item, index) => (
        <details key={item.id} open={data.openFirst && index === 0} className="group p-4">
          <summary className="cursor-pointer list-none font-medium marker:hidden [&::-webkit-details-marker]:hidden">
            <span className="flex items-start justify-between gap-4">
              {item.question}
              <span
                aria-hidden="true"
                className="text-slate-400 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <div
            className={`${styles.content} mt-3 text-slate-700 `}
            dangerouslySetInnerHTML={{ __html: item.answer }}
          />
        </details>
      ))}
    </div>
  );
}

/** One FAQPage for the whole page, built from every FAQ section that opted in. */
function faqSchema(sections: Section[]): Record<string, unknown> | null {
  const entities = sections.flatMap((section) =>
    section.type === 'faq' && section.data.includeSchema
      ? section.data.items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: stripTags(item.answer) },
        }))
      : [],
  );

  return entities.length > 0
    ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities }
    : null;
}

/* ------------------------------------------------------------------ cta */

const BUTTON_STYLES: Record<CtaButton['style'], string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-slate-900 text-white hover:bg-slate-700 ',
  outline: 'border border-current hover:bg-black/10 ',
};

function Cta({
  section,
  data,
  flush = false,
}: {
  section: Section;
  data: CtaData;
  flush?: boolean;
}) {
  const banner = data.variant === 'banner';
  const heading = section.showTitle && section.title.trim();
  const description = section.description.trim();
  const buttons = data.buttons.filter((button) => button.label.trim() && button.url);

  const style: CSSProperties = banner
    ? {
        backgroundColor: data.backgroundColor || undefined,
        color: data.textColor || undefined,
        backgroundImage: data.backgroundImageUrl ? cssUrl(data.backgroundImageUrl) : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { color: data.textColor || undefined };

  const justify =
    data.align === 'center'
      ? 'justify-center'
      : data.align === 'right'
        ? 'justify-end'
        : 'justify-start';

  const content = (
    <div className={`mx-auto flex w-full max-w-3xl flex-col gap-4 ${ALIGN[data.align]}`}>
      {heading && (
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{section.title}</h2>
      )}
      {description && (
        <p className="max-w-2xl text-lg leading-relaxed opacity-90">{section.description}</p>
      )}

      {buttons.length > 0 && (
        <div className={`mt-2 flex w-full flex-wrap gap-3 ${justify}`}>
          {buttons.map((button) => (
            <a
              key={button.id}
              href={button.url}
              className={`inline-flex min-w-[10rem] items-center justify-center rounded-lg px-6 py-3 text-base font-semibold shadow-sm transition-colors ${BUTTON_STYLES[button.style]}`}
              {...externalProps(button.openInNewTab)}
            >
              {button.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  // Raw pages: banners run edge to edge; inline CTAs sit in a padded card.
  if (flush) {
    return banner ? (
      <section
        id={`section-${section.id}`}
        className={`w-full px-5 py-16 sm:px-8 sm:py-20 ${data.backgroundColor || data.backgroundImageUrl ? '' : 'bg-slate-100 text-slate-900'}`}
        style={style}
      >
        {content}
      </section>
    ) : (
      <section id={`section-${section.id}`} className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
        <div
          className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm sm:p-12"
          style={style}
        >
          {content}
        </div>
      </section>
    );
  }

  return (
    <section
      id={`section-${section.id}`}
      className={`my-10 first:mt-0 ${
        banner
          ? `rounded-xl px-6 py-12 sm:px-12 ${data.backgroundColor || data.backgroundImageUrl ? '' : 'bg-slate-100 '}`
          : 'border-l-4 border-blue-600 pl-5'
      }`}
      style={style}
    >
      {content}
    </section>
  );
}

/* ---------------------------------------------------------- seo content */

function SeoContent({ section, data }: { section: Section; data: SeoContentData }) {
  if (!data.html) return null;

  const content = (
    <div className={styles.content} dangerouslySetInnerHTML={{ __html: data.html }} />
  );
  const label = data.expandLabel.trim() || section.title.trim();

  if (!data.collapsible || !label) return content;

  return (
    <details className="group rounded-lg border border-slate-200 p-4 ">
      <summary className="cursor-pointer font-medium">{label}</summary>
      <div className="mt-4">{content}</div>
    </details>
  );
}

/* --------------------------------------------------------------- public */

function renderSection(section: Section): ReactNode {
  switch (section.type) {
    case 'hero':
      return <Hero key={section.id} section={section} data={section.data} />;

    case 'cta':
      return <Cta key={section.id} section={section} data={section.data} />;

    case 'content':
      return (
        <Frame key={section.id} section={section}>
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: section.data.html }} />
        </Frame>
      );

    case 'resources':
      return (
        <Frame key={section.id} section={section}>
          <Resources data={section.data} />
        </Frame>
      );

    case 'ads':
      return (
        <Frame key={section.id} section={section}>
          <Ads data={section.data} />
        </Frame>
      );

    case 'faq':
      return (
        <Frame key={section.id} section={section}>
          <Faq data={section.data} />
        </Frame>
      );

    case 'seoContent':
      return (
        <Frame key={section.id} section={section}>
          <SeoContent section={section} data={section.data} />
        </Frame>
      );
  }
}

/**
 * Renders sections in exactly the order they were arranged in the builder.
 * Disabled sections are skipped (the API already omits them publicly; the
 * builder preview relies on this filter).
 */
export function SectionRenderer({ sections }: { sections: Section[] }) {
  const visible = sections.filter((section) => section.enabled);
  const schema = faqSchema(visible);

  return (
    <>
      {visible.map(renderSection)}

      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ raw */

/** Structured sections carry no author CSS, so give them a centred, padded container. */
function RawBlock({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">{children}</div>;
}

function RawSection({ section }: { section: Section }): ReactNode {
  switch (section.type) {
    // Rich-text sections: only the author's HTML, nothing around it.
    case 'hero':
    case 'content':
    case 'seoContent':
      return section.data.html ? (
        <div dangerouslySetInnerHTML={{ __html: fragmentHtml(section.data.html) }} />
      ) : null;

    case 'faq':
      return (
        <div>
          {section.data.items.map((item, index) => (
            <details key={item.id} open={section.data.openFirst && index === 0}>
              <summary>{item.question}</summary>
              <div dangerouslySetInnerHTML={{ __html: fragmentHtml(item.answer) }} />
            </details>
          ))}
        </div>
      );

    // Structured sections have no author HTML; render their built-in markup without the section frame.
    case 'resources':
      return (
        <RawBlock>
          <Resources data={section.data} />
        </RawBlock>
      );

    case 'ads':
      return (
        <RawBlock>
          <Ads data={section.data} />
        </RawBlock>
      );

    case 'cta':
      return <Cta section={section} data={section.data} flush />;
  }
}

/**
 * Renders every enabled section back to back, in builder order, with no
 * wrapper, margins, titles or typography styles: the page is exactly what
 * the author wrote.
 */
export function RawSections({ sections }: { sections: Section[] }) {
  const visible = sections.filter((section) => section.enabled);
  const schema = faqSchema(visible);

  return (
    <>
      {visible.map((section) => (
        <RawSection key={section.id} section={section} />
      ))}

      {schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      )}
    </>
  );
}
