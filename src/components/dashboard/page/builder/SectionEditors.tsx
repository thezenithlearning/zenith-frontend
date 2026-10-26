'use client';

import { useState } from 'react';
import { Copy, Plus } from 'lucide-react';

import {
  hintClass,
  inputClass,
  labelClass,
  secondaryButton,
} from '@/components/dashboard/page/ui/styles';
import { Notice } from '@/components/dashboard/page/ui/Notice';
import { FilePickerDialog } from './FilePickerDialog';

import {
  RESOURCE_TYPES,
  answerToHtml,
  newId,
  parseFaqJson,
  resourceTypeFor,
  resourceTypeFromUrl,
  type AdsData,
  type ContentData,
  type CtaData,
  type FaqData,
  type HeroData,
  type ResourceItem,
  type ResourcesData,
  type SeoContentData,
} from '@/features/page/utils/sections';

import {
  AssetField,
  Checkbox,
  Field,
  ItemFrame,
  TextInput,
  moveItem,
  removeAt,
  replaceAt,
} from './fields';
import { RichHtmlEditor } from './RichHtmlEditor';

interface EditorProps<T> {
  data: T;
  onData: (next: T) => void;
}

const select = `${inputClass}`;

/** Hex colour with a native picker; empty means "use the default". */
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-gray-200 bg-transparent p-0.5 "
        />
        <input
          aria-label={label}
          className={inputClass}
          value={value}
          placeholder="default"
          maxLength={9}
          onChange={(event) => onChange(event.target.value.trim())}
        />
        {value && (
          <button type="button" className={secondaryButton} onClick={() => onChange('')}>
            Reset
          </button>
        )}
      </div>
    </Field>
  );
}

/* ----------------------------------------------------------------- rich */

export function ContentEditor({ data, onData }: EditorProps<ContentData>) {
  return <RichHtmlEditor html={data.html} onChange={(html) => onData({ html })} />;
}

export function SeoContentEditor({ data, onData }: EditorProps<SeoContentData>) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Checkbox
          checked={data.collapsible}
          onChange={(collapsible) => onData({ ...data, collapsible })}
        >
          Collapsible (shown behind a toggle)
        </Checkbox>

        {data.collapsible && (
          <Field
            label="Toggle text"
            hint="The text visitors click to expand. Falls back to the section title."
          >
            <TextInput
              label="Toggle text"
              value={data.expandLabel}
              maxLength={80}
              onChange={(expandLabel) => onData({ ...data, expandLabel })}
            />
          </Field>
        )}
      </div>

      <RichHtmlEditor html={data.html} onChange={(html) => onData({ ...data, html })} />
    </div>
  );
}

/* ----------------------------------------------------------------- hero */

