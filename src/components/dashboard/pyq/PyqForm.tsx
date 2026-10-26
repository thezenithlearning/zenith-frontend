'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, FileUp, Loader2, Save, X } from 'lucide-react';
import RichTextEditor from '@/components/dashboard/RichTextEditor';
import PublishPanel, { type PublishState } from '@/components/dashboard/content/PublishPanel';
import CategorySelect from '@/components/dashboard/content/CategorySelect';
import { inputClass } from '@/components/dashboard/content/ListParts';
import {
  buildPyqFormData,
  useCreatePyqMutation,
  useUpdatePyqMutation,
  type IPyq,
} from '@/features/pyq/api/pyqApi';
import { errorMessage, fromLocalInput, toLocalInput } from '@/features/content/types';

const MAX_PDF_MB = 50;

const formatSize = (bytes?: number) =>
  !bytes ? '' : bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

export default function PyqForm({ pyq }: { pyq?: IPyq }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [createPyq, { isLoading: creating }] = useCreatePyqMutation();
  const [updatePyq, { isLoading: updating }] = useUpdatePyqMutation();

  const [title, setTitle] = useState(pyq?.title ?? '');
  const [slug, setSlug] = useState(pyq?.slug ?? '');
  const [description, setDescription] = useState(pyq?.description ?? '');
  const [category, setCategory] = useState(pyq?.category?._id ?? '');
  const [examName, setExamName] = useState(pyq?.examName ?? '');
  const [year, setYear] = useState(pyq?.year ? String(pyq.year) : '');
  const [keywords, setKeywords] = useState(pyq?.keywords?.join(', ') ?? '');
  const [seoTitle, setSeoTitle] = useState(pyq?.seoTitle ?? '');
  const [seoDescription, setSeoDescription] = useState(pyq?.seoDescription ?? '');
  const [pdf, setPdf] = useState<File | null>(null);
  const [publish, setPublish] = useState<PublishState>({
    status: pyq?.status ?? 'published',
    publishAt: toLocalInput(pyq?.publishAt),
  });
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const busy = creating || updating;

  const pickFile = (file?: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are allowed.');
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setError(`The PDF must be ${MAX_PDF_MB} MB or smaller.`);
      return;
    }
    setError('');
    setPdf(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (title.trim().length < 3) return setError('Enter a title (at least 3 characters).');
    if (!category) return setError('Choose the course category for this PYQ.');
    if (!pyq && !pdf) return setError('Upload the PYQ PDF file.');

    const publishAt = fromLocalInput(publish.publishAt);
    if (publish.status === 'scheduled' && !publishAt) {
      return setError('Pick a date and time for scheduled publishing.');
    }

    const values = {
      title: title.trim(),
      slug: slug.trim(),
      description,
      category,
      examName: examName.trim(),
      year: year.trim(),
      keywords,
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      status: publish.status,
      ...(publish.status === 'scheduled' ? { publishAt } : {}),
    };
    const body = buildPyqFormData(values, pdf);

    try {
      if (pyq) await updatePyq({ id: pyq._id, body }).unwrap();
      else await createPyq(body).unwrap();
      router.push('/dashboard/pyqs');
    } catch (err) {
      setError(errorMessage(err, 'Could not save the PYQ'));
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pyqs"
            aria-label="Back to PYQs"
            className="rounded-xl bg-white p-2 text-gray-600 shadow-sm transition-all hover:text-indigo-600 hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pyq ? 'Edit PYQ' : 'New PYQ'}</h1>
            <p className="text-sm text-gray-500">Visitors unlock the PDF after filling the lead form.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-cyan-700 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {publish.status === 'draft' ? 'Save draft' : publish.status === 'scheduled' ? 'Schedule PYQ' : pyq ? 'Save & publish' : 'Publish PYQ'}
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <label htmlFor="pyq-title" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Title
              </label>
              <input
                id="pyq-title"
                value={title}
                maxLength={200}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. IB Physics HL Paper 1 – 2024 Past Paper"
                className={inputClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pyq-exam" className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Exam name <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input id="pyq-exam" value={examName} onChange={(e) => setExamName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="pyq-year" className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Year <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  id="pyq-year"
                  type="number"
                  min={1950}
                  max={2100}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-gray-700">Description</span>
              <RichTextEditor value={description} onChange={setDescription} placeholder="Describe this paper…" />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold text-gray-900">PYQ PDF</h2>
            <p className="mb-4 text-xs text-gray-500">PDF only, up to {MAX_PDF_MB} MB.</p>

            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />

            {pdf ? (
              <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                <FileText className="h-8 w-8 shrink-0 text-indigo-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{pdf.name}</p>
                  <p className="text-xs text-gray-500">{formatSize(pdf.size)} · new file will replace the current one</p>
                </div>
                <button
                  type="button"
                  aria-label="Remove selected file"
                  onClick={() => setPdf(null)}
                  className="rounded-lg p-1.5 text-gray-500 hover:bg-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                {pyq?.pdf && (
                  <div className="mb-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <FileText className="h-8 w-8 shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {pyq.pdf.originalName ?? 'Current PDF'}
                      </p>
                      <p className="text-xs text-gray-500">{formatSize(pyq.pdf.size)} · current file</p>
                    </div>
                    {pyq.pdf.url && (
                      <a href={pyq.pdf.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-indigo-600 hover:underline">
                        Open
                      </a>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    pickFile(e.dataTransfer.files?.[0]);
                  }}
                  className={`flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                    dragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                  }`}
                >
                  <FileUp className="h-8 w-8 text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-800">
                    {pyq ? 'Replace PDF' : 'Click to upload or drag & drop'}
                  </span>
                  <span className="text-xs text-gray-500">PDF · max {MAX_PDF_MB} MB</span>
                </button>
              </>
            )}
          </section>

          <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-sm font-bold text-gray-900">SEO</h2>
            <div>
              <label htmlFor="pyq-seo-title" className="mb-1.5 block text-sm font-semibold text-gray-700">
                SEO title
              </label>
              <input id="pyq-seo-title" value={seoTitle} maxLength={200} onChange={(e) => setSeoTitle(e.target.value)} className={inputClass} />
              <p className="mt-1 text-xs text-gray-500">{seoTitle.length}/60 recommended</p>
            </div>
            <div>
              <label htmlFor="pyq-seo-desc" className="mb-1.5 block text-sm font-semibold text-gray-700">
                SEO description
              </label>
              <textarea
                id="pyq-seo-desc"
                rows={3}
                value={seoDescription}
                maxLength={400}
                onChange={(e) => setSeoDescription(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-gray-500">{seoDescription.length}/160 recommended</p>
            </div>
            <div>
              <label htmlFor="pyq-keywords" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Keywords
              </label>
              <input
                id="pyq-keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="ib physics, past paper, 2024 (comma separated)"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="pyq-slug" className="mb-1.5 block text-sm font-semibold text-gray-700">
                URL slug <span className="font-normal text-gray-400">(auto-generated if blank)</span>
              </label>
              <input
                id="pyq-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
                placeholder="ib-physics-hl-paper-1-2024"
                className={inputClass}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <PublishPanel value={publish} onChange={setPublish} />
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <label htmlFor="pyq-category" className="mb-1.5 block text-sm font-semibold text-gray-700">
              Course category
            </label>
            <CategorySelect id="pyq-category" value={category} onChange={setCategory} />
          </div>
        </aside>
      </div>
    </form>
  );
}
