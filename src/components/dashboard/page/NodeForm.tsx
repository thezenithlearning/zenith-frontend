'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, FolderInput, Globe, LoaderCircle, Save } from 'lucide-react';

import { Notice } from '@/components/dashboard/page/ui/Notice';
import {
  cardClass,
  hintClass,
  inputClass,
  labelClass,
  primaryButton,
  secondaryButton,
} from '@/components/dashboard/page/ui/styles';
import { getApiErrorMessage } from '@/lib/apiError';
import { FilePickerDialog } from './builder/FilePickerDialog';

import { usePageActions } from '@/features/page/hooks/usePage';
import { DASHBOARD_PAGES_PATH } from '@/features/page/config';
import {
  CHANGE_FREQUENCIES,
  CHILD_DISPLAYS,
  FOLDER_BEHAVIORS,
  NODE_STATUSES,
  PAGE_LAYOUTS,
  PAGE_WIDTHS,
  TWITTER_CARDS,
  type AppearanceSettings,
  type NodeImpact,
  type NodeInput,
  type NodeType,
  type IPageNode,
  type SeoSettings,
} from '@/features/page/types';
import {
  formatDateTime,
  fromLocalInput,
  joinPath,
  publicUrlFor,
  slugifyTitle,
  toLocalInput,
  validateSlug,
} from '@/features/page/utils';

import { buildPreviewView, PreviewDialog } from './builder/PreviewDialog';
import { SectionBuilder } from './builder/SectionBuilder';
import { createSection, newId, type Section } from '@/features/page/utils/sections';

import { NodePicker } from './NodePicker';
import { SeoPreview } from './SeoPreview';

type TabId = 'content' | 'seo' | 'appearance' | 'navigation' | 'publishing' | 'advanced';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'content', label: 'Content' },
  { id: 'seo', label: 'SEO' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'publishing', label: 'Publishing' },
  { id: 'advanced', label: 'Advanced' },
];

type RobotsMode = 'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow';

const ROBOTS_OPTIONS: Array<{ value: RobotsMode; label: string }> = [
  { value: 'index,follow', label: 'Index, follow (recommended)' },
  { value: 'noindex,follow', label: 'Noindex, follow' },
  { value: 'index,nofollow', label: 'Index, nofollow' },
  { value: 'noindex,nofollow', label: 'Noindex, nofollow' },
];

const LAYOUT_HELP: Record<(typeof PAGE_LAYOUTS)[number], string> = {
  standard: 'Heading, content, then child links.',
  article: 'Narrow reading column for long text.',
  landing: 'Centered hero with a wide content area.',
  directory: 'Child pages shown first as a directory.',
  sidebar: 'Content with a section menu on the side.',
};

interface FormState {
  title: string;
  slug: string;
  parentId: string | null;
  parentPath: string;
  status: NodeInput['status'] & string;
  order: string;
  heading: string;
  summary: string;
  sections: Section[];
  folderBehavior: (typeof FOLDER_BEHAVIORS)[number];
  seo: SeoSettings;
  keywordsText: string;
  appearance: AppearanceSettings;
  showInNavigation: boolean;
  publishAt: string;
  unpublishAt: string;
}

const defaultSeo: SeoSettings = {
  title: '',
  description: '',
  canonicalUrl: '',
  robotsIndex: true,
  robotsFollow: true,
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  twitterCard: 'summary_large_image',
  keywords: [],
  breadcrumbTitle: '',
  sitemapInclude: true,
  sitemapPriority: null,
  sitemapChangeFrequency: null,
};

const defaultAppearance: AppearanceSettings = {
  layout: 'standard',
  pageWidth: 'normal',
  showHeading: true,
  showBreadcrumbs: true,
  coverImageUrl: '',
  coverImageAlt: '',
  childDisplay: 'none',
  childrenTitle: '',
};

function initialState(
  node: IPageNode | undefined,
  parentId: string | null,
  parentPath: string,
): FormState {
  return {
    title: node?.title ?? '',
    slug: node?.slug ?? '',
    parentId: node ? node.parentId : parentId,
    parentPath,
    status: node?.status ?? 'draft',
    order: node ? String(node.order) : '',
    heading: node?.heading ?? '',
    summary: node?.summary ?? '',
    sections: initialSections(node),
    folderBehavior: node?.folderBehavior ?? 'landing',
    seo: node?.seo ?? defaultSeo,
    keywordsText: (node?.seo.keywords ?? []).join(', '),
    appearance: node?.appearance ?? defaultAppearance,
    showInNavigation: node?.navigation.showInNavigation ?? true,
    publishAt: toLocalInput(node?.publishAt ?? null),
    unpublishAt: toLocalInput(node?.unpublishAt ?? null),
  };
}

