'use client';

import type { DragEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  CopyPlus,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
} from 'lucide-react';

import { cardClass, inputClass, labelClass } from '@/components/dashboard/page/ui/styles';

import { SECTION_META, sectionDisplayName, type Section } from '@/features/page/utils/sections';

import { Checkbox, Field } from './fields';
import {
  AdsEditor,
  ContentEditor,
  CtaEditor,
  FaqEditor,
  HeroEditor,
  ResourcesEditor,
  SeoContentEditor,
} from './SectionEditors';

interface SectionCardProps {
  section: Section;
  index: number;
  total: number;
  open: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  onToggleOpen: () => void;
  onChange: (section: Section) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent) => void;
  onDrop: () => void;
}

const iconButton = 'rounded p-1.5 text-gray-500 hover:bg-indigo-50 disabled:opacity-30 ';

export function SectionCard({
  section,
  index,
  total,
  open,
  isDragging,
  isDropTarget,
  onToggleOpen,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: SectionCardProps) {
  const meta = SECTION_META[section.type];
  const name = sectionDisplayName(section);

  function renderEditor() {
    // `as never`: the discriminated union is narrowed by the switch.

    switch (section.type) {
      case 'hero':
        return <HeroEditor data={section.data} onData={(data) => onChange({ ...section, data })} />;
      case 'content':
        return (
          <ContentEditor data={section.data} onData={(data) => onChange({ ...section, data })} />
        );
      case 'resources':
        return (
          <ResourcesEditor data={section.data} onData={(data) => onChange({ ...section, data })} />
        );
      case 'ads':
        return <AdsEditor data={section.data} onData={(data) => onChange({ ...section, data })} />;
      case 'faq':
        return <FaqEditor data={section.data} onData={(data) => onChange({ ...section, data })} />;
      case 'cta':
        return <CtaEditor data={section.data} onData={(data) => onChange({ ...section, data })} />;
      case 'seoContent':
        return (
          <SeoContentEditor data={section.data} onData={(data) => onChange({ ...section, data })} />
        );
    }
  }

  return (
    <li
      onDragOver={onDragOver}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      className={`${cardClass} transition ${isDragging ? 'opacity-40' : ''} ${
        isDropTarget ? 'ring-2 ring-indigo-600' : ''
      } ${section.enabled ? '' : 'border-dashed'}`}
    >
      <div className="flex items-center gap-1 px-2 py-2">
        <span
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', section.id);
            onDragStart();
          }}
          onDragEnd={onDragEnd}
          className="cursor-grab rounded p-1.5 text-gray-500 hover:bg-indigo-50 active:cursor-grabbing "
          title="Drag to reorder"
          aria-hidden="true"
        >
          <GripVertical className="h-4 w-4" />
        </span>

        <button
          type="button"
          onClick={onToggleOpen}
          aria-expanded={open}
          aria-controls={`section-body-${section.id}`}
          className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 text-left hover:bg-indigo-50 "
        >
          {open ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          <span className="shrink-0 rounded bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-600 ">
            {meta.label}
          </span>
          <span className="truncate text-sm font-medium">
            {index + 1}. {name}
          </span>
          {!section.enabled && <span className="shrink-0 text-xs text-amber-700">hidden</span>}
        </button>

        <button
          type="button"
          className={iconButton}
          onClick={() => onChange({ ...section, enabled: !section.enabled })}
          aria-label={section.enabled ? `Hide ${name} from the page` : `Show ${name} on the page`}
          title={section.enabled ? 'Visible on the page' : 'Hidden from the page'}
        >
          {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button
          type="button"
          className={iconButton}
          disabled={index === 0}
          onClick={() => onMove(-1)}
          aria-label={`Move ${name} up`}
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={iconButton}
          disabled={index === total - 1}
          onClick={() => onMove(1)}
          aria-label={`Move ${name} down`}
        >
          <ArrowDown className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={iconButton}
          onClick={onDuplicate}
          aria-label={`Duplicate ${name}`}
          title="Duplicate"
        >
          <CopyPlus className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={`${iconButton} hover:text-red-700`}
          onClick={onRemove}
          aria-label={`Delete ${name}`}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div id={`section-body-${section.id}`} className="space-y-4 border-t border-gray-200 p-4 ">
          <p className="text-xs text-gray-500">{meta.help}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Section title" hint="Shown to visitors. Leave empty for no heading.">
              <input
                aria-label="Section title"
                className={inputClass}
                value={section.title}
                maxLength={200}
                onChange={(event) => onChange({ ...section, title: event.target.value })}
              />
            </Field>

            <div className="flex items-end pb-1">
              <Checkbox
                checked={section.showTitle}
                onChange={(showTitle) => onChange({ ...section, showTitle })}
              >
                Show the title on the page
              </Checkbox>
            </div>
          </div>

          {section.type !== 'content' && (
            <div>
              <label className={labelClass}>Intro text (optional)</label>
              <textarea
                aria-label="Intro text"
                rows={2}
                maxLength={2000}
                className={inputClass}
                value={section.description}
                onChange={(event) => onChange({ ...section, description: event.target.value })}
              />
            </div>
          )}

          {renderEditor()}
        </div>
      )}
    </li>
  );
}
