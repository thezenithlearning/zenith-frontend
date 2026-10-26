import type { Section } from '@/features/page/utils/sections';

export const NODE_TYPES = ['folder', 'page'] as const;
export const NODE_STATUSES = ['draft', 'published', 'archived'] as const;
export const FOLDER_BEHAVIORS = ['landing', 'redirect', 'structural'] as const;
export const PAGE_LAYOUTS = ['standard', 'landing', 'article', 'directory', 'sidebar'] as const;
export const PAGE_WIDTHS = ['narrow', 'normal', 'wide'] as const;
export const CHILD_DISPLAYS = ['none', 'list', 'cards'] as const;
export const TWITTER_CARDS = ['summary', 'summary_large_image'] as const;
export const CHANGE_FREQUENCIES = [
  'always',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'yearly',
  'never',
] as const;

export type NodeType = (typeof NODE_TYPES)[number];
export type NodeStatus = (typeof NODE_STATUSES)[number];
export type FolderBehavior = (typeof FOLDER_BEHAVIORS)[number];
export type PageLayout = (typeof PAGE_LAYOUTS)[number];
export type PageWidth = (typeof PAGE_WIDTHS)[number];
export type ChildDisplay = (typeof CHILD_DISPLAYS)[number];
export type TwitterCard = (typeof TWITTER_CARDS)[number];
export type ChangeFrequency = (typeof CHANGE_FREQUENCIES)[number];

export interface SeoSettings {
  title: string;
  description: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: TwitterCard;
  keywords: string[];
  breadcrumbTitle: string;
  sitemapInclude: boolean;
  sitemapPriority: number | null;
  sitemapChangeFrequency: ChangeFrequency | null;
}

export interface AppearanceSettings {
  layout: PageLayout;
  pageWidth: PageWidth;
  showHeading: boolean;
  showBreadcrumbs: boolean;
  coverImageUrl: string;
  coverImageAlt: string;
  childDisplay: ChildDisplay;
  childrenTitle: string;
}

export interface NavigationSettings {
  showInNavigation: boolean;
}

export interface IPageNode {
  id: string;
  parentId: string | null;
  title: string;
  slug: string;
  type: NodeType;
  status: NodeStatus;
  order: number;
  heading: string;
  summary: string;
  folderBehavior: FolderBehavior;
  seo: SeoSettings;
  appearance: AppearanceSettings;
  navigation: NavigationSettings;
  publishAt: string | null;
  unpublishAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  path: string;
  publicUrl: string;
  isLive: boolean;
  childCount: number;
  /** Only on single-node reads. */
  html?: string;
  sections?: Section[];
}

export interface BreadcrumbItem {
  id: string;
  label: string;
  path: string | null;
}

export interface NodeDetail {
  node: IPageNode;
  breadcrumbs: BreadcrumbItem[];
}

export interface NodeImpact {
  directChildren: number;
  descendants: number;
}

export interface Summary {
  folders: number;
  pages: number;
  total: number;
  published: number;
  draft: number;
  archived: number;
  noindex: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NodeListQuery {
  /** "root" for top level, an id for a folder's children, undefined = anywhere. */
  parentId?: string | 'root';
  search?: string;
  type?: NodeType;
  status?: NodeStatus;
  navigation?: boolean;
  indexed?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'order' | 'title' | 'updatedAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface NodeListResult {
  items: IPageNode[];
  pagination: Pagination;
}

/** Form / API payload for create + update (parent is handled by move). */
export interface NodeInput {
  title: string;
  slug?: string;
  status?: NodeStatus;
  order?: number;
  heading?: string;
  summary?: string;
  html?: string;
  sections?: Section[];
  folderBehavior?: FolderBehavior;
  seo?: Partial<SeoSettings>;
  appearance?: Partial<AppearanceSettings>;
  navigation?: Partial<NavigationSettings>;
  publishAt?: string | null;
  unpublishAt?: string | null;
}

export type CreateNodePayload = NodeInput & {
  type: NodeType;
  parentId: string | null;
};

export type BulkAction =
  'publish' | 'unpublish' | 'showInNavigation' | 'hideFromNavigation' | 'delete';

export interface BulkResult {
  succeeded: string[];
  failed: Array<{ id: string; message: string }>;
}

/* ------------------------------ public ------------------------------ */

export interface ResolvedSeo {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    image: string | null;
    type: 'website';
    url: string;
  };
  twitter: {
    card: TwitterCard;
    title: string;
    description: string;
    image: string | null;
  };
}

export interface PublicChild {
  id: string;
  title: string;
  summary: string;
  type: NodeType;
  path: string;
  coverImageUrl: string;
}

export interface PublicPageView {
  id: string;
  title: string;
  heading: string;
  summary: string;
  html: string;
  sections: Section[];
  type: NodeType;
  folderBehavior: FolderBehavior;
  appearance: AppearanceSettings;
  path: string;
  seo: ResolvedSeo;
  breadcrumbs: BreadcrumbItem[];
  breadcrumbJsonLd: Record<string, unknown>;
  children: PublicChild[];
  updatedAt: string;
}

export type ResolveResult =
  { kind: 'page'; view: PublicPageView } | { kind: 'redirect'; to: string };

export interface SitemapEntry {
  path: string;
  lastModified: string;
  priority: number | null;
  changeFrequency: ChangeFrequency | null;
}
