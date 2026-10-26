/**
 * Page builder sections (mirror of the backend model). The array order is
 * the public order. Every visible string is editor-entered data: nothing in
 * the renderer is fixed copy.
 */

export const SECTION_TYPES = [
  'hero',
  'content',
  'resources',
  'ads',
  'faq',
  'cta',
  'seoContent',
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const RESOURCE_TYPES = ['image', 'video', 'audio', 'pdf', 'file', 'link'] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export type Align = 'left' | 'center' | 'right';

export interface HeroData {
  html: string;
  backgroundImageUrl: string;
  backgroundColor: string;
  textColor: string;
  overlay: number;
  align: Align;
  height: 'sm' | 'md' | 'lg';
}

export interface ContentData {
  html: string;
}

export interface ResourceItem {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  openInNewTab: boolean;
}

export interface ResourcesData {
  layout: 'grid' | 'list';
  items: ResourceItem[];
}

export interface AdItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  buttonLabel: string;
  openInNewTab: boolean;
}

export interface AdsData {
  layout: 'single' | 'grid';
  label: string;
  items: AdItem[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqData {
  items: FaqItem[];
  openFirst: boolean;
  includeSchema: boolean;
}

export interface CtaButton {
  id: string;
  label: string;
  url: string;
  style: 'primary' | 'secondary' | 'outline';
  openInNewTab: boolean;
}

export interface CtaData {
  variant: 'banner' | 'text';
  align: Align;
  backgroundColor: string;
  textColor: string;
  backgroundImageUrl: string;
  buttons: CtaButton[];
}

export interface SeoContentData {
  html: string;
  collapsible: boolean;
  expandLabel: string;
}

interface SectionBase {
  id: string;
  /** Heading shown above the section - written by the editor. */
  title: string;
  description: string;
  showTitle: boolean;
  /** Hidden sections stay in the builder but are not published. */
  enabled: boolean;
}

export type Section =
  | (SectionBase & { type: 'hero'; data: HeroData })
  | (SectionBase & { type: 'content'; data: ContentData })
  | (SectionBase & { type: 'resources'; data: ResourcesData })
  | (SectionBase & { type: 'ads'; data: AdsData })
  | (SectionBase & { type: 'faq'; data: FaqData })
  | (SectionBase & { type: 'cta'; data: CtaData })
  | (SectionBase & { type: 'seoContent'; data: SeoContentData });

/** Labels for the *builder UI* only. Public text always comes from the editor's data. */
export const SECTION_META: Record<SectionType, { label: string; help: string }> = {
  hero: { label: 'Hero', help: 'Large intro banner. Design it visually or in code.' },
  content: { label: 'Rich content', help: 'Free-form text, images and embeds.' },
  resources: {
    label: 'Resources',
    help: 'PDFs, videos, images and files with names and descriptions.',
  },
  ads: { label: 'Mid-page ads', help: 'Banners and promos placed between content.' },
  faq: { label: 'FAQ', help: 'Questions and answers. Paste JSON to import.' },
  cta: { label: 'Call to action', help: 'A banner or text block with buttons and links.' },
  seoContent: {
    label: 'SEO content',
    help: 'Long-form text for search engines, optionally collapsible.',
  },
};

export function newId(): string {
  return crypto.randomUUID();
}

export function createSection(type: SectionType): Section {
  const base: SectionBase = {
    id: newId(),
    title: '',
    description: '',
    showTitle: true,
    enabled: true,
  };

  switch (type) {
    case 'hero':
      return {
        ...base,
        type,
        data: {
          html: '',
          backgroundImageUrl: '',
          backgroundColor: '',
          textColor: '',
          overlay: 40,
          align: 'center',
          height: 'md',
        },
      };
    case 'content':
      return { ...base, type, data: { html: '' } };
    case 'resources':
      return { ...base, type, data: { layout: 'grid', items: [] } };
    case 'ads':
      return { ...base, type, data: { layout: 'single', label: '', items: [] } };
    case 'faq':
      return { ...base, type, data: { items: [], openFirst: false, includeSchema: true } };
    case 'cta':
      return {
        ...base,
        type,
        showTitle: true,
        data: {
          variant: 'banner',
          align: 'center',
          backgroundColor: '',
          textColor: '',
          backgroundImageUrl: '',
          buttons: [],
        },
      };
    case 'seoContent':
      return { ...base, type, data: { html: '', collapsible: false, expandLabel: '' } };
  }
}

/** A readable name for a section in the builder list (user title first). */
export function sectionDisplayName(section: Section): string {
  return section.title.trim() || SECTION_META[section.type].label;
}

/* ------------------------------------------------------------- FAQ JSON */

interface ParsedFaq {
  items: Array<{ question: string; answer: string }>;
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toItem(entry: unknown): { question: string; answer: string } | null {
  if (!entry || typeof entry !== 'object') return null;

  const record = entry as Record<string, unknown>;

  // schema.org Question: { name, acceptedAnswer: { text } }
  const accepted = record.acceptedAnswer as Record<string, unknown> | undefined;

  const question =
    text(record.question) || text(record.q) || text(record.name) || text(record.title);
  const answer =
    text(record.answer) ||
    text(record.a) ||
    text(record.text) ||
    text(accepted?.text) ||
    text(record.content);

  return question && answer ? { question, answer } : null;
}

/**
 * Accepts the shapes people actually paste:
 *   [{ question, answer }]            [{ q, a }]
 *   { faqs | items | questions: [...] }
 *   schema.org FAQPage JSON-LD ({ mainEntity: [...] })
 * Throws an Error with a readable message when nothing usable is found.
 */
export function parseFaqJson(input: string): ParsedFaq {
  let parsed: unknown;

  try {
    parsed = JSON.parse(input);
  } catch (error) {
    throw new Error(
      `That is not valid JSON (${error instanceof Error ? error.message : 'parse error'}).`,
    );
  }

  let list: unknown = parsed;

  if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
    const record = parsed as Record<string, unknown>;

    list =
      record.mainEntity ??
      record.faqs ??
      record.faq ??
      record.items ??
      record.questions ??
      record.data;
  }

  if (!Array.isArray(list)) {
    throw new Error('Expected an array of questions, or an object containing one.');
  }

  const items = list
    .map(toItem)
    .filter((item): item is { question: string; answer: string } => item !== null);

  if (items.length === 0) {
    throw new Error('No questions found. Each entry needs a question and an answer.');
  }

  return { items };
}

/** Plain text answers become paragraphs; HTML answers are kept. */
export function answerToHtml(answer: string): string {
  return /<\/?[a-z][\s\S]*>/i.test(answer)
    ? answer
    : answer
        .split(/\n{2,}/)
        .map(
          (part) =>
            `<p>${part.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p>`,
        )
        .join('');
}

/* ------------------------------------------------------------- media */

/** Map an uploaded asset to the closest resource type. */
export function resourceTypeFor(asset: { assetType?: string; mimeType?: string }): ResourceType {
  if (asset.assetType === 'image') return 'image';
  if (asset.assetType === 'video') return 'video';
  if (asset.assetType === 'audio') return 'audio';
  if (asset.mimeType === 'application/pdf') return 'pdf';

  return 'file';
}

export function resourceTypeFromUrl(url: string): ResourceType {
  const clean = url.split('?')[0].toLowerCase();

  if (/youtu\.?be|vimeo\.com/.test(url)) return 'video';
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/.test(clean)) return 'image';
  if (/\.(mp4|webm|mov|m4v|ogv)$/.test(clean)) return 'video';
  if (/\.(mp3|wav|ogg|m4a|aac)$/.test(clean)) return 'audio';
  if (/\.pdf$/.test(clean)) return 'pdf';
  if (/\.(docx?|xlsx?|pptx?|zip|csv|txt)$/.test(clean)) return 'file';

  return 'link';
}

/** YouTube / Vimeo page URL -> privacy-friendly embed URL, or null for a direct file. */
export function toEmbedUrl(url: string): string | null {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i,
  );

  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`;

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);

  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}

/** Snippets the file helper copies for different file kinds. */
export function embedSnippet(asset: {
  url: string;
  assetType?: string;
  mimeType: string;
  title?: string;
  altText?: string;
  originalName: string;
}): string {
  const label = (asset.title || asset.originalName).replace(/"/g, '&quot;');

  if (asset.assetType === 'image') {
    return `<img src="${asset.url}" alt="${(asset.altText || label).replace(/"/g, '&quot;')}" />`;
  }

  if (asset.assetType === 'video') {
    return `<video src="${asset.url}" controls preload="metadata"></video>`;
  }

  if (asset.assetType === 'audio') {
    return `<audio src="${asset.url}" controls></audio>`;
  }

  return `<a href="${asset.url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

/** Deep copy with fresh ids, so a duplicated section never shares keys. */
export function cloneSection(section: Section): Section {
  const copy = JSON.parse(JSON.stringify(section)) as Section;

  copy.id = newId();

  if ('items' in copy.data) {
    copy.data.items = (copy.data.items as Array<{ id: string }>).map((item) => ({
      ...item,
      id: newId(),
    })) as never;
  }

  if (copy.type === 'cta') {
    copy.data.buttons = copy.data.buttons.map((button) => ({ ...button, id: newId() }));
  }

  return copy;
}
