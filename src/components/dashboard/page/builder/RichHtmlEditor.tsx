'use client';

import RichTextEditor from '@/components/dashboard/RichTextEditor';

interface RichHtmlEditorProps {
  html: string;
  onChange: (html: string) => void;
}

/**
 * Visual + source-code HTML editor for a section. It is the same CKEditor
 * wrapper used for blog and course content, so image uploads go through the
 * shared /files endpoint. Mount it only while its section is open.
 */
export function RichHtmlEditor({ html, onChange }: RichHtmlEditorProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <RichTextEditor
        value={html}
        onChange={onChange}
        placeholder="Write the content of this section…"
      />
    </div>
  );
}
