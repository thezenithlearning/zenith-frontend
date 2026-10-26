'use client';

import { useState } from 'react';
import { Eye, Plus } from 'lucide-react';

import { Notice } from '@/components/dashboard/page/ui/Notice';
import { cardClass, primaryButton, secondaryButton } from '@/components/dashboard/page/ui/styles';

import {
  SECTION_META,
  SECTION_TYPES,
  cloneSection,
  createSection,
  type Section,
  type SectionType,
} from '@/features/page/utils/sections';

import { moveItem } from './fields';
import { FileHelperPanel } from './FileHelperPanel';
import { SectionCard } from './SectionCard';

interface SectionBuilderProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
  /** Folder under the "pages" storage module (the page slug). */
  onPreview: () => void;
}

/**
 * Ordered list of page sections. The order here is the order visitors see.
 * Reorder with the arrows (keyboard friendly) or by dragging the handle.
 */
export function SectionBuilder({ sections, onChange, onPreview }: SectionBuilderProps) {
  // Only one section is open at a time: the rich editors are heavy.
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function add(type: SectionType) {
    const section = createSection(type);

    onChange([...sections, section]);
    setOpenId(section.id);
  }

  function replace(index: number, section: Section) {
    onChange(sections.map((item, position) => (position === index ? section : item)));
  }

  function remove(index: number) {
    const target = sections[index];

    if (
      !window.confirm(
        `Delete “${target.title.trim() || SECTION_META[target.type].label}”? This cannot be undone until you leave without saving.`,
      )
    ) {
      return;
    }

    onChange(sections.filter((_, position) => position !== index));
  }

  function duplicate(index: number) {
    const copy = cloneSection(sections[index]);

    copy.title = copy.title ? `${copy.title} (copy)` : '';

    const next = [...sections];

    next.splice(index + 1, 0, copy);
    onChange(next);
    setOpenId(copy.id);
  }

  function drop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;

    const next = [...sections];
    const [moved] = next.splice(dragIndex, 1);

    next.splice(targetIndex, 0, moved);
    onChange(next);
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 ">Page design</h2>
          <p className="text-sm text-gray-500">
            Add sections and arrange them. Visitors see them in this exact order.
          </p>
        </div>

        <button type="button" className={primaryButton} onClick={onPreview}>
          <Eye className="h-4 w-4" />
          Preview page
        </button>
      </div>

      <FileHelperPanel />

      {sections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 px-4 py-10 text-center ">
          <p className="text-sm text-gray-600 ">
            This page has no sections yet. Add your first module below.
          </p>
        </div>
      ) : (
        <ol className="space-y-3" aria-label="Page sections in display order">
          {sections.map((section, index) => (
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              total={sections.length}
              open={openId === section.id}
              isDragging={dragIndex === index}
              isDropTarget={overIndex === index && dragIndex !== null && dragIndex !== index}
              onToggleOpen={() =>
                setOpenId((current) => (current === section.id ? null : section.id))
              }
              onChange={(next) => replace(index, next)}
              onMove={(direction) => onChange(moveItem(sections, index, direction))}
              onDuplicate={() => duplicate(index)}
              onRemove={() => remove(index)}
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragOver={(event) => {
                if (dragIndex === null) return;

                event.preventDefault();
                setOverIndex(index);
              }}
              onDrop={() => drop(index)}
            />
          ))}
        </ol>
      )}

      <div className={`${cardClass} p-4`}>
        <p className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Plus className="h-4 w-4" />
          Add a module
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SECTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => add(type)}
              className={`${secondaryButton} h-auto flex-col items-start gap-0.5 px-3 py-2 text-left`}
            >
              <span className="font-medium">{SECTION_META[type].label}</span>
              <span className="text-xs font-normal text-gray-500">{SECTION_META[type].help}</span>
            </button>
          ))}
        </div>
      </div>

      {sections.some((section) => !section.enabled) && (
        <Notice tone="success">
          Hidden sections stay in the builder but are not shown to visitors.
        </Notice>
      )}
    </div>
  );
}
