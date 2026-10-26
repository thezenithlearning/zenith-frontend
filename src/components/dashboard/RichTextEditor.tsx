'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type EditorMarks = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  orderedList: boolean;
  unorderedList: boolean;
  superscript: boolean;
  subscript: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
};

const EMPTY_MARKS: EditorMarks = {
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  orderedList: false,
  unorderedList: false,
  superscript: false,
  subscript: false,
  align: 'left',
};

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing your blog content...',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const lastEmittedHtmlRef = useRef(value);

  const [sourceMode, setSourceMode] = useState(false);
  const [sourceHtml, setSourceHtml] = useState(value);
  const [activeBlock, setActiveBlock] = useState('P');
  const [marks, setMarks] = useState<EditorMarks>(EMPTY_MARKS);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  const getCleanHtml = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return sourceHtml;

    const clone = editor.cloneNode(true) as HTMLDivElement;
    clone.querySelectorAll('[data-editor-label]').forEach((node) => {
      node.removeAttribute('data-editor-label');
    });

    return clone.innerHTML;
  }, [sourceHtml]);

  const updateCounts = useCallback((html?: string) => {
    const holder = document.createElement('div');
    holder.innerHTML = html ?? getCleanHtml();
    const text = (holder.textContent || '').replace(/\u00a0/g, ' ').trim();
    setCharacterCount(text.length);
    setWordCount(text ? text.split(/\s+/).filter(Boolean).length : 0);
  }, [getCleanHtml]);

  const decorateBlocks = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    Array.from(editor.children).forEach((element, index) => {
      const tag = element.tagName.toUpperCase();
      element.setAttribute('data-editor-label', `${index + 1} · ${tag}`);
    });
  }, []);

  const emitChange = useCallback(() => {
    decorateBlocks();
    const cleanHtml = getCleanHtml();
    lastEmittedHtmlRef.current = cleanHtml;
    setSourceHtml(cleanHtml);
    updateCounts(cleanHtml);
    onChange(cleanHtml);
  }, [decorateBlocks, getCleanHtml, onChange, updateCounts]);

  const saveSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;

    editor.focus();
    if (savedRangeRef.current && editor.contains(savedRangeRef.current.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }
  }, []);

  const updateActiveState = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0 || !selection.anchorNode) return;
    if (!editor.contains(selection.anchorNode)) return;

    saveSelection();

    const node = selection.anchorNode.nodeType === Node.ELEMENT_NODE
      ? (selection.anchorNode as Element)
      : selection.anchorNode.parentElement;
    const block = node?.closest('h1,h2,h3,h4,h5,h6,p,blockquote,pre,li,div');
    setActiveBlock(block?.tagName.toUpperCase() || 'P');

    try {
      const align: EditorMarks['align'] = document.queryCommandState('justifyCenter')
        ? 'center'
        : document.queryCommandState('justifyRight')
          ? 'right'
          : document.queryCommandState('justifyFull')
            ? 'justify'
            : 'left';

      setMarks({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        orderedList: document.queryCommandState('insertOrderedList'),
        unorderedList: document.queryCommandState('insertUnorderedList'),
        superscript: document.queryCommandState('superscript'),
        subscript: document.queryCommandState('subscript'),
        align,
      });
    } catch {
      // Some browsers can throw for queryCommandState while selection is transitioning.
    }
  }, [saveSelection]);

  useEffect(() => {
    if (sourceMode) return;
    const editor = editorRef.current;
    if (!editor) return;

    if (value !== lastEmittedHtmlRef.current || editor.innerHTML === '') {
      editor.innerHTML = value || '';
      lastEmittedHtmlRef.current = value;
      setSourceHtml(value);
      decorateBlocks();
      updateCounts(value);
    }
  }, [value, sourceMode, decorateBlocks, updateCounts]);

  useEffect(() => {
    const handleSelectionChange = () => updateActiveState();
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateActiveState]);

  const runCommand = (command: string, commandValue?: string) => {
    if (sourceMode) return;
    restoreSelection();
    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand(command, false, commandValue);
    saveSelection();
    updateActiveState();
    emitChange();
  };

  const formatBlock = (tag: string) => {
    runCommand('formatBlock', `<${tag.toLowerCase()}>`);
    setActiveBlock(tag.toUpperCase());
  };

  const insertHtml = (html: string) => {
    restoreSelection();
    document.execCommand('insertHTML', false, html);
    emitChange();
  };

  const insertLink = () => {
    restoreSelection();
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';
    const url = window.prompt('Enter link URL (https://...)');
    if (!url) return;

    if (selectedText) {
      document.execCommand('createLink', false, url);
    } else {
      const label = window.prompt('Link text', url) || url;
      insertHtml(`<a href="${url.replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer">${label.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</a>`);
      return;
    }

    emitChange();
  };

  const insertImageFromUrl = () => {
    const url = window.prompt('Enter image URL');
    if (!url) return;
    const alt = window.prompt('Image alt text (recommended for SEO/accessibility)') || '';
    insertHtml(
      `<figure><img src="${url.replace(/"/g, '&quot;')}" alt="${alt.replace(/"/g, '&quot;')}" style="max-width:100%;height:auto;border-radius:12px;" /><figcaption>Image caption</figcaption></figure><p><br></p>`,
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.alert('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || '');
      if (!src) return;
      restoreSelection();
      insertHtml(
        `<figure><img src="${src}" alt="" style="max-width:100%;height:auto;border-radius:12px;" /><figcaption>Image caption</figcaption></figure><p><br></p>`,
      );
    };
    reader.readAsDataURL(file);
  };

  const insertTable = () => {
    const rows = Math.min(10, Math.max(1, Number(window.prompt('Rows (1-10)', '3')) || 0));
    if (!rows) return;
    const columns = Math.min(8, Math.max(1, Number(window.prompt('Columns (1-8)', '3')) || 0));
    if (!columns) return;

    const header = `<tr>${Array.from({ length: columns }, (_, index) => `<th>Heading ${index + 1}</th>`).join('')}</tr>`;
    const body = Array.from({ length: Math.max(0, rows - 1) }, () =>
      `<tr>${Array.from({ length: columns }, () => '<td>Cell</td>').join('')}</tr>`,
    ).join('');

    insertHtml(`<table><thead>${header}</thead><tbody>${body}</tbody></table><p><br></p>`);
  };

  const toggleSourceMode = () => {
    if (!sourceMode) {
      const cleanHtml = getCleanHtml();
      setSourceHtml(cleanHtml);
      setSourceMode(true);
      return;
    }

    lastEmittedHtmlRef.current = sourceHtml;
    onChange(sourceHtml);
    setSourceMode(false);
    window.setTimeout(() => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.innerHTML = sourceHtml;
      decorateBlocks();
      updateCounts(sourceHtml);
    }, 0);
  };

  const handleVisualInput = () => {
    decorateBlocks();
    emitChange();
  };

  const handleVisualPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const html = event.clipboardData.getData('text/html');
    const text = event.clipboardData.getData('text/plain');

    if (!html) return;
    event.preventDefault();

    const container = document.createElement('div');
    container.innerHTML = html;
    container.querySelectorAll('script,style,iframe,object,embed').forEach((node) => node.remove());
    container.querySelectorAll('*').forEach((node) => {
      Array.from(node.attributes).forEach((attribute) => {
        if (/^on/i.test(attribute.name)) node.removeAttribute(attribute.name);
      });
    });

    document.execCommand('insertHTML', false, container.innerHTML || text);
    emitChange();
  };

  const toolbarButton = (active = false) =>
    `h-9 min-w-9 px-2.5 rounded-lg border text-xs font-semibold transition-colors ${
      active
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
    }`;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm">
      <style>{`
        .qf-editor-surface {
          height: min(62vh, 620px);
          min-height: 460px;
          max-height: 620px;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          scrollbar-gutter: stable;
          box-sizing: border-box;
          padding: 28px 28px 48px 92px;
          outline: none;
          color: #111827;
          line-height: 1.75;
          overflow-wrap: anywhere;
        }
        .qf-editor-surface:empty::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        .qf-editor-surface > * {
          position: relative;
        }
        .qf-editor-surface > *::before {
          content: attr(data-editor-label);
          position: absolute;
          left: -78px;
          top: 0.35em;
          width: 66px;
          text-align: right;
          font: 600 10px/1.25 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          letter-spacing: .02em;
          color: #94a3b8;
          user-select: none;
          pointer-events: none;
        }
        .qf-editor-surface h1 { font-size: 2.25rem; line-height: 1.15; font-weight: 800; margin: 1.4em 0 .6em; }
        .qf-editor-surface h2 { font-size: 1.875rem; line-height: 1.2; font-weight: 750; margin: 1.3em 0 .55em; }
        .qf-editor-surface h3 { font-size: 1.5rem; line-height: 1.3; font-weight: 700; margin: 1.2em 0 .5em; }
        .qf-editor-surface h4 { font-size: 1.25rem; line-height: 1.35; font-weight: 700; margin: 1.1em 0 .45em; }
        .qf-editor-surface h5 { font-size: 1.125rem; font-weight: 700; margin: 1em 0 .4em; }
        .qf-editor-surface h6 { font-size: 1rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; margin: 1em 0 .4em; }
        .qf-editor-surface p { margin: .65em 0; }
        .qf-editor-surface ul { list-style: disc; padding-left: 1.5rem; margin: .75em 0; }
        .qf-editor-surface ol { list-style: decimal; padding-left: 1.5rem; margin: .75em 0; }
        .qf-editor-surface blockquote { border-left: 4px solid #bfdbfe; padding: .75rem 1rem; margin: 1rem 0; background: #eff6ff; color: #374151; }
        .qf-editor-surface pre { white-space: pre-wrap; background: #111827; color: #f9fafb; padding: 1rem; border-radius: .75rem; overflow-x: auto; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .qf-editor-surface a { color: #2563eb; text-decoration: underline; }
        .qf-editor-surface figure { margin: 1.25rem 0; }
        .qf-editor-surface figcaption { color: #6b7280; text-align: center; font-size: .875rem; margin-top: .4rem; }
        .qf-editor-surface table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        .qf-editor-surface th, .qf-editor-surface td { border: 1px solid #d1d5db; padding: .65rem .75rem; text-align: left; vertical-align: top; }
        .qf-editor-surface th { background: #f3f4f6; font-weight: 700; }
        .qf-editor-surface hr { border: 0; border-top: 1px solid #d1d5db; margin: 1.5rem 0; }
        @media (max-width: 640px) {
          .qf-editor-surface {
            height: 55vh;
            min-height: 360px;
            padding-left: 62px;
            padding-right: 18px;
          }
          .qf-editor-surface > *::before { left: -54px; width: 46px; font-size: 9px; }
        }
      `}</style>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      <div className="border-b border-gray-200 bg-gray-50/80 p-3">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <select
            value={['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'BLOCKQUOTE', 'PRE'].includes(activeBlock) ? activeBlock : 'P'}
            onChange={(event) => formatBlock(event.target.value)}
            disabled={sourceMode}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-blue-500"
            title="Block type"
          >
            <option value="P">Paragraph (P)</option>
            <option value="H1">Heading 1 (H1)</option>
            <option value="H2">Heading 2 (H2)</option>
            <option value="H3">Heading 3 (H3)</option>
            <option value="H4">Heading 4 (H4)</option>
            <option value="H5">Heading 5 (H5)</option>
            <option value="H6">Heading 6 (H6)</option>
            <option value="BLOCKQUOTE">Quote</option>
            <option value="PRE">Code block</option>
          </select>

          <span className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-2 text-[11px] font-bold text-blue-700">
            Current: {activeBlock}
          </span>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <button type="button" className={toolbarButton(marks.bold)} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('bold')} title="Bold (Ctrl+B)">B</button>
          <button type="button" className={`${toolbarButton(marks.italic)} italic`} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('italic')} title="Italic (Ctrl+I)">I</button>
          <button type="button" className={`${toolbarButton(marks.underline)} underline`} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('underline')} title="Underline (Ctrl+U)">U</button>
          <button type="button" className={`${toolbarButton(marks.strikeThrough)} line-through`} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('strikeThrough')} title="Strikethrough">S</button>
          <button type="button" className={toolbarButton(marks.superscript)} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('superscript')} title="Superscript">x²</button>
          <button type="button" className={toolbarButton(marks.subscript)} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('subscript')} title="Subscript">x₂</button>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <select
            defaultValue="3"
            onChange={(event) => runCommand('fontSize', event.target.value)}
            disabled={sourceMode}
            className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700"
            title="Font size"
          >
            <option value="1">10px</option>
            <option value="2">13px</option>
            <option value="3">16px</option>
            <option value="4">18px</option>
            <option value="5">24px</option>
            <option value="6">32px</option>
            <option value="7">48px</option>
          </select>

          <select
            defaultValue="Arial"
            onChange={(event) => runCommand('fontName', event.target.value)}
            disabled={sourceMode}
            className="h-9 max-w-32 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700"
            title="Font family"
          >
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times</option>
            <option value="Verdana">Verdana</option>
            <option value="Trebuchet MS">Trebuchet</option>
            <option value="Courier New">Courier</option>
          </select>

          <label className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-medium text-gray-600" title="Text color">
            Text
            <input type="color" defaultValue="#111827" className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0" onChange={(event) => runCommand('foreColor', event.target.value)} disabled={sourceMode} />
          </label>
          <label className="flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-medium text-gray-600" title="Highlight color">
            Mark
            <input type="color" defaultValue="#fff59d" className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0" onChange={(event) => runCommand('hiliteColor', event.target.value)} disabled={sourceMode} />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={toolbarButton(marks.align === 'left')} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('justifyLeft')} title="Align left">Left</button>
          <button type="button" className={toolbarButton(marks.align === 'center')} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('justifyCenter')} title="Align center">Center</button>
          <button type="button" className={toolbarButton(marks.align === 'right')} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('justifyRight')} title="Align right">Right</button>
          <button type="button" className={toolbarButton(marks.align === 'justify')} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('justifyFull')} title="Justify">Justify</button>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <button type="button" className={toolbarButton(marks.unorderedList)} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('insertUnorderedList')} title="Bulleted list">• List</button>
          <button type="button" className={toolbarButton(marks.orderedList)} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('insertOrderedList')} title="Numbered list">1. List</button>
          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('outdent')} title="Decrease indent">Outdent</button>
          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('indent')} title="Increase indent">Indent</button>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={() => formatBlock('BLOCKQUOTE')} title="Block quote">Quote</button>
          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={() => formatBlock('PRE')} title="Code block">Code</button>
          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={insertLink} title="Insert link">Link</button>
          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('unlink')} title="Remove link">Unlink</button>
          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('insertHorizontalRule')} title="Horizontal rule">Rule</button>
          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={insertTable} title="Insert table">Table</button>
          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={insertImageFromUrl} title="Insert image from URL">Image URL</button>
          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={() => imageInputRef.current?.click()} title="Upload inline image">Upload image</button>

          <div className="mx-1 h-6 w-px bg-gray-300" />

          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('undo')} title="Undo">Undo</button>
          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('redo')} title="Redo">Redo</button>
          <button type="button" className={toolbarButton()} onMouseDown={(e) => e.preventDefault()} onClick={() => runCommand('removeFormat')} title="Clear inline formatting">Clear style</button>

          <button
            type="button"
            onClick={toggleSourceMode}
            className={`ml-auto h-9 rounded-lg border px-3 text-xs font-semibold transition-colors ${
              sourceMode
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {sourceMode ? 'Visual editor' : '</> Source'}
          </button>
        </div>
      </div>

      {sourceMode ? (
        <textarea
          value={sourceHtml}
          onChange={(event) => {
            const nextHtml = event.target.value;
            setSourceHtml(nextHtml);
            lastEmittedHtmlRef.current = nextHtml;
            updateCounts(nextHtml);
            onChange(nextHtml);
          }}
          spellCheck={false}
          className="min-h-[500px] w-full resize-y bg-gray-950 p-5 font-mono text-sm leading-6 text-gray-100 outline-none"
          placeholder="Paste or edit HTML source..."
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          className="qf-editor-surface"
          onInput={handleVisualInput}
          onMouseUp={updateActiveState}
          onKeyUp={updateActiveState}
          onFocus={() => {
            document.execCommand('defaultParagraphSeparator', false, 'p');
            document.execCommand('styleWithCSS', false, 'true');
            updateActiveState();
          }}
          onBlur={emitChange}
          onPaste={handleVisualPaste}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-gray-50 px-4 py-2 text-[11px] text-gray-500">
        <div className="flex items-center gap-3">
          <span><strong className="text-gray-700">{activeBlock}</strong> block</span>
          <span>{wordCount} words</span>
          <span>{characterCount} characters</span>
        </div>
        <span>Left gutter shows block number + semantic HTML tag. Bold/italic do not change the block type.</span>
      </div>
    </div>
  );
}