export function HeroEditor({ data, onData }: EditorProps<HeroData>) {
  const patch = (changes: Partial<HeroData>) => onData({ ...data, ...changes });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Text alignment">
          <select
            aria-label="Text alignment"
            className={select}
            value={data.align}
            onChange={(event) => patch({ align: event.target.value as HeroData['align'] })}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </Field>

        <Field label="Height">
          <select
            aria-label="Height"
            className={select}
            value={data.height}
            onChange={(event) => patch({ height: event.target.value as HeroData['height'] })}
          >
            <option value="sm">Compact</option>
            <option value="md">Medium</option>
            <option value="lg">Tall</option>
          </select>
        </Field>

        <Field
          label={`Image overlay (${data.overlay}%)`}
          hint="Darkens the background image so text stays readable."
        >
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            aria-label="Overlay"
            value={data.overlay}
            onChange={(event) => patch({ overlay: Number(event.target.value) })}
            className="w-full"
          />
        </Field>

        <ColorField
          label="Background colour"
          value={data.backgroundColor}
          onChange={(backgroundColor) => patch({ backgroundColor })}
        />
        <ColorField
          label="Text colour"
          value={data.textColor}
          onChange={(textColor) => patch({ textColor })}
        />
      </div>

      <AssetField
        label="Background image"
        assetType="image"
        value={data.backgroundImageUrl}
        onChange={(backgroundImageUrl) => patch({ backgroundImageUrl })}
      />

      <div>
        <p className="mb-2 text-sm font-medium text-gray-600 ">Hero content</p>
        <p className={`${hintClass} mb-2`}>
          Design it with the visual editor, or switch to the HTML panel on the right to write the
          code yourself.
        </p>
        <RichHtmlEditor html={data.html} onChange={(html) => patch({ html })} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ resources */

function emptyResource(): ResourceItem {
  return {
    id: newId(),
    type: 'link',
    title: '',
    description: '',
    url: '',
    thumbnailUrl: '',
    openInNewTab: true,
  };
}

export function ResourcesEditor({ data, onData }: EditorProps<ResourcesData>) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const setItems = (items: ResourceItem[]) => onData({ ...data, items });
  const update = (index: number, changes: Partial<ResourceItem>) =>
    setItems(replaceAt(data.items, index, { ...data.items[index], ...changes }));

  return (
    <div className="space-y-4">
      <Field label="Layout">
        <select
          aria-label="Layout"
          className={`${select} max-w-48`}
          value={data.layout}
          onChange={(event) =>
            onData({ ...data, layout: event.target.value as ResourcesData['layout'] })
          }
        >
          <option value="grid">Grid of cards</option>
          <option value="list">Single column</option>
        </select>
      </Field>

      {data.items.map((item, index) => (
        <ItemFrame
          key={item.id}
          index={index}
          total={data.items.length}
          title={item.title || item.type}
          onMove={(direction) => setItems(moveItem(data.items, index, direction))}
          onRemove={() => setItems(removeAt(data.items, index))}
        >
          <div className="grid gap-3 md:grid-cols-[10rem_1fr]">
            <Field label="Type">
              <select
                aria-label="Type"
                className={select}
                value={item.type}
                onChange={(event) =>
                  update(index, { type: event.target.value as ResourceItem['type'] })
                }
              >
                {RESOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type === 'pdf' ? 'PDF' : type}
                  </option>
                ))}
              </select>
            </Field>

            <AssetField
              label="File or link URL"
              hint="Choose an uploaded file, upload a new one, or paste any URL (YouTube and Vimeo links embed as players)."
              value={item.url}
              onChange={(url) => {
                // The URL wins when it clearly says what it is (.pdf, YouTube, .mp4...).
                const detected = resourceTypeFromUrl(url);

                update(index, { url, ...(url && detected !== 'link' ? { type: detected } : {}) });
              }}
              onPickAsset={(asset) =>
                update(index, {
                  url: asset.url,
                  type: resourceTypeFor(asset),
                  title: item.title || asset.title || asset.originalName,
                  description: item.description || asset.description || '',
                })
              }
            />
          </div>

          <Field label="Name">
            <TextInput
              label="Name"
              value={item.title}
              maxLength={200}
              onChange={(title) => update(index, { title })}
            />
          </Field>

          <Field label="Description">
            <textarea
              aria-label="Description"
              rows={2}
              maxLength={1000}
              className={inputClass}
              value={item.description}
              onChange={(event) => update(index, { description: event.target.value })}
            />
          </Field>

          {(item.type === 'video' ||
            item.type === 'pdf' ||
            item.type === 'file' ||
            item.type === 'link') && (
            <AssetField
              label="Thumbnail (optional)"
              assetType="image"
              value={item.thumbnailUrl}
              onChange={(thumbnailUrl) => update(index, { thumbnailUrl })}
            />
          )}

          <Checkbox
            checked={item.openInNewTab}
            onChange={(openInNewTab) => update(index, { openInNewTab })}
          >
            Open in a new tab
          </Checkbox>
        </ItemFrame>
      ))}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={secondaryButton}
          onClick={() => setItems([...data.items, emptyResource()])}
        >
          <Plus className="h-4 w-4" />
          Add resource
        </button>
        <button type="button" className={secondaryButton} onClick={() => setPickerOpen(true)}>
          Add from media library
        </button>
      </div>

      <FilePickerDialog
        open={pickerOpen}
        title="Add a resource"
        onClose={() => setPickerOpen(false)}
        onSelect={(asset) =>
          setItems([
            ...data.items,
            {
              ...emptyResource(),
              type: resourceTypeFor(asset),
              url: asset.url,
              title: asset.title || asset.originalName,
              description: asset.description ?? '',
            },
          ])
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------------ ads */

export function AdsEditor({ data, onData }: EditorProps<AdsData>) {
  const setItems = (items: AdsData['items']) => onData({ ...data, items });
  const update = (index: number, changes: Partial<AdsData['items'][number]>) =>
    setItems(replaceAt(data.items, index, { ...data.items[index], ...changes }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Layout">
          <select
            aria-label="Layout"
            className={select}
            value={data.layout}
            onChange={(event) =>
              onData({ ...data, layout: event.target.value as AdsData['layout'] })
            }
          >
            <option value="single">One per row (banner)</option>
            <option value="grid">Two per row</option>
          </select>
        </Field>

        <Field
          label="Small label (optional)"
          hint="Text shown on each ad, e.g. a disclosure. Leave empty for none."
        >
          <TextInput
            label="Small label"
            value={data.label}
            maxLength={60}
            onChange={(label) => onData({ ...data, label })}
          />
        </Field>
      </div>

      {data.items.map((item, index) => (
        <ItemFrame
          key={item.id}
          index={index}
          total={data.items.length}
          title={item.title || 'Ad'}
          onMove={(direction) => setItems(moveItem(data.items, index, direction))}
          onRemove={() => setItems(removeAt(data.items, index))}
        >
          <AssetField
            label="Banner image"
            assetType="image"
            value={item.imageUrl}
            onChange={(imageUrl) => update(index, { imageUrl })}
          />

          <Field label="Title">
            <TextInput
              label="Title"
              value={item.title}
              maxLength={200}
              onChange={(title) => update(index, { title })}
            />
          </Field>

          <Field label="Description">
            <textarea
              aria-label="Description"
              rows={2}
              maxLength={1000}
              className={inputClass}
              value={item.description}
              onChange={(event) => update(index, { description: event.target.value })}
            />
          </Field>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Link URL" hint="https://…, /path, mailto: or tel:">
              <TextInput
                label="Link URL"
                value={item.linkUrl}
                maxLength={1000}
                onChange={(linkUrl) => update(index, { linkUrl })}
              />
            </Field>
          </div>

          <Checkbox
            checked={item.openInNewTab}
            onChange={(openInNewTab) => update(index, { openInNewTab })}
          >
            Open in a new tab
          </Checkbox>
        </ItemFrame>
      ))}

      <button
        type="button"
        className={secondaryButton}
        onClick={() =>
          setItems([
            ...data.items,
            {
              id: newId(),
              title: '',
              description: '',
              imageUrl: '',
              linkUrl: '',
              buttonLabel: '',
              openInNewTab: true,
            },
          ])
        }
      >
        <Plus className="h-4 w-4" />
        Add ad
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ faq */

export function FaqEditor({ data, onData }: EditorProps<FaqData>) {
  const [json, setJson] = useState('');
  const [importMessage, setImportMessage] = useState<{
    tone: 'error' | 'success';
    text: string;
  } | null>(null);

  const setItems = (items: FaqData['items']) => onData({ ...data, items });
  const update = (index: number, changes: Partial<FaqData['items'][number]>) =>
    setItems(replaceAt(data.items, index, { ...data.items[index], ...changes }));

  function importJson(mode: 'replace' | 'append') {
    try {
      const { items } = parseFaqJson(json);
      const imported = items.map((item) => ({
        id: newId(),
        question: item.question,
        answer: answerToHtml(item.answer),
      }));

      setItems(mode === 'replace' ? imported : [...data.items, ...imported]);
      setImportMessage({
        tone: 'success',
        text: `${imported.length} questions ${mode === 'replace' ? 'imported' : 'added'}.`,
      });
      setJson('');
    } catch (error) {
      setImportMessage({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Could not import.',
      });
    }
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          data.items.map(({ question, answer }) => ({ question, answer })),
          null,
          2,
        ),
      );
      setImportMessage({ tone: 'success', text: 'Questions copied as JSON.' });
    } catch {
      setImportMessage({ tone: 'error', text: 'Could not copy to the clipboard.' });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-6">
        <Checkbox checked={data.openFirst} onChange={(openFirst) => onData({ ...data, openFirst })}>
          Open the first question by default
        </Checkbox>
        <Checkbox
          checked={data.includeSchema}
          onChange={(includeSchema) => onData({ ...data, includeSchema })}
        >
          Add FAQ structured data for search engines
        </Checkbox>
      </div>

      <details className="rounded-md border border-gray-200 p-3 ">
        <summary className="cursor-pointer text-sm font-medium">Import from JSON</summary>
        <div className="mt-3 space-y-2">
          <p className={hintClass}>
            Paste an array like <code>[{`{"question":"…","answer":"…"}`}]</code>, <code>q</code>/
            <code>a</code> keys, an object with <code>faqs</code>/<code>items</code>, or schema.org
            FAQPage JSON-LD.
          </p>
          <textarea
            aria-label="FAQ JSON"
            rows={6}
            className={`${inputClass} font-mono text-xs`}
            value={json}
            onChange={(event) => {
              setJson(event.target.value);
              setImportMessage(null);
            }}
            placeholder='[{ "question": "…", "answer": "…" }]'
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={secondaryButton}
              disabled={!json.trim()}
              onClick={() => importJson('append')}
            >
              Add to existing
            </button>
            <button
              type="button"
              className={secondaryButton}
              disabled={!json.trim()}
              onClick={() => importJson('replace')}
            >
              Replace all
            </button>
            <button
              type="button"
              className={secondaryButton}
              disabled={data.items.length === 0}
              onClick={() => void copyJson()}
            >
              <Copy className="h-4 w-4" />
              Copy current as JSON
            </button>
          </div>
        </div>
      </details>

      {importMessage && <Notice tone={importMessage.tone}>{importMessage.text}</Notice>}

      {data.items.map((item, index) => (
        <ItemFrame
          key={item.id}
          index={index}
          total={data.items.length}
          title={item.question || 'New question'}
          onMove={(direction) => setItems(moveItem(data.items, index, direction))}
          onRemove={() => setItems(removeAt(data.items, index))}
        >
          <Field label="Question">
            <TextInput
              label="Question"
              value={item.question}
              maxLength={500}
              onChange={(question) => update(index, { question })}
            />
          </Field>
          <div>
            <label className={labelClass}>Answer</label>
            <textarea
              aria-label="Answer"
              rows={4}
              className={inputClass}
              value={item.answer}
              onChange={(event) => update(index, { answer: event.target.value })}
            />
            <p className={hintClass}>Plain text or simple HTML (links, lists, bold).</p>
          </div>
        </ItemFrame>
      ))}

      <button
        type="button"
        className={secondaryButton}
        onClick={() => setItems([...data.items, { id: newId(), question: '', answer: '' }])}
      >
        <Plus className="h-4 w-4" />
        Add question
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ cta */

export function CtaEditor({ data, onData }: EditorProps<CtaData>) {
  const patch = (changes: Partial<CtaData>) => onData({ ...data, ...changes });
  const setButtons = (buttons: CtaData['buttons']) => patch({ buttons });
  const update = (index: number, changes: Partial<CtaData['buttons'][number]>) =>
    setButtons(replaceAt(data.buttons, index, { ...data.buttons[index], ...changes }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Style">
          <select
            aria-label="Style"
            className={select}
            value={data.variant}
            onChange={(event) => patch({ variant: event.target.value as CtaData['variant'] })}
          >
            <option value="banner">Banner (background)</option>
            <option value="text">Plain text block</option>
          </select>
        </Field>

        <Field label="Alignment">
          <select
            aria-label="Alignment"
            className={select}
            value={data.align}
            onChange={(event) => patch({ align: event.target.value as CtaData['align'] })}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </Field>

        <ColorField
          label="Text colour"
          value={data.textColor}
          onChange={(textColor) => patch({ textColor })}
        />
      </div>

      {data.variant === 'banner' && (
        <div className="grid gap-4 md:grid-cols-2">
          <ColorField
            label="Background colour"
            value={data.backgroundColor}
            onChange={(backgroundColor) => patch({ backgroundColor })}
          />
          <AssetField
            label="Background image"
            assetType="image"
            value={data.backgroundImageUrl}
            onChange={(backgroundImageUrl) => patch({ backgroundImageUrl })}
          />
        </div>
      )}

      <p className="text-sm font-medium text-gray-600 ">Buttons (optional)</p>

      {data.buttons.map((button, index) => (
        <ItemFrame
          key={button.id}
          index={index}
          total={data.buttons.length}
          title={button.label || 'Button'}
          onMove={(direction) => setButtons(moveItem(data.buttons, index, direction))}
          onRemove={() => setButtons(removeAt(data.buttons, index))}
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Button text">
              <TextInput
                label="Button text"
                value={button.label}
                maxLength={100}
                onChange={(label) => update(index, { label })}
              />
            </Field>
            <Field label="Link (navigation URL)" hint="https://…, /page, #anchor, mailto: or tel:">
              <TextInput
                label="Link"
                value={button.url}
                maxLength={1000}
                onChange={(url) => update(index, { url })}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-end gap-6">
            <Field label="Look">
              <select
                aria-label="Look"
                className={`${select} w-40`}
                value={button.style}
                onChange={(event) =>
                  update(index, {
                    style: event.target.value as CtaData['buttons'][number]['style'],
                  })
                }
              >
                <option value="primary">Primary</option>
                <option value="secondary">Dark</option>
                <option value="outline">Outline</option>
              </select>
            </Field>
            <Checkbox
              checked={button.openInNewTab}
              onChange={(openInNewTab) => update(index, { openInNewTab })}
            >
              Open in a new tab
            </Checkbox>
          </div>
        </ItemFrame>
      ))}

      {data.buttons.length < 6 && (
        <button
          type="button"
          className={secondaryButton}
          onClick={() =>
            setButtons([
              ...data.buttons,
              { id: newId(), label: '', url: '', style: 'primary', openInNewTab: false },
            ])
          }
        >
          <Plus className="h-4 w-4" />
          Add button
        </button>
      )}
    </div>
  );
}