/** What gets compared / sent. HTML is excluded from the baseline until the designer reports it. */
function toPayload(form: FormState): NodeInput {
  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    status: form.status,
    ...(form.order !== '' ? { order: Number(form.order) } : {}),
    heading: form.heading.trim(),
    summary: form.summary.trim(),
    // Content now lives in sections; the legacy single body is retired on save.
    html: '',
    sections: form.sections,
    folderBehavior: form.folderBehavior,
    seo: {
      ...form.seo,
      keywords: form.keywordsText
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    },
    appearance: form.appearance,
    navigation: { showInNavigation: form.showInNavigation },
    publishAt: fromLocalInput(form.publishAt),
    unpublishAt: fromLocalInput(form.unpublishAt),
  };
}

interface NodeFormProps {
  mode: 'new' | 'edit';
  type: NodeType;
  node?: IPageNode;
  initialParentId?: string | null;
  initialParentPath?: string;
  onSaved?: (node: IPageNode) => void;
}

export function NodeForm({
  mode,
  type,
  node,
  initialParentId = null,
  initialParentPath = '/',
  onSaved,
}: NodeFormProps) {
  const router = useRouter();
  const { createNode, duplicateNode, getImpact, moveNode, updateNode } = usePageActions();

  // Computed once: converting a legacy body creates a section with a random id,
  // so form and baseline must start from the very same object.
  const [seed] = useState<FormState>(() =>
    initialState(node, initialParentId, node ? parentPathOf(node) : initialParentPath),
  );
  const [form, setForm] = useState<FormState>(seed);
  const [tab, setTab] = useState<TabId>('content');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [impact, setImpact] = useState<NodeImpact | null>(null);
  const [parentPickerOpen, setParentPickerOpen] = useState(false);
  const [imagePicker, setImagePicker] = useState<'og' | 'cover' | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [baseline, setBaseline] = useState(() => JSON.stringify(toPayloadForCompare(seed)));

  const original = node;

  /* ------------------------------------------------------------ derived */

  const payload = toPayload(form);
  const dirty = useMemo(() => {
    const current = JSON.stringify(toPayloadForCompare(form));

    return mode === 'new' ? form.title.trim() !== '' || current !== baseline : current !== baseline;
  }, [form, baseline, mode]);

  const publicPath = joinPath(form.parentPath, form.slug || slugifyTitle(form.title));
  const slugChanged = mode === 'edit' && original && form.slug.trim() !== original.slug;
  const parentChanged = mode === 'edit' && original && form.parentId !== original.parentId;

  // Impact of a URL change, fetched once for existing nodes.
  useEffect(() => {
    if (mode !== 'edit' || !original) return;

    let cancelled = false;

    getImpact(original.id)
      .then((result) => {
        if (!cancelled) setImpact(result);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getImpact is stable per mount
  }, [mode, original]);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handler);

    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  /* ------------------------------------------------------------ helpers */

  function patch(changes: Partial<FormState>) {
    setForm((current) => ({ ...current, ...changes }));
    setSavedMessage(null);
  }

  function patchSeo(changes: Partial<SeoSettings>) {
    setForm((current) => ({ ...current, seo: { ...current.seo, ...changes } }));
    setSavedMessage(null);
  }

  function patchAppearance(changes: Partial<AppearanceSettings>) {
    setForm((current) => ({ ...current, appearance: { ...current.appearance, ...changes } }));
    setSavedMessage(null);
  }

  function onTitleChange(title: string) {
    setForm((current) => ({
      ...current,
      title,
      // New pages suggest a slug until the user edits it by hand.
      slug: slugTouched ? current.slug : slugifyTitle(title),
    }));
    setSavedMessage(null);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};

    if (!form.title.trim()) next.title = 'Title is required';

    const slugError = validateSlug(form.slug.trim());

    if (slugError) next.slug = slugError;

    if (form.seo.canonicalUrl && !/^(https?:\/\/|\/)/i.test(form.seo.canonicalUrl)) {
      next.canonicalUrl = 'Use a full URL (https://…) or a path starting with /';
    }

    if (form.publishAt && form.unpublishAt && form.unpublishAt <= form.publishAt) {
      next.unpublishAt = 'Unpublish date must be after the publish date';
    }

    setErrors(next);

    if (Object.keys(next).length > 0) {
      setTab(next.canonicalUrl ? 'seo' : next.unpublishAt ? 'publishing' : 'content');
    }

    return Object.keys(next).length === 0;
  }

  async function save() {
    if (!validate()) {
      setError('Please fix the highlighted fields.');

      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (mode === 'new') {
        const created = await createNode({
          ...payload,
          title: payload.title,
          type,
          parentId: form.parentId,
        });

        router.replace(`${DASHBOARD_PAGES_PATH}/${created.id}?created=1`);

        return;
      }

      if (!original) return;

      let latest = original;

      // Moving is its own operation so hierarchy rules are enforced server-side.
      if (form.parentId !== original.parentId) {
        latest = await moveNode(original.id, form.parentId);
      }

      latest = await updateNode(original.id, payload);

      setBaseline(JSON.stringify(toPayloadForCompare(form)));
      setSavedMessage('Saved.');
      onSaved?.(latest);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Something went wrong'));
    } finally {
      setSaving(false);
    }
  }

  function setRobots(mode: RobotsMode) {
    const [index, follow] = mode.split(',');

    patchSeo({ robotsIndex: index === 'index', robotsFollow: follow === 'follow' });
  }

  const robotsMode: RobotsMode = `${form.seo.robotsIndex ? 'index' : 'noindex'},${
    form.seo.robotsFollow ? 'follow' : 'nofollow'
  }`;

  const showEditor = type === 'page' || form.folderBehavior === 'landing';

  /* -------------------------------------------------------------- render */

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-gray-900 ">
            {mode === 'new' ? `New ${type}` : original?.title}
          </h1>
          <p className="truncate text-sm text-gray-500">
            {publicUrlFor(publicPath)}
            {mode === 'edit' && original && !original.isLive && ' · not public yet'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {mode === 'edit' && original && (
            <>
              <Link
                href={`${DASHBOARD_PAGES_PATH}/${original.id}/preview`}
                className={secondaryButton}
              >
                <Eye className="h-4 w-4" />
                Preview
              </Link>
              {original.isLive && (
                <a
                  href={original.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={secondaryButton}
                >
                  <Globe className="h-4 w-4" />
                  View
                </a>
              )}
            </>
          )}

          <Link
            href={
              form.parentId
                ? `${DASHBOARD_PAGES_PATH}?folder=${form.parentId}`
                : DASHBOARD_PAGES_PATH
            }
            className={secondaryButton}
          >
            {dirty ? 'Discard' : 'Back'}
          </Link>

          <button
            type="button"
            className={primaryButton}
            onClick={() => void save()}
            disabled={saving || (mode === 'edit' && !dirty)}
          >
            {saving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {mode === 'new' ? 'Create' : 'Save changes'}
          </button>
        </div>
      </div>

      {error && <Notice tone="error">{error}</Notice>}
      {savedMessage && !dirty && <Notice tone="success">{savedMessage}</Notice>}
      {dirty && mode === 'edit' && (
        <p className="text-xs text-amber-700 ">You have unsaved changes.</p>
      )}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Page settings"
        className="flex gap-1 overflow-x-auto border-b border-gray-200 "
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            onClick={() => setTab(item.id)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${
              tab === item.id
                ? 'border-gray-900 text-gray-900 '
                : 'border-transparent text-gray-500 hover:text-gray-900 '
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <section
        role="tabpanel"
        id="panel-content"
        aria-labelledby="tab-content"
        hidden={tab !== 'content'}
        className="space-y-5"
      >
        <div className={`${cardClass} grid gap-4 p-4 md:grid-cols-2`}>
          <Field label="Title *" error={errors.title}>
            <input
              id="title"
              className={inputClass}
              value={form.title}
              maxLength={200}
              onChange={(event) => onTitleChange(event.target.value)}
            />
          </Field>

          <Field label="Page heading" hint="Shown on the page. Defaults to the title.">
            <input
              id="heading"
              className={inputClass}
              value={form.heading}
              maxLength={200}
              onChange={(event) => patch({ heading: event.target.value })}
              placeholder={form.title}
            />
          </Field>

          <div className="md:col-span-2">
            <label className={labelClass}>Location</label>
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded bg-gray-50 px-2 py-1.5 text-sm ">
                {form.parentPath === '/' ? 'Top level' : form.parentPath}
              </code>
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setParentPickerOpen(true)}
              >
                <FolderInput className="h-4 w-4" />
                Change
              </button>
            </div>
            {parentChanged && impact && impact.descendants > 0 && (
              <div className="mt-2">
                <Notice tone="error">
                  Moving this {type} changes the public URLs of its {impact.descendants} nested{' '}
                  {impact.descendants === 1 ? 'page' : 'pages'}.
                </Notice>
              </div>
            )}
          </div>

          <Field
            label="Slug *"
            error={errors.slug}
            hint="Lowercase letters, numbers and hyphens. Unique within the same location."
          >
            <div className="flex gap-2">
              <input
                id="slug"
                className={inputClass}
                value={form.slug}
                maxLength={100}
                onChange={(event) => {
                  setSlugTouched(true);
                  patch({ slug: event.target.value.toLowerCase() });
                }}
              />
              {mode === 'edit' && (
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => patch({ slug: slugifyTitle(form.title) })}
                  title="Rebuild the slug from the title"
                >
                  From title
                </button>
              )}
            </div>
          </Field>

          <div>
            <label className={labelClass}>Public URL</label>
            <p className="break-all rounded bg-gray-50 px-3 py-2 text-sm ">
              {publicUrlFor(publicPath)}
            </p>
          </div>

          {slugChanged && impact && impact.descendants > 0 && (
            <div className="md:col-span-2">
              <Notice tone="error">
                Changing the slug also changes the URLs of {impact.descendants} nested{' '}
                {impact.descendants === 1 ? 'page' : 'pages'}.
              </Notice>
            </div>
          )}

          <div className="md:col-span-2">
            <Field
              label="Summary"
              hint="Short description. Used as the intro and as a fallback meta description."
            >
              <textarea
                id="summary"
                rows={2}
                maxLength={1000}
                className={inputClass}
                value={form.summary}
                onChange={(event) => patch({ summary: event.target.value })}
              />
            </Field>
          </div>

          {type === 'folder' && (
            <div className="md:col-span-2">
              <Field label="When someone opens this folder’s URL">
                <select
                  id="folderBehavior"
                  className={inputClass}
                  value={form.folderBehavior}
                  onChange={(event) =>
                    patch({ folderBehavior: event.target.value as FormState['folderBehavior'] })
                  }
                >
                  <option value="landing">Show a landing page (content below)</option>
                  <option value="redirect">Redirect to its first published child</option>
                  <option value="structural">Structural only (no public page of its own)</option>
                </select>
              </Field>
            </div>
          )}
        </div>

        {showEditor && (
          <SectionBuilder
            sections={form.sections}
            onChange={(sections) => patch({ sections })}
            onPreview={() => setPreviewOpen(true)}
          />
        )}
      </section>

      {/* SEO */}
      <section
        role="tabpanel"
        id="panel-seo"
        aria-labelledby="tab-seo"
        hidden={tab !== 'seo'}
        className="space-y-5"
      >
        <div className={`${cardClass} space-y-4 p-4`}>
          <SeoPreview
            title={form.seo.title || form.title}
            url={publicUrlFor(publicPath)}
            description={form.seo.description || form.summary}
          />

          <Field
            label="SEO title"
            hint={`${form.seo.title.length}/60 recommended. Falls back to the page title.`}
          >
            <input
              id="seoTitle"
              className={inputClass}
              maxLength={120}
              value={form.seo.title}
              onChange={(event) => patchSeo({ title: event.target.value })}
              placeholder={form.title}
            />
          </Field>

          <Field
            label="Meta description"
            hint={`${form.seo.description.length}/160 recommended. Falls back to the summary.`}
          >
            <textarea
              id="seoDescription"
              rows={2}
              maxLength={320}
              className={inputClass}
              value={form.seo.description}
              onChange={(event) => patchSeo({ description: event.target.value })}
              placeholder={form.summary}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Search engine directive">
              <select
                id="robots"
                className={inputClass}
                value={robotsMode}
                onChange={(event) => setRobots(event.target.value as RobotsMode)}
              >
                {ROBOTS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Canonical URL"
              error={errors.canonicalUrl}
              hint="Leave empty to use the public URL above."
            >
              <input
                id="canonical"
                className={inputClass}
                value={form.seo.canonicalUrl}
                onChange={(event) => patchSeo({ canonicalUrl: event.target.value })}
                placeholder={publicUrlFor(publicPath)}
              />
            </Field>

            <Field
              label="Breadcrumb label"
              hint="Shorter text for breadcrumbs. Falls back to the title."
            >
              <input
                id="breadcrumbTitle"
                className={inputClass}
                maxLength={120}
                value={form.seo.breadcrumbTitle}
                onChange={(event) => patchSeo({ breadcrumbTitle: event.target.value })}
                placeholder={form.title}
              />
            </Field>

            <Field label="Keywords" hint="Comma separated. Optional.">
              <input
                id="keywords"
                className={inputClass}
                value={form.keywordsText}
                onChange={(event) => patch({ keywordsText: event.target.value })}
              />
            </Field>
          </div>
        </div>

        <div className={`${cardClass} space-y-4 p-4`}>
          <h3 className="font-semibold text-gray-900 ">Social sharing</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Social title" hint="Falls back to the SEO title.">
              <input
                id="ogTitle"
                className={inputClass}
                maxLength={120}
                value={form.seo.ogTitle}
                onChange={(event) => patchSeo({ ogTitle: event.target.value })}
              />
            </Field>

            <Field label="Card type">
              <select
                id="twitterCard"
                className={inputClass}
                value={form.seo.twitterCard}
                onChange={(event) =>
                  patchSeo({ twitterCard: event.target.value as SeoSettings['twitterCard'] })
                }
              >
                {TWITTER_CARDS.map((card) => (
                  <option key={card} value={card}>
                    {card}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Social description" hint="Falls back to the meta description.">
            <textarea
              id="ogDescription"
              rows={2}
              maxLength={320}
              className={inputClass}
              value={form.seo.ogDescription}
              onChange={(event) => patchSeo({ ogDescription: event.target.value })}
            />
          </Field>

          <ImageField
            label="Social image"
            hint="Falls back to the cover image, then the nearest parent's image."
            value={form.seo.ogImage}
            onChange={(value) => patchSeo({ ogImage: value })}
            onPick={() => setImagePicker('og')}
          />
        </div>

        <div className={`${cardClass} space-y-4 p-4`}>
          <h3 className="font-semibold text-gray-900 ">Sitemap</h3>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.seo.sitemapInclude}
              onChange={(event) => patchSeo({ sitemapInclude: event.target.checked })}
            />
            Include in sitemap.xml (only if published and indexed)
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Priority (0 – 1)">
              <input
                id="sitemapPriority"
                type="number"
                min={0}
                max={1}
                step={0.1}
                className={inputClass}
                value={form.seo.sitemapPriority ?? ''}
                onChange={(event) =>
                  patchSeo({
                    sitemapPriority: event.target.value === '' ? null : Number(event.target.value),
                  })
                }
              />
            </Field>

            <Field label="Change frequency">
              <select
                id="changefreq"
                className={inputClass}
                value={form.seo.sitemapChangeFrequency ?? ''}
                onChange={(event) =>
                  patchSeo({
                    sitemapChangeFrequency: (event.target.value ||
                      null) as SeoSettings['sitemapChangeFrequency'],
                  })
                }
              >
                <option value="">Not specified</option>
                {CHANGE_FREQUENCIES.map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {frequency}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </section>

      {/* APPEARANCE */}
      <section
        role="tabpanel"
        id="panel-appearance"
        aria-labelledby="tab-appearance"
        hidden={tab !== 'appearance'}
        className={`${cardClass} space-y-4 p-4`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Layout" hint={LAYOUT_HELP[form.appearance.layout]}>
            <select
              id="layout"
              className={inputClass}
              value={form.appearance.layout}
              onChange={(event) =>
                patchAppearance({ layout: event.target.value as AppearanceSettings['layout'] })
              }
            >
              {PAGE_LAYOUTS.map((layout) => (
                <option key={layout} value={layout}>
                  {layout}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Content width">
            <select
              id="pageWidth"
              className={inputClass}
              value={form.appearance.pageWidth}
              onChange={(event) =>
                patchAppearance({
                  pageWidth: event.target.value as AppearanceSettings['pageWidth'],
                })
              }
            >
              {PAGE_WIDTHS.map((width) => (
                <option key={width} value={width}>
                  {width}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Child pages"
            hint="Lists the published pages inside this one, in your custom order."
          >
            <select
              id="childDisplay"
              className={inputClass}
              value={form.appearance.childDisplay}
              onChange={(event) =>
                patchAppearance({
                  childDisplay: event.target.value as AppearanceSettings['childDisplay'],
                })
              }
            >
              {CHILD_DISPLAYS.map((display) => (
                <option key={display} value={display}>
                  {display === 'none' ? 'Do not show' : display}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {form.appearance.childDisplay !== 'none' && (
          <Field
            label="Heading above the child pages"
            hint="Your own wording. Leave empty for no heading."
          >
            <input
              id="childrenTitle"
              className={inputClass}
              maxLength={120}
              value={form.appearance.childrenTitle}
              onChange={(event) => patchAppearance({ childrenTitle: event.target.value })}
            />
          </Field>
        )}

        <div className="flex flex-wrap gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.appearance.showHeading}
              onChange={(event) => patchAppearance({ showHeading: event.target.checked })}
            />
            Show the heading
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.appearance.showBreadcrumbs}
              onChange={(event) => patchAppearance({ showBreadcrumbs: event.target.checked })}
            />
            Show breadcrumbs
          </label>
        </div>

        <ImageField
          label="Cover image"
          value={form.appearance.coverImageUrl}
          onChange={(value) => patchAppearance({ coverImageUrl: value })}
          onPick={() => setImagePicker('cover')}
        />

        {form.appearance.coverImageUrl && (
          <Field label="Cover image alt text">
            <input
              id="coverAlt"
              className={inputClass}
              maxLength={300}
              value={form.appearance.coverImageAlt}
              onChange={(event) => patchAppearance({ coverImageAlt: event.target.value })}
            />
          </Field>
        )}
      </section>

      {/* NAVIGATION */}
      <section
        role="tabpanel"
        id="panel-navigation"
        aria-labelledby="tab-navigation"
        hidden={tab !== 'navigation'}
        className={`${cardClass} space-y-4 p-4`}
      >
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.showInNavigation}
            onChange={(event) => patch({ showInNavigation: event.target.checked })}
          />
          Show in navigation menus
        </label>

        <IndependenceTable
          rows={[
            [
              'Published',
              form.status === 'published' ? 'Yes' : 'No',
              'Whether the page can be opened publicly.',
            ],
            [
              'Shown in navigation',
              form.showInNavigation ? 'Yes' : 'No',
              'Whether it appears in menus. Hidden pages are still public.',
            ],
            [
              'Indexed by search engines',
              form.seo.robotsIndex ? 'Yes' : 'No',
              'The robots directive on the SEO tab.',
            ],
            [
              'In sitemap.xml',
              form.seo.sitemapInclude && form.seo.robotsIndex ? 'Yes' : 'No',
              'Needs to be published and indexed.',
            ],
          ]}
        />
      </section>

      {/* PUBLISHING */}
      <section
        role="tabpanel"
        id="panel-publishing"
        aria-labelledby="tab-publishing"
        hidden={tab !== 'publishing'}
        className={`${cardClass} space-y-4 p-4`}
      >
        <Field label="Status">
          <select
            id="status"
            className={inputClass}
            value={form.status}
            onChange={(event) => patch({ status: event.target.value as FormState['status'] })}
          >
            {NODE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Publish at (optional)"
            hint="Until this moment the page stays hidden even when published."
          >
            <input
              id="publishAt"
              type="datetime-local"
              className={inputClass}
              value={form.publishAt}
              onChange={(event) => patch({ publishAt: event.target.value })}
            />
          </Field>
          <Field label="Unpublish at (optional)" error={errors.unpublishAt}>
            <input
              id="unpublishAt"
              type="datetime-local"
              className={inputClass}
              value={form.unpublishAt}
              onChange={(event) => patch({ unpublishAt: event.target.value })}
            />
          </Field>
        </div>

        {original && (
          <p className="text-sm text-gray-600 ">
            {original.isLive
              ? 'This page is live right now.'
              : 'This page is not publicly visible right now.'}
            {original.publishedAt && ` First published ${formatDateTime(original.publishedAt)}.`}
          </p>
        )}
      </section>

      {/* ADVANCED */}
      <section
        role="tabpanel"
        id="panel-advanced"
        aria-labelledby="tab-advanced"
        hidden={tab !== 'advanced'}
        className={`${cardClass} space-y-4 p-4`}
      >
        <Field
          label="Position among siblings"
          hint="Lower numbers come first. You can also reorder from the list view."
        >
          <input
            id="order"
            type="number"
            min={0}
            className={`${inputClass} max-w-40`}
            value={form.order}
            onChange={(event) => patch({ order: event.target.value })}
            placeholder="auto"
          />
        </Field>

        {original && (
          <>
            <dl className="grid gap-2 text-sm md:grid-cols-2">
              <Info label="ID" value={original.id} />
              <Info label="Type" value={original.type} />
              <Info label="Created" value={formatDateTime(original.createdAt)} />
              <Info label="Updated" value={formatDateTime(original.updatedAt)} />
            </dl>

            <button
              type="button"
              className={secondaryButton}
              onClick={async () => {
                try {
                  const copy = await duplicateNode(original.id);

                  router.push(`${DASHBOARD_PAGES_PATH}/${copy.id}`);
                } catch (err) {
                  setError(getApiErrorMessage(err, 'Something went wrong'));
                }
              }}
            >
              Duplicate as draft
            </button>
          </>
        )}
      </section>

      <NodePicker
        open={parentPickerOpen}
        title="Choose location"
        confirmLabel="Use this location"
        blockedNode={original ? { id: original.id, path: original.path } : undefined}
        initialId={form.parentId}
        onClose={() => setParentPickerOpen(false)}
        onPick={(parentId, picked) => {
          patch({ parentId, parentPath: picked ? picked.path : '/' });
          setParentPickerOpen(false);
        }}
      />

      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        view={buildPreviewView({
          id: original?.id ?? 'preview',
          title: form.title || 'Untitled',
          heading: form.heading,
          summary: form.summary,
          type,
          path: publicPath,
          appearance: form.appearance,
          sections: form.sections,
          folderBehavior: form.folderBehavior,
        })}
      />

      <FilePickerDialog
        open={imagePicker !== null}
        assetType="image"
        title="Choose an image"
        onClose={() => setImagePicker(null)}
        onSelect={(asset) => {
          if (imagePicker === 'og') patchSeo({ ogImage: asset.url });
          if (imagePicker === 'cover') {
            patchAppearance({
              coverImageUrl: asset.url,
              coverImageAlt: form.appearance.coverImageAlt || asset.altText,
            });
          }
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------- helpers */

function parentPathOf(node: IPageNode): string {
  const index = node.path.lastIndexOf('/');

  return index <= 0 ? '/' : node.path.slice(0, index);
}

function toPayloadForCompare(form: FormState) {
  return { ...toPayload(form), parentId: form.parentId };
}

/**
 * Sections for the builder. Pages created before the builder only have a
 * single HTML body: it becomes the first "Rich content" section.
 */
function initialSections(node: IPageNode | undefined): Section[] {
  if (!node) return [];

  if (node.sections && node.sections.length > 0) return node.sections;

  if (node.html && node.html.trim()) {
    const legacy = createSection('content');

    if (legacy.type === 'content') legacy.data.html = node.html;

    return [{ ...legacy, id: newId() }];
  }

  return [];
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : (
        hint && <p className={hintClass}>{hint}</p>
      )}
    </div>
  );
}

function ImageField({
  label,
  hint,
  value,
  onChange,
  onPick,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  onPick: () => void;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex flex-wrap items-center gap-2">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element -- configurable asset host
          <img
            src={value}
            alt=""
            className="h-14 w-24 rounded border border-gray-200 object-cover "
          />
        )}
        <input
          className={`${inputClass} min-w-48 flex-1`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://… or choose from library"
        />
        <button type="button" className={secondaryButton} onClick={onPick}>
          Choose
        </button>
        {value && (
          <button type="button" className={secondaryButton} onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  );
}

function IndependenceTable({ rows }: { rows: Array<[string, string, string]> }) {
  return (
    <table className="w-full text-left text-sm">
      <tbody className="divide-y divide-gray-200 ">
        {rows.map(([name, value, help]) => (
          <tr key={name}>
            <th scope="row" className="py-2 pr-4 font-medium text-gray-900 ">
              {name}
            </th>
            <td className="py-2 pr-4">
              <span className="rounded bg-gray-50 px-2 py-0.5 text-xs font-medium ">{value}</span>
            </td>
            <td className="py-2 text-gray-500">{help}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded bg-gray-50 px-3 py-2 ">
      <dt className="text-gray-500">{label}</dt>
      <dd className="break-all text-right text-gray-900 ">{value}</dd>
    </div>
  );
}
